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
