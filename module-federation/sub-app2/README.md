# sub-app2 (Module Federation remote)

Remote micro-frontend **#2** for the Vite + Module Federation demo.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

Mirror of [sub-app1](../sub-app1/README.md) with a second independent remote:

| Item | Value |
| --- | --- |
| Federation name | `subapp2` |
| Expose | `./App` → `src/App.jsx` |
| Host import | `subapp2/App` |
| Dev port | **4002** |
| Entry | http://localhost:4002/remoteEntry.js |

Use it to practice **multi-remote** hosts: two teams, two deploys, one shell.

---

## Run

```bash
# from module-federation/
npm run dev:sub-app2
npm run dev          # all apps
```

| URL | Mode |
| --- | --- |
| http://localhost:4002 | Standalone |
| http://localhost:3000/subapp2 | Inside host |

---

## Important files

| File | Purpose |
| --- | --- |
| `vite.config.js` | `name: "subapp2"`, exposes, shared, cors, origin |
| `src/App.jsx` | Remote UI (slightly different header styling vs sub-app1) |
| `src/main.jsx` | Standalone entry |

---

## Adding a third remote (pattern)

1. Copy `sub-app2` → `sub-app3`.
2. Change federation `name`, port, and expose as needed.
3. Register in host `vite.config.js` `remotes`.
4. Add host route + `lazy(() => import("subapp3/App"))`.

---

## Existing / new app usage

Same as sub-app1:

- **New feature team:** own this package, deploy `remoteEntry.js`, host only updates remote URL + route.
- **Extract from monolith:** move slice here, expose `./App`, strangler-replace the old route.

Details: [../README.md](../README.md) and [../../README.md](../../README.md).
