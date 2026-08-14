# container (Module Federation host)

Host / shell for the Vite + Module Federation demo.

Parent docs: [../README.md](../README.md) · Repo overview: [../../README.md](../../README.md)

---

## Role

| Concern | Owned by container? |
| --- | --- |
| Top nav + layout | Yes |
| Top-level routes (`/home`, `/subapp1`, `/subapp2`) | Yes |
| Feature UI for SubApp1/2 | No — loaded from remotes |
| Shared React instance | Yes (provides singleton via federation share scope) |

The host should stay thin: chrome, routing, remote loading, error/loading UI.

---

## Run

From `module-federation/`:

```bash
npm run dev                 # host + remotes
npm run dev:container       # host only (remotes must be up)
```

- URL: **http://localhost:3000**
- Expects remotes:
  - `http://localhost:4001/remoteEntry.js`
  - `http://localhost:4002/remoteEntry.js`

---

## Important files

| File | Purpose |
| --- | --- |
| `vite.config.js` | `federation({ remotes, shared })` |
| `src/App.jsx` | React Router + `lazy(() => import("subapp1/App"))` |
| `src/main.jsx` | `createRoot` bootstrap |
| `src/remotes.d.ts` | Module shims for `subapp1/App`, `subapp2/App` |

### How remotes are consumed

```jsx
const SubApp1 = lazy(() => import("subapp1/App"));
const SubApp2 = lazy(() => import("subapp2/App"));

// route:
<Suspense fallback={<Loading label="SubApp1" />}>
  <SubApp1 />
</Suspense>
```

Remote names (`subapp1`, `subapp2`) must match `remotes` keys in `vite.config.js`.

---

## Turn this into your existing app’s shell

1. Copy federation `remotes` + `shared` into your Vite host config (or add Vite alongside webpack MF).
2. Replace one route’s page component with a lazy remote import.
3. Point `entry` at the remote’s deployed `remoteEntry.js`.
4. Keep React versions aligned with remotes (`singleton: true`).
5. Add an error boundary around the remote route.

---

## Turn a new product shell into this

1. Start from this `container` package.
2. Add more `remotes` entries as teams create apps.
3. Add routes that lazy-load each expose.
4. Drive remote URLs from env (local vs staging vs prod).

---

## Troubleshooting

| Issue | Check |
| --- | --- |
| Infinite loading | Remote process running? `remoteEntry.js` 200? |
| Invalid hook call | React version mismatch / missing singleton share |
| Module not found `subapp1/App` | Remote `exposes` path + host `remotes` name |

See also [../README.md](../README.md) troubleshooting table.
