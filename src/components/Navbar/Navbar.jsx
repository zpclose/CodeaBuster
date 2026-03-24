import { AdminImage } from '../AdminImage';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo-link">
        <AdminImage
          imageKey="logo-main"
          defaultSrc="/images/default-logo.png"
          alt="Company Logo"
          aspectRatio="1/1"
          className="navbar-logo"
          style={{ width: '40px', height: '40px' }}
        />
        <span className="brand-name">Codebusters</span>
      </Link>
      
      {/* Nav links */}
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/programs">Programs</Link>
        <Link to="/auth">Login</Link>
      </div>
    </nav>
  );
};