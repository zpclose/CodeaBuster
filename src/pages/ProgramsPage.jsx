import { AdminImage } from '../components/AdminImage';

export const ProgramsPage = () => {
  const programs = [
    { id: 1, imageKey: 'program-web-dev', title: 'Web Development' },
    { id: 2, imageKey: 'program-mobile', title: 'Mobile Development' },
    { id: 3, imageKey: 'program-ui-ux', title: 'UI/UX Design' },
  ];

  return (
    <div className="programs-page">
      <h1>Our Programs</h1>
      <div className="programs-grid">
        {programs.map((program) => (
          <div key={program.id} className="program-card">
            <AdminImage
              imageKey={program.imageKey}
              defaultSrc="/images/default-program.jpg"
              alt={program.title}
              aspectRatio="16/9"
              className="program-image"
            />
            <h3>{program.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};