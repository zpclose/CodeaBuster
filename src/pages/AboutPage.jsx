import { AdminImage } from '../components/AdminImage';

export const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <AdminImage
          imageKey="about-hero"
          defaultSrc="/images/default-about-hero.jpg"
          alt="About hero"
          aspectRatio="21/9"
          className="about-hero-image"
        />
      </section>

      <section className="team-section">
        <h2>Our Team</h2>
        <div className="team-grid">
          {['team-1', 'team-2', 'team-3', 'team-4'].map((key) => (
            <div key={key} className="team-card">
              <AdminImage
                imageKey={key}
                defaultSrc="/images/default-avatar.jpg"
                alt="Team member"
                aspectRatio="1/1"
                className="team-avatar"
                objectFit="cover"
              />
              <h4>Team Member</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};