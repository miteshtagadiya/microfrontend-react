# sub-app1 (asset-manifest remote)

Remote micro-frontend **#1** using CRA + `react-app-rewired` + window mount API.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

| Mode | Behavior |
| --- | --- |
| Standalone | SPA on **http://localhost:4001** mounting `#root` |
| Embedded | Host injects this app’s JS/CSS; calls `window.rendersubapp1` |

### Window contract

```js
window.rendersubapp1(containerId, history)
window.unmountsubapp1(containerId)
```

Host container DOM id: **`subapp1-container`** (`name` + `-container`).

---

## Run

```bash
# from asset-manifest/
npm run start:sub-app1
npm start   # all apps
```

| URL | Purpose |
| --- | --- |
| http://localhost:4001 | Standalone UI |
| http://localhost:4001/asset-manifest.json | Host discovery file |
| http://localhost:3000/subapp1 | Embedded in host |

---

## Important files

| File | Purpose |
| --- | --- |
| `config-overrides.js` | Disable `splitChunks` / `runtimeChunk` for a simple manifest |
| `src/setupProxy.js` | `Access-Control-Allow-Origin: *` |
| `src/index.js` | `render` / `unmount` + standalone `createRoot` |
| `src/App.js` | UI; logo uses `REACT_APP_CONTENT_HOST` |
| `.env` | `PORT=4001`, `REACT_APP_CONTENT_HOST=http://localhost:4001` |

### Why `REACT_APP_CONTENT_HOST`?

When the JS runs inside the host origin (`localhost:3000`), relative `/static/media/...` would hit the host. Prefixing with the remote origin keeps images loading from `:4001`.

---

## Use an existing CRA app as this kind of remote

1. Add `react-app-rewired` + `config-overrides.js` (flatten chunks).
2. Change `package.json` scripts to `react-app-rewired start/build`.
3. Implement `window.renderMyApp` / `window.unmountMyApp` with `createRoot`.
4. Add CORS in `setupProxy.js` (dev) and on the static host (prod).
5. Set public/content host so static assets resolve when embedded.
6. Point the host `MicroFrontend` at your deploy URL.

---

## Extract a page from a monolith into this remote

1. Move the page components into this app’s `src/`.
2. Keep standalone working for the feature team.
3. Register the window mount API.
4. In the monolith host, replace the route with `<MicroFrontend name="subapp1" host={...} />`.
5. Remove or flag the old in-tree implementation.

---

## Troubleshooting

| Issue | Check |
| --- | --- |
| Host CORS errors | `setupProxy.js`, restart remote |
| Partial UI / missing chunk | Overrides applied? Inspect `asset-manifest.json` `entrypoints` |
| Logo 404 in host | `REACT_APP_CONTENT_HOST` |
| Unmount leaks | `unmountsubapp1` called; root removed from map |
