# sub-app2 (asset-manifest remote)

Remote micro-frontend **#2** — same classic CRA pattern as [sub-app1](../sub-app1/README.md), second port/name.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

| Item | Value |
| --- | --- |
| Window API | `window.rendersubapp2` / `window.unmountsubapp2` |
| Container id | `subapp2-container` |
| Dev port | **4002** |
| Manifest | http://localhost:4002/asset-manifest.json |
| Content host | `REACT_APP_CONTENT_HOST=http://localhost:4002` |

Demonstrates **two remotes** loaded by one host with the same MicroFrontend component (`name` prop switches the window function).

---

## Run

```bash
# from asset-manifest/
npm run start:sub-app2
npm start
```

| URL | Mode |
| --- | --- |
| http://localhost:4002 | Standalone |
| http://localhost:3000/subapp2 | Embedded |

---

## Important files

Same shape as sub-app1:

- `config-overrides.js` — no code splitting
- `src/setupProxy.js` — CORS
- `src/index.js` — mount/unmount + standalone
- `src/App.js` — UI (distinct header color)
- `.env` — port + content host

---

## Adding another remote

1. Copy this folder to `sub-app3`.
2. Rename window functions to `rendersubapp3` / `unmountsubapp3`.
3. Set `PORT` + `REACT_APP_CONTENT_HOST`.
4. Add `REACT_APP_SUBAPP3_HOST` on the container and a route using `name="subapp3"`.

---

## Existing / new app usage

Identical strategy to sub-app1:

- Existing CRA feature app → add mount API + CORS + flattened manifest → embed in any host that can inject scripts.
- New feature → start from this template; host only needs env URL + route.

Deep dive: [../README.md](../README.md) · Strategy: [../../README.md](../../README.md).
