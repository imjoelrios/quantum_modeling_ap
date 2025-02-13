import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        if (isHomePage) {
            document.body.style.paddingTop = '0'; // Set padding to 0 on home page
        } else {
            document.body.style.paddingTop = '60px'; // Restore padding on other pages
        }

        return () => {
            document.body.style.paddingTop = '60px'; // Reset to default
        };
    }, [isHomePage]);

    if (isHomePage) return null;

    return (
        <nav className="navbar">
            <div className="left-section">
                <Link to="/" className="logo">
                    <img src="/logo512.png" alt="Home" />
                </Link>
                <Link to="/" className="title">
                    Quantum Modeling
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/tunneling">Tunneling</Link>
                <Link to="/interference">Interference</Link>
                <Link to="/spintraceevo">Spin Trace Evolution</Link>
            </div>
        </nav>
    );
};

export default Navbar;
