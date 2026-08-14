import { lazy, Suspense } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

const SubApp1 = lazy(() => import("subapp1/App"));
const SubApp2 = lazy(() => import("subapp2/App"));

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: "bold",
  color: isActive ? "#61dafb" : "#282c34",
  fontSize: 20,
});

function Home() {
  return (
    <div className="home">
      <h1>Container Host</h1>
      <p>
        Shell app loads remote micro-frontends via Module Federation. Pick a
        sub-app from the nav.
      </p>
    </div>
  );
}

function Loading({ label }) {
  return <p className="loading">Loading {label}…</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <div className="nav-item">
          <NavLink to="/home" style={linkStyle}>
            Home
          </NavLink>
        </div>
        <div className="nav-item">
          <NavLink to="/subapp1" style={linkStyle}>
            SubApp1
          </NavLink>
        </div>
        <div className="nav-item">
          <NavLink to="/subapp2" style={linkStyle}>
            SubApp2
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/subapp1"
          element={
            <Suspense fallback={<Loading label="SubApp1" />}>
              <SubApp1 />
            </Suspense>
          }
        />
        <Route
          path="/subapp2"
          element={
            <Suspense fallback={<Loading label="SubApp2" />}>
              <SubApp2 />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
