# Asset-manifest micro-frontends (classic CRA flow)

> Parent overview: [../README.md](../README.md)  
> Modern twin: [../module-federation](../module-federation)

<p align="center">
  <img src="../microfrontend.gif" alt="Micro-frontend demo">
</p>

Classic **runtime integration**: remotes publish CRA `asset-manifest.json`; the host fetches that manifest, injects CSS/JS tags, then calls `window.rendersubapp*` to mount into a DOM node.

Updated packages (vs original React 16 / `react-scripts@3` demo):

| Piece | Version |
| --- | --- |
| React / React DOM | 18.3 |
| Bundler | `react-scripts` **5.0.1** (webpack 5) |
| Remote tooling | `react-app-rewired` 2.x |
| Host routing | React Router 6 |
| Mount API | `createRoot` + tracked roots for unmount |

This flow is ideal for **learning** the original “manifest + script inject” pattern and for **existing CRA-shaped apps** where changing the host bundler is hard. For new greenfield production MFEs, prefer [Module Federation](../module-federation).

---

## Why this approach

| Benefit | Detail |
| --- | --- |
| Familiar CRA DX | `react-scripts` start/build, `.env`, `setupProxy` |
| Host stays simple | No federation plugin required on host — only fetch + DOM |
| Clear mount contract | Explicit `render` / `unmount` on `window` |
| Standalone remotes | Same bundle runs on its own port or inside host |
| Good teaching model | Makes runtime composition visible in Network tab |

**Trade-offs:** usually **duplicate React** per remote; weaker shared-dep story than Module Federation; CRA is maintenance-mode.

---

## Architecture

| App | Role | Dev URL | Contract |
| --- | --- | --- | --- |
| `container` | Host | http://localhost:3000 | `MicroFrontend` loads remotes |
| `sub-app1` | Remote | http://localhost:4001 | `asset-manifest.json` + `window.rendersubapp1` |
| `sub-app2` | Remote | http://localhost:4002 | `asset-manifest.json` + `window.rendersubapp2` |

### Runtime sequence

1. Remotes disable code splitting (`config-overrides.js`) → predictable `main.js` / `main.css` in the manifest.
2. Remotes add CORS headers (`src/setupProxy.js`) so the host on another origin/port can fetch the manifest and assets.
3. Remotes register:
   - `window.rendersubapp1(containerId, history)`
   - `window.unmountsubapp1(containerId)`  
   (and the `subapp2` pair).
4. Host route renders `<MicroFrontend name="subapp1" host={REACT_APP_SUBAPP1_HOST} />`.
5. `MicroFrontend` fetches `{host}/asset-manifest.json`, injects entry CSS/JS, then calls the window render function targeting `#subapp1-container`.
6. On unmount, host calls `window.unmountsubapp1(...)`.
7. If you open the remote alone (no host container node), it mounts on `#root`.

### Env vars

| App | Variable | Purpose |
| --- | --- | --- |
| container | `REACT_APP_SUBAPP1_HOST` | Base URL for remote 1 (e.g. `http://localhost:4001`) |
| container | `REACT_APP_SUBAPP2_HOST` | Base URL for remote 2 |
| sub-app1 | `REACT_APP_CONTENT_HOST` | Prefix for asset URLs when embedded in host |
| sub-app2 | `REACT_APP_CONTENT_HOST` | Same for remote 2 |

---

## Prerequisites

- Node.js **18+**
- npm **10+**
- Free ports **3000**, **4001**, **4002** (stop Module Federation demo first)

---

## Quick start

From this folder:

```bash
npm install
npm start
```

From repo root:

```bash
npm run install:am
npm run dev:am
```

| URL | What you see |
| --- | --- |
| http://localhost:3000 | Host shell |
| http://localhost:3000/subapp1 | Script-injected SubApp1 |
| http://localhost:3000/subapp2 | Script-injected SubApp2 |
| http://localhost:4001 | SubApp1 standalone |
| http://localhost:4002 | SubApp2 standalone |

### Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start container + both remotes |
| `npm run start:container` | Host only |
| `npm run start:sub-app1` | Remote 1 only |
| `npm run start:sub-app2` | Remote 2 only |
| `npm run build` | Production build (remotes then host) |

---

## Project layout

```text
asset-manifest/
├── package.json
├── container/
│   ├── .env                 # remote host URLs
│   ├── src/
│   │   ├── App.js           # routes
│   │   ├── MicroFrontend.js # manifest fetch + inject + render
│   │   └── index.js
│   └── README.md
├── sub-app1/
│   ├── config-overrides.js  # disable splitChunks
│   ├── .env                 # CONTENT_HOST + PORT
│   ├── src/
│   │   ├── index.js         # window.render/unmount + standalone
│   │   ├── setupProxy.js    # CORS
│   │   └── App.js
│   └── README.md
└── sub-app2/                # same shape as sub-app1, port 4002
```

---

## Key implementation pieces

### Disable code splitting (remote)

```js
// config-overrides.js
module.exports = function override(config) {
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: { default: false },
  };
  return config;
};
```

Without this, CRA emits many chunks and the host must load every entrypoint correctly.

### CORS (remote)

```js
// src/setupProxy.js
module.exports = function setupProxy(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
};
```

### Mount API (remote)

```js
window.rendersubapp1 = (containerId, history) => {
  const root = createRoot(document.getElementById(containerId));
  root.render(<App history={history} />);
};

window.unmountsubapp1 = (containerId) => {
  roots[containerId]?.unmount();
};
```

### Host loader

`MicroFrontend` loads `entrypoints` from `asset-manifest.json` (CRA 5 shape), injects CSS then JS, then invokes `window[`render${name}`]`.

---

## Integrating with a **new** CRA-style app

1. Create host + remotes with `react-scripts` 5 (or copy this workspace).
2. On each remote: `react-app-rewired` + splitChunks off + CORS + window mount API.
3. On host: copy `MicroFrontend`, point `.env` at remote bases, route to each remote name.
4. Use `REACT_APP_CONTENT_HOST` (or absolute public URL) so images/fonts resolve when embedded.
5. Prefer migrating to Module Federation once the team is comfortable with the boundaries.

---

## Integrating with an **existing** application

### Existing app as host

1. Add a route that renders a container DOM node.
2. Bring in `MicroFrontend` (or equivalent).
3. Point `host` at the remote’s deployed origin.
4. Ensure remote exposes CORS and a stable `render`/`unmount` pair.
5. Feature-flag the old in-tree page until the remote is trusted.

### Existing CRA app as remote

1. Add `react-app-rewired` override to flatten chunks (or teach the host to load all `entrypoints`).
2. Export `window.renderX` / `window.unmountX` using `createRoot`.
3. Set public asset prefix so `/static/media/...` hits the remote origin when running inside another host.
4. Deploy the `build/` folder; host fetches `/asset-manifest.json` from that deploy.

### React duplication warning

Each remote typically bundles its own React. That is OK if remotes **do not** share context/hooks with the host. If you need shared context, switch to Module Federation singletons or lift state via props/custom events.

---

## Production notes

1. Build remotes; host `REACT_APP_*_HOST` must point at production remote URLs (set at **host build time** for CRA).
2. Cache `asset-manifest.json` carefully — short TTL or hash-bust so clients see new remote deploys.
3. Always unmount on route change to avoid leaked roots.
4. Serve remotes over HTTPS with CORS in prod.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Host blank / remote never appears | Check Network: manifest 200? JS 200? Console: `render${name}` defined? |
| CORS error on manifest | `setupProxy.js` in remote; restart remote |
| Logo 404 inside host | `REACT_APP_CONTENT_HOST` must be remote origin |
| Port already in use | Stop `module-federation` demo / other process on 3000/4001/4002 |
| Multiple chunks / missing UI | Confirm `config-overrides.js` applied (`react-app-rewired`, not `react-scripts`, on remotes) |

---

## License

See [LICENSE](../LICENSE).
