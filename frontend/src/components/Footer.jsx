import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <div className="brand-icon-wrapper">
                <Utensils size={20} />
              </div>
              <span className="brand-title">Budget<span className="highlight">Bite</span></span>
            </Link>
            <p className="footer-tagline">
              Delicious Food. Smarter Budgets.
            </p>
            <p className="footer-desc">
              Your smart food-ordering companion designed to help you indulge in culinary delights without exceeding your wallet.
            </p>
            <div className="footer-trust-badge">
              <ShieldCheck size={16} />
              <span>100% Price Transparency & Safe Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Full Food Menu</Link></li>
              <li><Link to="/budget-planner">Smart Budget Planner</Link></li>
              <li><Link to="/combos">Pocket-Friendly Combos</Link></li>
              <li><Link to="/crave-match">Crave Match Quiz</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Cuisines & Meals</h4>
            <ul className="footer-links">
              <li><Link to="/menu?category=rice">Fried Rice Specials</Link></li>
              <li><Link to="/menu?category=noodles">Wok Tossed Noodles</Link></li>
              <li><Link to="/menu?category=starters">Manchurian Starters</Link></li>
              <li><Link to="/menu?category=fast-food">Burgers & Fries</Link></li>
              <li><Link to="/menu?category=pizza">Cheesy Handcrafted Pizzas</Link></li>
              <li><Link to="/menu?category=drinks">Cool Drinks & Juices</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-col">
            <h4 className="footer-heading">Get In Touch</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>Koramangala 5th Block, Bengaluru, KA 560095</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <span>+91 98765 43210 / 080-4567890</span>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <span>support@budgetbite.in</span>
              </li>
            </ul>
            <div className="operating-hours">
              <span className="hours-label">Kitchen Hours:</span>
              <span className="hours-val">11:00 AM – 11:30 PM (Daily)</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} BudgetBite Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/admin">Admin Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
