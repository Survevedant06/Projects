import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Target, History, Settings, LogOut } from 'lucide-react';

function Navbar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">Fit<span>Hub</span></Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/progress" className={isActive('/progress') ? 'active' : ''}>
            <Target size={20} />
            <span>Progress</span>
          </Link>
          <Link to="/plans" className={isActive('/plans') ? 'active' : ''}>
            <Settings size={20} />
            <span>Plans</span>
          </Link>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .navbar {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
        }
        .nav-brand { font-size: 24px; font-weight: 700; text-decoration: none; color: white; }
        .nav-brand span { color: var(--primary); }
        
        .nav-links { display: flex; gap: 32px; }
        .nav-links a { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          text-decoration: none; 
          color: var(--text-dim);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-links a:hover, .nav-links a.active { color: white; }
        .nav-links a.active { color: var(--primary); }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          font-size: 14px;
        }
        .logout-btn:hover { color: var(--primary); }

        @media (max-width: 600px) {
          .nav-links span, .logout-btn span { display: none; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
