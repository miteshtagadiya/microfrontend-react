import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";

export default defineConfig({
  server: {
    port: 4001,
    strictPort: true,
    cors: true,
    origin: "http://localhost:4001",
  },
  preview: {
    port: 4001,
    strictPort: true,
    cors: true,
  },
  build: {
    target: "chrome89",
    cssCodeSplit: false,
  },
  plugins: [
    federation({
      name: "subapp1",
      filename: "remoteEntry.js",
      dts: false,
      exposes: {
        "./App": "./src/App.jsx",
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
      },
      bundleAllCSS: true,
    }),
    react(),
  ],
});
