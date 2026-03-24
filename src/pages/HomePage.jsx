import { AdminImage, usePrefetchAdminImages } from '../components/AdminImage';
import './HomePage.css';

const HOME_IMAGES = ['hero', 'about-section', 'feature-1', 'feature-2', 'feature-3'];

export const HomePage = () => {
  // Prefetch semua images saat page load
  usePrefetchAdminImages(HOME_IMAGES);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <AdminImage
          imageKey="hero"
          defaultSrc="/images/default-hero.jpg"
          alt="Hero banner"
          aspectRatio="16/9"
          className="hero-image"
        />
        <div className="hero-content">
          <h1>Welcome to Our Platform</h1>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about-grid">
          <AdminImage
            imageKey="about-section"
            defaultSrc="/images/default-about.jpg"
            alt="About us"
            aspectRatio="4/3"
            className="about-image"
          />
          <div className="about-text">
            <h2>About Us</h2>
            <p>Lorem ipsum dolor sit amet...</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        {HOME_IMAGES.slice(2).map((key, index) => (
          <div key={key} className="feature-card">
            <AdminImage
              imageKey={key}
              defaultSrc={`/images/default-feature-${index + 1}.jpg`}
              alt={\`Feature ${index + 1}\`}
              aspectRatio="16/9"
              className="feature-image"
            />
            <h3>Feature {index + 1}</h3>
          </div>
        ))}
      </section>
    </div>
  );
};