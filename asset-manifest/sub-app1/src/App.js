import logo from "./logo.svg";
import "./App.css";

export default function App() {
  const host = process.env.REACT_APP_CONTENT_HOST || "";
  return (
    <div className="App">
      <header className="App-header">
        <img src={`${host}${logo}`} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sub-app1
        </a>
      </header>
    </div>
  );
}
