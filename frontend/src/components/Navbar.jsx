
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("budgetbite_user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("budgetbite_user")) || null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("budgetbite_token");
    localStorage.removeItem("budgetbite_user");
    setUser(null);
    navigate("/login");
  }

  const publicLinks = [
    { name: "Home", path: "/" },
  ];

  const customerLinks = [
    { name: "Home", path: "/" },
    { name: "Explore Food", path: "/menu" },
    { name: "Cart", path: "/cart" },
    { name: "Track Order", path: "/track-order" },
  ];

  const links = user ? customerLinks : publicLinks;

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        🍔 BudgetBite
      </Link>

      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={
              location.pathname === link.path
                ? "nav-link active"
                : "nav-link"
            }
          >
            {link.name}
          </Link>
        ))}

        {user ? (
          <>
            <span className="nav-user">
              Hi, {user.name}
            </span>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className={
                  location.pathname === "/admin"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Admin
              </Link>
            )}
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={
                location.pathname === "/login"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Login
            </Link>
            <Link to="/register" className="nav-register">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
