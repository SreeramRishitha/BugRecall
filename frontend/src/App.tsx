import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BugSessionPage from "./pages/BugSessionPage";

function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--teal)",
            boxShadow: "0 0 8px var(--teal)",
          }}
        />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, letterSpacing: -0.3 }}>
          BugRecall
        </span>
      </Link>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sessions/:id" element={<BugSessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
