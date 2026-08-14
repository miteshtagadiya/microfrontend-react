# container (asset-manifest host)

Host / shell for the classic CRA runtime-load demo.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

Loads remotes **without** Module Federation:

1. Read `REACT_APP_SUBAPP1_HOST` / `REACT_APP_SUBAPP2_HOST` from `.env`.
2. On `/subapp1` or `/subapp2`, render `<MicroFrontend name="…" host="…" />`.
3. `MicroFrontend` fetches `{host}/asset-manifest.json`, injects assets, calls `window.render{name}`.

| Concern | Host owns? |
| --- | --- |
| Nav + routes | Yes |
| Manifest fetch + script injection | Yes (`MicroFrontend.js`) |
| Remote business UI | No |

---

## Run

```bash
# from asset-manifest/
npm start
npm run start:container
```

- URL: **http://localhost:3000**
- Requires remotes on ports from `.env` (default 4001 / 4002)

### `.env`

```env
REACT_APP_SUBAPP1_HOST=http://localhost:4001
REACT_APP_SUBAPP2_HOST=http://localhost:4002
PORT=3000
```

CRA inlines `REACT_APP_*` at **build/start** time — change env → restart.

---

## Important files

| File | Purpose |
| --- | --- |
| `src/MicroFrontend.js` | Fetch manifest, inject CSS/JS, call `window.render*`, unmount on teardown |
| `src/App.js` | React Router 6 routes + nav |
| `src/index.js` | `createRoot` |
| `.env` | Remote base URLs |

### Mount lifecycle

```text
route enter  → MicroFrontend.componentDidMount → fetch → inject → window.rendersubappN
route leave  → componentWillUnmount → window.unmountsubappN
```

---

## Use with an existing host app

1. Copy `MicroFrontend.js` into the existing SPA (any React host that can render a component).
2. Add env (or config) for remote base URLs.
3. On the target route, render:

```jsx
<MicroFrontend name="subapp1" host={process.env.REACT_APP_SUBAPP1_HOST} />
```

4. Ensure the remote implements `window.rendersubapp1` / `window.unmountsubapp1` and CORS.
5. Feature-flag the old page until stable.

No webpack federation plugin required on the host — only runtime fetch/inject.

---

## Use as shell for a new CRA product

1. Keep this container as the shell.
2. Add remotes that follow the sub-app1/2 mount contract.
3. Add a route + env URL per remote.
4. Plan a later move to Module Federation if you need shared React/context.

---

## Troubleshooting

| Issue | Check |
| --- | --- |
| Remote never mounts | Manifest URL, CORS, `window.render*` exists after script load |
| Flash / double mount | Strict Mode double effects in dev — roots map in remote should reuse |
| Wrong remote assets | Host `.env` pointing at correct origin |

More: [../README.md](../README.md).
