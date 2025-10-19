import './App.css';

// Data populated from your CV
const portfolioData = {
  name: "Danny Yuan",
  bio: "Computing @ Imperial College London",
  // You can find a free icon library (like React Icons) to add these
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/dannyyuan06", // Inferred from your project repos
    },
    {
      name: "Email",
      url: "mailto:dannyyuan06@gmail.com",
    },
    // Add a link to your hosted CV file here
    // {
    //   name: "View CV",
    //   url: "/link-to-your-cv.pdf",
    // }
  ],
  projects: [
    {
      title: "BPhO Computation Challenge",
      subtitle: "Solar system simulation (Top 5 UK)",
      url: "https://orbits-2aa96.web.app/",
    },
    {
      title: "Graphle",
      subtitle: "A daily graph guessing game",
      url: "https://graphle.today/",
    },
    {
      title: "Where's My Word",
      subtitle: "A daily wordsearch game",
      url: "https://wheresmyword.com/",
    },
    {
      title: "BPhO Project Paper",
      subtitle: "Read the full research paper",
      url: "https://orbits-2aa96.web.app/paper.pdf",
    },
    {
      title: "The Reading Corner (GitHub)",
      subtitle: "Full-stack book tracking app",
      url: "https://github.com/dannyyuan06/theReadingCorner",
    },
  ]
};

// Simple components for the page
function Profile() {
  return (
    <header className="profile-header">
      <img
        src={"/dannyiso.svg"} // <--- Use your SVG here
        alt="Danny ISO Logo"
        className="iso-logo" // <--- Give it a specific class
      />
      <h1 className="profile-name">{portfolioData.name}</h1>
      <p className="profile-bio">{portfolioData.bio}</p>
    </header>
  );
}

function SocialLinks() {
  return (
    <div className="social-links">
      {portfolioData.socials.map((social) => (
        <a 
          key={social.name}
          href={social.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-link"
        >
          {social.name}
        </a>
      ))}
    </div>
  );
}

function ProjectLink({ title, subtitle, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="project-link">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </a>
  );
}

function App() {
  return (
    <div className="App">
      <Profile />
      <SocialLinks />
      <main className="links-container">
        {portfolioData.projects.map((project) => (
          <ProjectLink 
            key={project.title}
            title={project.title} 
            subtitle={project.subtitle} 
            url={project.url} 
          />
        ))}
      </main>
    </div>
  );
}

export default App;