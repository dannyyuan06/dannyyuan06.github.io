import './App.css';
import FloatingLetters from './FloatingLetters';

// Data populated from your CV
const portfolioData = {
  name: "Danny Yuan",
  bio: "Computing @ Imperial College London",
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/dannyyuan06",
    },
    {
      name: "Email",
      url: "mailto:dannyyuan06@gmail.com",
    },
  ],
  projects: [
    {
      title: "BPhO Computation Challenge",
      subtitle: "Solar system simulation (Top 5 UK)",
      url: "https://orbits-2aa96.web.app/",
      imageUrl: "/img/bpho.jpg", // <-- MODIFIED: Add image URL
    },
    {
      title: "BPhO Project Paper",
      subtitle: "Read the full research paper",
      url: "https://orbits-2aa96.web.app/paper.pdf",
      imageUrl: "/img/bpho.jpg", // <-- MODIFIED: Add image URL
    },
    {
      title: "Where's My Word",
      subtitle: "A daily wordsearch game and merch store",
      url: "https://wheresmyword.com/",
      imageUrl: "/img/wmw.png", // <-- MODIFIED: Add image URL
    },
    {
      title: "Graphle",
      subtitle: "A daily graph guessing game",
      url: "https://graphle.today/",
      imageUrl: "/img/graphle.png", // <-- MODIFIED: Add image URL
    },
    {
      title: "Isometric Editor",
      subtitle: "In progress: isometric drawing tool",
      url: "/isometric/index.html",
      imageUrl: "/img/isologo.svg", // <-- MODIFIED: Add image URL
    },
    {
      title: "The Reading Corner (GitHub)",
      subtitle: "Full-stack book tracking app",
      url: "https://github.com/dannyyuan06/theReadingCorner",
      imageUrl: "/img/trc.svg", // <-- MODIFIED: Add image URL
    },
  ]
};

// Simple components for the page
function Profile() {
  return (
    <header className="profile-header">
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

// <-- MODIFIED: Component updated to accept and display imageUrl
function ProjectLink({ title, subtitle, url, imageUrl }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="project-link">
      <img src={imageUrl} alt={title} className="project-image" />
      <div className="project-text">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </a>
  );
}

function App() {
  return (
    <>
      <FloatingLetters />
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
              imageUrl={project.imageUrl} // <-- MODIFIED: Pass prop
            />
          ))}
        </main>
      </div>
    </>
  );
}

export default App;