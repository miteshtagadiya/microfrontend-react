# sub-app1 (Module Federation remote)

Remote micro-frontend **#1** for the Vite + Module Federation demo.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

| Mode | Behavior |
| --- | --- |
| Standalone | Runs as normal Vite SPA on **http://localhost:4001** |
| Federated | Host imports `subapp1/App` via `remoteEntry.js` |

Expose contract:

```js
exposes: {
  "./App": "./src/App.jsx",
}
```

Host import id: **`subapp1/App`** (`name` + expose key).

---

## Run

```bash
# from module-federation/
npm run dev:sub-app1

# or full stack
npm run dev
```

| URL | Mode |
| --- | --- |
| http://localhost:4001 | Standalone |
| http://localhost:4001/remoteEntry.js | Federation entry (host consumes this) |
| http://localhost:3000/subapp1 | Inside host |

---

## Important files

| File | Purpose |
| --- | --- |
| `vite.config.js` | `federation` name `subapp1`, `exposes`, `shared`, `cors`, `origin` |
| `src/App.jsx` | UI exported to host and used standalone |
| `src/main.jsx` | Standalone bootstrap only |

### Shared deps (must match host)

```js
shared: {
  react: { singleton: true, requiredVersion: dependencies.react },
  "react/": {},
  "react-dom": { singleton: true, requiredVersion: dependencies["react-dom"] },
  "react-dom/": {},
}
```

`bundleAllCSS: true` helps remote styles appear when rendered inside the host.

---

## Use as a remote for an existing host

1. Keep this app (or clone pattern) as the feature package.
2. Deploy `dist/` so `remoteEntry.js` is reachable.
3. In the host, add:

```js
subapp1: {
  type: "module",
  name: "subapp1",
  entry: "https://your-cdn.example/sub-app1/remoteEntry.js",
}
```

4. `lazy(() => import("subapp1/App"))` on the target route.
5. Align React with the host.

---

## Extract a slice from an existing SPA into this remote

1. Move the feature components into `src/` here.
2. Expose `./App` (or `./Feature`).
3. Delete/replace the old route in the monolith with a federated import.
4. Verify standalone still works for the feature team.

---

## Troubleshooting

| Issue | Check |
| --- | --- |
| Host cannot load remote | Port 4001, CORS, `origin: http://localhost:4001` |
| Styles missing in host | `bundleAllCSS` / CSS imported from `App.jsx` |
| Duplicate React warnings | Matching versions + singleton shares |
