import React, { useState, useEffect } from 'react';
import haggadahFull from './data/haggadah_full.json';
import './index.css';

const genericImages = [
  "/images/ancient_scroll_webp_1774514783867.png",
  "/images/olive_branch_webp_1774514797670.png",
  "/images/menorah_antique_webp_1774514813235.png",
  "/images/pomegranate_vintage_webp_1774514829040.png",
  "/images/haggadah_ornament_webp_1774514848951.png"
];

function PassageCard({ passage, index, languagePreference }) {
  let image = null;
  const ref = passage.ref;
  
  if (ref === "Passover_Haggadah,_Kadesh" || ref === "Pesach Haggadah, Kadesh") {
    image = "/images/matzah_wine_webp_1774495714915.png";
  } else if (ref === "Pesach Haggadah, Magid, Ha Lachma Anya" || ref === "Passover_Haggadah,_Magid,_Ha_Lachma_Anya") {
    image = "/images/exodus_desert_webp_1774495732237.png";
  } else if (ref === "Pesach Haggadah, Shulchan Orech" || ref === "Passover_Haggadah,_Shulchan_Orech") {
    image = "/images/seder_plate_webp_1774495702418.png";
  } else if (ref === "Pesach Haggadah, Magid, The Four Sons") {
    image = "/images/four_sons_webp_1774511730284.png";
  } else if (ref === "Pesach Haggadah, Magid, The Ten Plagues") {
    image = "/images/ten_plagues_webp_1774511744010.png";
  } else if (ref === "Pesach Haggadah, Barech, Pour Out Thy Wrath") {
    image = "/images/elijah_cup_webp_1774511759503.png";
  } else if (ref === "Pesach Haggadah, Nirtzah, Chad Gadya") {
    image = "/images/chad_gadya_webp_1774511775890.png";
  } else if (ref === "Pesach Haggadah, Karpas" || ref === "Passover_Haggadah,_Karpas") {
    image = "/images/karpas_webp_1774511793554.png";
  }

  // Fallback pattern iteration
  if (!image) {
    image = genericImages[index % genericImages.length];
  }

  const maxLines = Math.max((passage.hebrew || []).length, (passage.english || []).length);
  const rows = [];
  for (let i = 0; i < maxLines; i++) {
    rows.push({
      hebrew: (passage.hebrew || [])[i] || '',
      english: (passage.english || [])[i] || ''
    });
  }

  const showHebrew = languagePreference === 'both' || languagePreference === 'hebrew';
  const showEnglish = languagePreference === 'both' || languagePreference === 'english';

  const isInstruction = (text) => text && (text.trim().startsWith('<i>') || text.trim().startsWith('<small>'));
  const isInfo = (text) => text && (text.trim().startsWith('<b>') || text.trim().startsWith('<strong>'));

  return (
    <div className={`step-card full-passage lang-${languagePreference}`}>
      {/* English Banner (Left) */}
      {showEnglish && (
        <div className="step-banner banner-left">
          <img src={image} alt={`Banner Left for ${passage.enTitle}`} />
        </div>
      )}

      <div className="step-content">
        <div className="step-header">
          {showHebrew && <h2 className="hebrew hebrew-title">{passage.heTitle}</h2>}
          {showEnglish && <span className="english-title">{showHebrew ? '— ' : ''}{passage.enTitle}</span>}
        </div>
        
        {rows.map((row, i) => {
          const hasContent = (showHebrew && row.hebrew) || (showEnglish && row.english);
          if (!hasContent) return null;
          
          let containerClass = "text-blocks";
          if (languagePreference === 'both') containerClass += " both-stack";
          
          const hebrewClass = `text-hebrew hebrew ${isInstruction(row.hebrew) ? 'instruction-box' : ''} ${isInfo(row.hebrew) ? 'info-box' : ''}`;
          const englishClass = `text-english ${isInstruction(row.english) ? 'instruction-box' : ''} ${isInfo(row.english) ? 'info-box' : ''}`;

          return (
            <div className={containerClass} key={i}>
              {showHebrew && row.hebrew && (
                <div 
                  className={hebrewClass} 
                  dangerouslySetInnerHTML={{ __html: row.hebrew }} 
                />
              )}
              {showEnglish && row.english && (
                <div 
                  className={englishClass} 
                  dangerouslySetInnerHTML={{ __html: row.english }} 
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Hebrew Banner (Right) */}
      {showHebrew && (
        <div className="step-banner banner-right">
          <img src={image} alt={`Banner Right for ${passage.heTitle}`} />
        </div>
      )}
    </div>
  );
}

function App() {
  const [lang, setLang] = useState('both');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(null);

  useEffect(() => {
    if (!autoScrollSpeed) return;
    
    let speedMap = {
      slow: 0.3,
      medium: 0.8,
      fast: 2.0
    };
    
    let animationFrameId;

    const scrollStep = () => {
      window.scrollBy({ top: speedMap[autoScrollSpeed], left: 0 });
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, [autoScrollSpeed]);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-brand">Haggadah Shel Pesach</div>
        <div className="nav-controls">
          <div className="language-toggle">
            <button className={`lang-btn ${lang === 'hebrew' ? 'active' : ''}`} onClick={() => setLang('hebrew')}>Hebrew</button>
            <button className={`lang-btn ${lang === 'both' ? 'active' : ''}`} onClick={() => setLang('both')}>Both</button>
            <button className={`lang-btn ${lang === 'english' ? 'active' : ''}`} onClick={() => setLang('english')}>English</button>
          </div>
          <div className="scroll-toggle">
            <span className="scroll-label">Auto Scroll:</span>
            <button className={`lang-btn ${autoScrollSpeed === null ? 'active' : ''}`} onClick={() => setAutoScrollSpeed(null)}>Off</button>
            <button className={`lang-btn ${autoScrollSpeed === 'slow' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('slow')}>Slow</button>
            <button className={`lang-btn ${autoScrollSpeed === 'medium' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('medium')}>Med</button>
            <button className={`lang-btn ${autoScrollSpeed === 'fast' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('fast')}>High</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <h1 className="hebrew hero-hebrew">הגדה של פסח</h1>
        <h1>The Passover Haggadah</h1>
        <p className="hero-sub">Complete text of the traditional Seder</p>
      </header>

      <main className="steps-grid">
        {haggadahFull.map((passage, index) => (
          <PassageCard key={passage.ref} passage={passage} index={index} languagePreference={lang} />
        ))}
      </main>

      <footer>
        <p className="footer-title">Created for Passover | פסח כשר ושמח</p>
      </footer>
    </div>
  );
}

export default App;
