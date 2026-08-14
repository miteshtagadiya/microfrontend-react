import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const roots = {};

window.rendersubapp1 = (containerId, history) => {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (roots[containerId]) {
    roots[containerId].render(<App history={history} />);
    return;
  }
  const root = createRoot(el);
  roots[containerId] = root;
  root.render(<App history={history} />);
};

window.unmountsubapp1 = (containerId) => {
  const root = roots[containerId];
  if (root) {
    root.unmount();
    delete roots[containerId];
  }
};

if (!document.getElementById("subapp1-container")) {
  const el = document.getElementById("root");
  if (el) {
    createRoot(el).render(<App />);
  }
}
