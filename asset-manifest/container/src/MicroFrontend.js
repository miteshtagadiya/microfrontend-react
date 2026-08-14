import { Component } from "react";

function assetUrl(host, path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = host.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

function loadStylesheet(url, id) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[data-mf="${id}"][href="${url}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.dataset.mf = id;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

function loadScript(url, id) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[data-mf="${id}"][src="${url}"]`
    );
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.crossOrigin = "";
    script.dataset.mf = id;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

class MicroFrontend extends Component {
  componentDidMount() {
    this.mountRemote();
  }

  componentWillUnmount() {
    const { name, window: win = window } = this.props;
    const unmount = win[`unmount${name}`];
    if (typeof unmount === "function") {
      unmount(`${name}-container`);
    }
  }

  renderMicroFrontend = () => {
    const { name, history, window: win = window } = this.props;
    const render = win[`render${name}`];
    if (typeof render === "function") {
      render(`${name}-container`, history);
    }
  };

  mountRemote = async () => {
    const { name, host, document: doc = document } = this.props;
    const scriptId = `micro-frontend-${name}`;

    if (doc.querySelector(`script[data-mf="${scriptId}"]`)) {
      this.renderMicroFrontend();
      return;
    }

    try {
      const res = await fetch(`${host}/asset-manifest.json`);
      if (!res.ok) {
        throw new Error(`Failed to fetch manifest: ${res.status}`);
      }
      const manifest = await res.json();
      const entrypoints = manifest.entrypoints || [];

      const css = [];
      const js = [];

      entrypoints.forEach((entry) => {
        const fromFiles = manifest.files && manifest.files[entry];
        const path = fromFiles || entry;
        const url = assetUrl(host, path);
        if (!url) return;
        if (entry.endsWith(".css") || url.endsWith(".css")) css.push(url);
        else if (entry.endsWith(".js") || url.endsWith(".js")) js.push(url);
      });

      if (css.length === 0 && manifest.files?.["main.css"]) {
        css.push(assetUrl(host, manifest.files["main.css"]));
      }
      if (js.length === 0 && manifest.files?.["main.js"]) {
        js.push(assetUrl(host, manifest.files["main.js"]));
      }

      await Promise.all(css.map((url) => loadStylesheet(url, scriptId)));
      for (const url of js) {
        await loadScript(url, scriptId);
      }
      this.renderMicroFrontend();
    } catch (error) {
      console.error(`[MicroFrontend:${name}]`, error);
    }
  };

  render() {
    return <main id={`${this.props.name}-container`} />;
  }
}

MicroFrontend.defaultProps = {
  document,
  window,
};

export default MicroFrontend;
