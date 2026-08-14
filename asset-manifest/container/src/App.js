import { NavLink, BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import MicroFrontend from "./MicroFrontend";
import "./App.css";

const {
  REACT_APP_SUBAPP1_HOST: subapp1,
  REACT_APP_SUBAPP2_HOST: subapp2,
} = process.env;

function SubApp1() {
  const navigate = useNavigate();
  return (
    <MicroFrontend
      history={{ push: navigate }}
      host={subapp1}
      name="subapp1"
    />
  );
}

function SubApp2() {
  const navigate = useNavigate();
  return (
    <MicroFrontend
      history={{ push: navigate }}
      host={subapp2}
      name="subapp2"
    />
  );
}

function Home() {
  return (
    <div className="home">
      <h1>Container Host</h1>
      <p>
        Shell loads remotes by fetching <code>asset-manifest.json</code>,
        injecting scripts, then calling <code>window.rendersubapp*</code>.
      </p>
    </div>
  );
}

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: "bold",
  color: isActive ? "#61dafb" : "#282c34",
  fontSize: 20,
});

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
        <Route path="/subapp1" element={<SubApp1 />} />
        <Route path="/subapp2" element={<SubApp2 />} />
      </Routes>
    </BrowserRouter>
  );
}
