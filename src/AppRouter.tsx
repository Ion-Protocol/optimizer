import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Vault } from "./pages/Vault";
import { Vaults } from "./pages/Vaults";

const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/vaults", element: <Vaults /> },
  { path: "/vault/:vaultId", element: <Vault /> },
];

export function AppRouter() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ margin: "0 1rem" }}>
          Dashboard
        </Link>
        <Link to="/vaults" style={{ margin: "0 1rem" }}>
          Vaults
        </Link>
      </nav>
      <div style={{ padding: "1rem" }}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
      <footer style={{ padding: "1rem" }}></footer>
    </BrowserRouter>
  );
}
