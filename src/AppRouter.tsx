import { Link, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Vault } from "./pages/Vault";
import { VaultGroup } from "./pages/VaultGroup";

const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/vault-group/:vaultGroup", element: <VaultGroup /> },
  { path: "/vault-group/:vaultGroup/:vaultKey", element: <Vault /> },
];

export function AppRouter() {
  return (
    <>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ margin: "0 1rem" }}>
          Dashboard
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
    </>
  );
}
