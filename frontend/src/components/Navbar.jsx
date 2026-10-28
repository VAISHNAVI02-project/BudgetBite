
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Explore Food", path: "/menu" },
    { name: "Cart", path: "/cart" },
    { name: "Track Order", path: "/track-order" },
    { name: "Admin", path: "/admin" },
  ];

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
      </div>
    </nav>
  );
}

export default Navbar;
