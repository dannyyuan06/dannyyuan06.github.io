import { useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingLetters from './FloatingLetters';
import './IsoQube.css';

const DOWNLOADS = {
  mac: {
    label: 'Download for macOS',
    sublabel: '.dmg  •  Apple Silicon & Intel',
    url: 'https://github.com/dannyyuan06/dannyyuan06.github.io/releases/download/IsoQube-2.0.0/IsoQube-2.0.0.dmg',
  },
  windows: {
    label: 'Download for Windows',
    sublabel: '.exe  •  x64',
    url: 'https://github.com/dannyyuan06/dannyyuan06.github.io/releases/download/IsoQube-2.0.0/isoqube-windows-x64-v2.0.0-setup.exe',
  },
};

function detectOS() {
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) return 'mac';
  if (/Win/i.test(ua)) return 'windows';
  return null;
}

export default function IsoQube() {
  const [os] = useState(detectOS);

  const primary = os === 'mac' ? DOWNLOADS.mac : DOWNLOADS.windows;
  const secondary = os === 'mac' ? DOWNLOADS.windows : DOWNLOADS.mac;

  return (
    <>
      <FloatingLetters />
      <div className="isoqube-page">
        <Link to="/" className="back-link">← Back</Link>

        <header className="isoqube-header">
          <h1 className="isoqube-title">IsoQube</h1>
          <span className="isoqube-version">v2.0.0</span>
          <p className="isoqube-description">
            Made a tool to make the letters you see in the background of the website because illustrator was so annoying for this.
          </p>
        </header>

        <section className="isoqube-downloads">
          <a href={primary.url} className="download-btn-primary">
            <span className="download-btn-label">{primary.label}</span>
            <span className="download-btn-sub">{primary.sublabel}</span>
          </a>

          <p className="other-platform">
            Also available for{' '}
            <a href={secondary.url} className="secondary-download-link">
              {secondary.label.replace('Download for ', '')} ({secondary.sublabel.split('  •  ')[0]})
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
