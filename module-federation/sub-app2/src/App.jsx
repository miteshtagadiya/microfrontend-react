import logo from "./logo.svg";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <header className="App-header subapp2">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sub-app2
        </a>
      </header>
    </div>
  );
}
