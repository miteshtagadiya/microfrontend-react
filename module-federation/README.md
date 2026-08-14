# Module Federation demo

> Parent overview: [../README.md](../README.md)  
> Classic twin: [../asset-manifest](../asset-manifest)

Modern React micro-frontend monorepo using **Vite** and **Module Federation** (`@module-federation/vite`).

The **container** (host) owns shell UI and routing. **sub-app1** and **sub-app2** are independently built remotes. At runtime the host loads their exposed modules through `remoteEntry.js`. Shared `react` / `react-dom` stay **singletons** so remotes join the host React tree instead of shipping a second copy.

<p align="center">
  <img src="../microfrontend.gif" alt="Micro-frontend demo">
</p>

---

## Why this approach

| Benefit | Detail |
| --- | --- |
| Independent deploy | Remotes build/publish without rebuilding host source |
| Shared dependencies | One React instance → hooks and context work across boundary |
| Native ESM imports | `import("subapp1/App")` feels like a normal async component |
| Standalone remotes | Same `App` runs alone on `:4001` / `:4002` for fast local loops |
| Current ecosystem | Vite + official `@module-federation/vite` plugin |

Use this folder for **new applications** and for **existing apps** you can add a federation plugin to (or migrate host bundler to Vite).

---

## Architecture

| App | Role | Dev URL | Federation role |
| --- | --- | --- | --- |
| `container` | Host / shell | http://localhost:3000 | Declares `remotes`, lazy-imports them |
| `sub-app1` | Remote | http://localhost:4001 | Exposes `./App` as `subapp1/App` |
| `sub-app2` | Remote | http://localhost:4002 | Exposes `./App` as `subapp2/App` |

### Runtime sequence

1. Start host + remotes (or remotes alone for standalone UI).
2. Each remote serves **`/remoteEntry.js`** — the Module Federation contract.
3. User hits `/subapp1` or `/subapp2` on the host.
4. Host runs `lazy(() => import("subapp1/App"))` (or subapp2).
5. Federation runtime fetches remote entry, negotiates **shared** modules, loads exposed `./App`.
6. Remote React component renders inside the host tree under `<Suspense>`.
7. Leaving the route unmounts the lazy tree (normal React lifecycle).

### Stack

| Piece | Choice |
| --- | --- |
| Bundler | Vite 7 |
| Federation | `@module-federation/vite` |
| UI | React 19 |
| Host routing | React Router 7 |
| Monorepo | npm workspaces + `concurrently` |
| Node | >= 20.19 |

### What changed vs original CRA demo

| Before (CRA asset-manifest) | This folder (Vite + MF) |
| --- | --- |
| `react-scripts@3` | Vite |
| React 16 + `ReactDOM.render` | React 19 + `createRoot` |
| Fetch `asset-manifest.json` + inject `<script>` | `import("subapp1/App")` via `remoteEntry.js` |
| `window.rendersubapp*` | Exported React component |
| Manual CORS `setupProxy.js` | Vite `server.cors` + `origin` |

---

## Prerequisites

- Node.js **20.19+** (22 LTS fine)
- npm **10+**
- Free ports **3000**, **4001**, **4002**

---

## Quick start

From this folder:

```bash
npm install
npm run dev
```

From repo root:

```bash
npm run install:mf
npm run dev:mf
```

| URL | What you see |
| --- | --- |
| http://localhost:3000 | Host shell + nav |
| http://localhost:3000/subapp1 | Federated SubApp1 |
| http://localhost:3000/subapp2 | Federated SubApp2 |
| http://localhost:4001 | SubApp1 standalone |
| http://localhost:4002 | SubApp2 standalone |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start container + both remotes |
| `npm run dev:container` | Host only (remotes must already run) |
| `npm run dev:sub-app1` | Remote 1 only |
| `npm run dev:sub-app2` | Remote 2 only |
| `npm run build` | Production build (remotes first, then host) |
| `npm run preview` | Preview production builds on same ports |

---

## Project layout

```text
module-federation/
├── package.json                 # workspaces + concurrently
├── container/                   # HOST
│   ├── vite.config.js           # remotes → :4001 / :4002
│   ├── index.html
│   ├── README.md
│   └── src/
│       ├── main.jsx             # createRoot
│       ├── App.jsx              # routes + lazy remote imports
│       └── remotes.d.ts         # TS shims for remote modules
├── sub-app1/                    # REMOTE
│   ├── vite.config.js           # exposes ./App
│   ├── README.md
│   └── src/App.jsx
└── sub-app2/                    # REMOTE
    ├── vite.config.js
    ├── README.md
    └── src/App.jsx
```

App-level docs:

- [container/README.md](./container/README.md)
- [sub-app1/README.md](./sub-app1/README.md)
- [sub-app2/README.md](./sub-app2/README.md)

---

## Federation config (essentials)

### Remote (`sub-app1/vite.config.js`)

```js
federation({
  name: "subapp1",
  filename: "remoteEntry.js",
  dts: false,
  exposes: {
    "./App": "./src/App.jsx",
  },
  shared: {
    react: { singleton: true, requiredVersion: dependencies.react },
    "react/": {},
    "react-dom": { singleton: true, requiredVersion: dependencies["react-dom"] },
    "react-dom/": {},
  },
  bundleAllCSS: true,
});
```

Same pattern for `sub-app2` with `name: "subapp2"`.

### Host (`container/vite.config.js`)

```js
federation({
  name: "container",
  filename: "remoteEntry.js",
  dts: false,
  remotes: {
    subapp1: {
      type: "module",
      name: "subapp1",
      entry: "http://localhost:4001/remoteEntry.js",
      entryGlobalName: "subapp1",
      shareScope: "default",
    },
    subapp2: {
      type: "module",
      name: "subapp2",
      entry: "http://localhost:4002/remoteEntry.js",
      entryGlobalName: "subapp2",
      shareScope: "default",
    },
  },
  shared: {
    react: { singleton: true, requiredVersion: dependencies.react },
    "react/": {},
    "react-dom": { singleton: true, requiredVersion: dependencies["react-dom"] },
    "react-dom/": {},
  },
});
```

### Host consumption (`container/src/App.jsx`)

```jsx
const SubApp1 = lazy(() => import("subapp1/App"));
const SubApp2 = lazy(() => import("subapp2/App"));
```

---

## Integrating with a **new** app (copy this pattern)

1. Scaffold host + N remotes as separate Vite apps (or packages).
2. Copy federation `shared` blocks; keep React versions identical.
3. Expose only stable surfaces (`./App`, `./routes`, `./Widget`).
4. Host routes lazy-load remotes; wrap each in error boundary + Suspense fallback.
5. Per environment, change `remotes.*.entry` from localhost to CDN URLs.
6. CI: build/publish each remote independently; host build only needs entry URLs.

---

## Integrating with an **existing** Vite/React app

1. Add `@module-federation/vite` to the existing app (becomes host **or** remote).
2. **As host:** declare `remotes` pointing at new feature remotes; replace a route with `lazy(() => import("feature/App"))`.
3. **As remote:** add `exposes`, set `server.origin` / `cors`, deploy `remoteEntry.js` + assets.
4. Align React major versions; set `singleton: true`.
5. Ship behind a feature flag until the federated route is proven.

If the existing app is webpack-based, use `@module-federation/enhanced` / webpack `ModuleFederationPlugin` with the same expose/remote/share ideas — Vite host can still consume webpack remotes when entry types match.

---

## Production notes

1. Build remotes before (or with) the host — `npm run build` orders remotes first.
2. Replace localhost `entry` URLs with real deploy URLs (env-driven config recommended).
3. Keep React versions aligned; `singleton: true` avoids dual React / invalid hook call.
4. Set `server.origin` (dev) and correct `base`/public URLs (prod) so remote CSS/images resolve.
5. Add host-side fallback UI when `remoteEntry.js` 404s or network fails.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Endless “Loading…” | Remotes up? Network tab shows `remoteEntry.js` 200? |
| Invalid hook call / shared module errors | Same React version everywhere; `singleton: true`; include `react/` and `react-dom/` share keys |
| CORS errors | Remote `server.cors: true`; correct port |
| Port in use | Stop other demo (`asset-manifest`) or old Vite; free 3000/4001/4002 |
| Broken remote images/CSS in host | Check `origin` / absolute asset URLs on remote |

---

## License

See [LICENSE](../LICENSE).
