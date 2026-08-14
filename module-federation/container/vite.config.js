import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    origin: "http://localhost:3000",
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: "chrome89",
  },
  plugins: [
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
        react: {
          singleton: true,
          requiredVersion: dependencies.react,
        },
        "react/": {},
        "react-dom": {
          singleton: true,
          requiredVersion: dependencies["react-dom"],
        },
        "react-dom/": {},
        "react-router-dom": {
          singleton: true,
          requiredVersion: dependencies["react-router-dom"],
        },
      },
    }),
    react(),
  ],
});
