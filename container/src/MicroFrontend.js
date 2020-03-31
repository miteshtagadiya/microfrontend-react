import React from 'react';

class MicroFrontend extends React.Component {
  componentDidMount() {
    const { name, host, document } = this.props;
    const scriptId = `micro-frontend-script-${name}`;

    if (document.getElementById(scriptId)) {
      this.renderMicroFrontend();
      return;
    }

    fetch(`${host}/asset-manifest.json`)
      .then(res => res.json())
      .then(manifest => {
        manifest["entrypoints"].map((entry => {
          if (typeof manifest["files"][entry] !== "undefined" && manifest["files"][entry] !== "undefined") {
            if (entry.endsWith('.css')) {
              const link = document.createElement('link');
              link.id = scriptId;
              link.href = `${process.env.NODE_ENV === "production" ? host.slice(0, host.lastIndexOf('/')) : host}${manifest["files"][entry]}`;
              link.onload = this.renderMicroFrontend;
              link.rel = "stylesheet"
              document.head.appendChild(link);
            }
            const script = document.createElement('script');
            script.id = scriptId;
            script.crossOrigin = '';
            script.src = `${process.env.NODE_ENV === "production" ? host.slice(0, host.lastIndexOf('/')) : host}${manifest["files"][entry]}`;
            script.onload = this.renderMicroFrontend;
            document.head.appendChild(script);
          }
        })
        )
        const script = document.createElement('script');
        script.id = scriptId;
        script.crossOrigin = '';
        script.src = `${process.env.NODE_ENV === "production" ? host.slice(0, host.lastIndexOf('/')) : host}${manifest["files"]["main.js"]}`;
        script.onload = this.renderMicroFrontend;
        document.head.appendChild(script);
        const link = document.createElement('link');
        link.id = scriptId;
        link.href = `${process.env.NODE_ENV === "production" ? host.slice(0, host.lastIndexOf('/')) : host}${manifest["files"]["main.css"]}`;
        link.onload = this.renderMicroFrontend;
        link.rel = "stylesheet"
        document.head.appendChild(link);
      });
  }

  componentWillUnmount() {
    const { name, window } = this.props;

    window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
  }

  renderMicroFrontend = () => {
    const { name, window, history } = this.props;

    window[`render${name}`] && window[`render${name}`](`${name}-container`, history);
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
