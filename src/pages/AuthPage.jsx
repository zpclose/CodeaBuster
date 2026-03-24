import { AdminImage } from '../components/AdminImage';

export const AuthPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-left">
        {/* Logo di auth page */}
        <AdminImage
          imageKey="logo-auth"
          defaultSrc="/images/default-logo.png"
          alt="Logo"
          aspectRatio="1/1"
          className="auth-logo"
          style={{ width: '40px', height: '40px' }}
        />
        <span className="brand-name">Brand</span>
      </div>
      
      <div className="auth-right">
        {/* Hero image di sisi auth */}
        <AdminImage
          imageKey="auth-hero"
          defaultSrc="/images/default-auth-hero.jpg"
          alt="Auth illustration"
          aspectRatio="3/4"
          className="auth-hero-image"
        />
      </div>
      
      {/* Form components... */}
    </div>
  );
};