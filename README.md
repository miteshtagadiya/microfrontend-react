# microfrontend-react
Micro Front-end react apps created by Create-React-App

Micro-frontend architecture is a design approach in which a front-end app is decomposed into individual, semi-independent “microapps” working loosely together.

Th applications are loaded into a micro-frontend container. The container runs it as of the micro frontend is its own component and provides seamless workflow to users.


### This is the workflow of how micro front-ends work:
- Launch container app.
- Launch sub-app1 and sub-app2 applications on specific ports.
- Based on the URL, the Container will route to one of the micro front-ends.
- The selected micro front-end goes to the specific port to fetch the application’s asset-manifest.json. From this JSON file, the included main.js is put on a script tag and loaded.
- A manifest file contains a mapping of all asset filenames.
- Container app passes the containerId and history for its micro front-ends to be rendered.

### Start creating micro front-end apps:
- Install "react-app-rewired" — This allows customizing the app without ejecting app.
```jsx
npm i --save react-app-rewired
```
- Modify package.json to set port and use "react-app-rewired" in sub-apps.
```jsx
 "scripts": {
   "start": "PORT=4001 react-app-rewired start",
   "build": "react-app-rewired build",
   "test": "react-app-rewired test",
   "eject": "react-app-rewired eject"
 },
```
- Add config-overrides.js to disable code splitting. By default, code splitting is enabled. An application is split into several chunks that can be loaded onto the page independently. You can see http://localhost:4001/asset-manifest.json before adding react-app-rewired. It clearly shows the app has been chunked.
```jsx
//config-overrides.js
module.exports = {
  webpack: (config, env) => {
    config.optimization.runtimeChunk = false;
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    return config;
  },
};
```
- Make changes in src/index.js to define render and unmount functions.
```jsx
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// render micro frontend function
window.rendersubapp1 = (containerId, history) => {
  ReactDOM.render(
    <App history={history} />,
    document.getElementById(containerId)
  );
  serviceWorker.unregister();
};

// unmount micro frontend function
window.unmountsubapp1 = containerId => {
  ReactDOM.unmountComponentAtNode(document.getElementById(containerId));
};

// Mount to root if it is not a micro frontend
if (!document.getElementById("subapp1-container")) {
  ReactDOM.render(<App />, document.getElementById("root"));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```
- If an app is running independent, it will be rendered to root element. If it is a micro front-end, it will be rendered to containerId by window.rendersubapp1.
- Use src/setupProxy.js to set up CORS rule.
```jsx
module.exports = app => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
};
```
- Configure Your .env File to Set Up a Host for Each Micro-Frontend Application in Container app.
```jsx
REACT_APP_SUBAPP1_HOST=http://localhost:4001
REACT_APP_SUBAPP2_HOST=http://localhost:4002
```
- Add Microfront.js file in sec directory, It picks up a manifest file from a running application and launches the application through a script and link tag.
```jsx
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
```
