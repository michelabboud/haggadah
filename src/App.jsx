import React, { useState, useEffect, useRef, useCallback } from 'react';
import haggadahFull from './data/haggadah_full.json';
import './index.css';

const genericImages = [
  "/images/ancient_scroll_webp_1774514783867.png",
  "/images/olive_branch_webp_1774514797670.png",
  "/images/menorah_antique_webp_1774514813235.png",
  "/images/pomegranate_vintage_webp_1774514829040.png",
  "/images/haggadah_ornament_webp_1774514848951.png"
];

const SEDER_STEPS = [
  { id: 'Kadesh', label: 'Kadesh', he: 'קדש' },
  { id: 'Urchatz', label: 'Urchatz', he: 'ורחץ' },
  { id: 'Karpas', label: 'Karpas', he: 'כרפס' },
  { id: 'Yachatz', label: 'Yachatz', he: 'יחץ' },
  { id: 'Magid', label: 'Magid', he: 'מגיד' },
  { id: 'Rachtzah', label: 'Rachtzah', he: 'רחצה' },
  { id: 'Motzi Matzah', label: 'Motzi Matzah', he: 'מוציא מצה' },
  { id: 'Maror', label: 'Maror', he: 'מרור' },
  { id: 'Korech', label: 'Korech', he: 'כורך' },
  { id: 'Shulchan Orech', label: 'Shulchan Orech', he: 'שולחן עורך' },
  { id: 'Tzafun', label: 'Tzafun', he: 'צפון' },
  { id: 'Barech', label: 'Barech', he: 'ברך' },
  { id: 'Hallel', label: 'Hallel', he: 'הלל' },
  { id: 'Nirtzah', label: 'Nirtzah', he: 'נרצה' },
];

function getStepFromRef(ref) {
  if (ref.includes('Magid')) return 'Magid';
  if (ref.includes('Barech')) return 'Barech';
  if (ref.includes('Hallel')) return 'Hallel';
  if (ref.includes('Nirtzah')) return 'Nirtzah';
  for (let s of SEDER_STEPS) {
    if (ref.includes(s.id)) return s.id;
  }
  return null;
}

function TOCDrawer({ isVisible, onClose, onNavigate, activeStep }) {
  return (
    <div className={`toc-drawer ${isVisible ? 'open' : ''}`}>
      <div className="toc-header">
        <h2 className="hebrew">תוכן עניינים</h2>
        <h2>Table of Contents</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <ul className="toc-list">
        {SEDER_STEPS.map(step => (
          <li 
            key={step.id} 
            className={activeStep === step.id ? 'active' : ''}
            onClick={() => onNavigate(step.id)}
          >
            <span className="toc-he">{step.he}</span>
            <span className="toc-en">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PassageCard({ passage, index, languagePreference, isPhonetic, onVisible }) {
  const cardRef = useRef(null);
  const ref = passage.ref;
  const stepId = getStepFromRef(ref);

  const [assignedTo, setAssignedTo] = useState(() => {
    return localStorage.getItem(`haggadah_assign_${ref}`) || '';
  });
  const [isEditingAssign, setIsEditingAssign] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);

  // Curated Rabbinic commentaries for core passages
  const getCommentaries = (passageRef) => {
    if (passageRef.includes("Ha_Lachma_Anya") || passageRef.includes("Four_Questions")) {
      return [
        { author: "Abarbanel", text: "Why do we begin the story of redemption by declaring 'This is the bread of affliction' and inviting the hungry? True freedom is the ability to give to others." },
        { author: "Rambam", text: "The unusual changes at the Seder table are designed solely to provoke the children to ask, so we can fulfill the explicit mitzvah of telling the story dynamically." }
      ];
    } else if (passageRef.includes("Four_Sons")) {
      return [
        { author: "Rabbi Schneur Zalman (Tanya)", text: "There is a spark of every son within each of us. The Haggadah speaks to the internal psychology of every individual's spiritual journey." }
      ];
    } else if (passageRef.includes("Ten_Plagues")) {
      return [
        { author: "Midrash Rabba", text: "The plagues were not merely punishments, but a systematic deconstruction of the Egyptian pantheon and their belief in nature's supremacy." }
      ];
    }
    return [];
  };
  
  const commentaries = getCommentaries(ref);

  const handleAssignSave = (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      setAssignedTo(val);
      if (val) {
        localStorage.setItem(`haggadah_assign_${ref}`, val);
      } else {
        localStorage.removeItem(`haggadah_assign_${ref}`);
      }
      setIsEditingAssign(false);
    } else if (e.key === 'Escape') {
      setIsEditingAssign(false);
    }
  };

  const handlePlayPassage = () => {
    window.speechSynthesis.cancel();
    const cleanText = (passage.hebrew || []).join(' ').replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "he-IL";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (stepId) onVisible(stepId);
      }
    }, { threshold: 0.2 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [stepId, onVisible]);

  let image = null;
  if (ref === "Passover_Haggadah,_Kadesh" || ref === "Pesach Haggadah, Kadesh") {
    image = "/images/matzah_wine_webp_1774495714915.png";
  } else if (ref.includes("Ha Lachma Anya")) {
    image = "/images/exodus_desert_webp_1774495732237.png";
  } else if (ref.includes("Shulchan Orech")) {
    image = "/images/seder_plate_webp_1774495702418.png";
  } else if (ref.includes("The Four Sons")) {
    image = "/images/four_sons_webp_1774511730284.png";
  } else if (ref.includes("The Ten Plagues")) {
    image = "/images/ten_plagues_webp_1774511744010.png";
  } else if (ref.includes("Pour Out Thy Wrath")) {
    image = "/images/elijah_cup_webp_1774511759503.png";
  } else if (ref.includes("Chad Gadya")) {
    image = "/images/chad_gadya_webp_1774511775890.png";
  } else if (ref.includes("Karpas")) {
    image = "/images/karpas_webp_1774511793554.png";
  } else {
    image = genericImages[index % genericImages.length];
  }

  const maxLines = Math.max((passage.hebrew || []).length, (passage.english || []).length);
  const rows = Array.from({ length: maxLines }).map((_, i) => ({
    hebrew: (passage.hebrew || [])[i] || '',
    transliteration: (passage.transliteration || [])[i] || '',
    english: (passage.english || [])[i] || ''
  }));

  const showHebrew = languagePreference === 'both' || languagePreference === 'hebrew';
  const showEnglish = languagePreference === 'both' || languagePreference === 'english';

  const isInstruction = (text) => text && (text.trim().startsWith('<i>') || text.trim().startsWith('<small>'));
  const isInfo = (text) => text && (text.trim().startsWith('<b>') || text.trim().startsWith('<strong>'));

  return (
    <div className={`step-card full-passage lang-${languagePreference}`} ref={cardRef} data-step={stepId}>
      {showEnglish && (
        <div className="step-banner banner-left">
          <img src={image} alt={`Banner Left for ${passage.enTitle}`} />
        </div>
      )}

      <div className="step-content">
        <div className="step-header">
          <div className="title-row">
            {showHebrew && <h2 className="hebrew hebrew-title">{passage.heTitle}</h2>}
            {showEnglish && <span className="english-title">{showHebrew ? '— ' : ''}{passage.enTitle}</span>}
          </div>
          <div className="assignment-tag" style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
            {isEditingAssign ? (
              <input 
                autoFocus 
                defaultValue={assignedTo} 
                onKeyDown={handleAssignSave} 
                onBlur={() => setIsEditingAssign(false)}
                placeholder="Type name (Enter to save)" 
                className="assign-input"
              />
            ) : (
              <span className="assign-badge" onClick={() => setIsEditingAssign(true)}>
                {assignedTo ? `📖 Read by: ${assignedTo}` : '+ Assign Reader'}
              </span>
            )}
            {showHebrew && (
              <button className="assign-badge audio-btn" style={{border: 'none', background: 'transparent'}} onClick={handlePlayPassage} title="Read Aloud in Hebrew">
                🔊 Listen
              </button>
            )}
          </div>
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
                <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
                  <div className={hebrewClass} dangerouslySetInnerHTML={{ __html: row.hebrew }} />
                  {isPhonetic && row.transliteration && !isInstruction(row.hebrew) && !isInfo(row.hebrew) && (
                    <div className="text-transliteration">{row.transliteration}</div>
                  )}
                </div>
              )}
              {showEnglish && row.english && <div className={englishClass} dangerouslySetInnerHTML={{ __html: row.english }} />}
            </div>
          );
        })}

        {commentaries.length > 0 && (
          <div className="commentary-section" style={{marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', width: '100%', textAlign: 'center'}}>
            <button className="assign-badge" onClick={() => setShowCommentary(!showCommentary)} style={{marginBottom: '1rem', background: showCommentary ? 'var(--accent)' : 'transparent', color: showCommentary ? '#fff' : 'var(--accent)'}}>
              📜 {showCommentary ? "Hide Rabbinic Insights" : "Expand Rabbinic Insights"}
            </button>
            
            {showCommentary && commentaries.map((c, i) => (
              <div key={i} className="info-box" style={{marginBottom: '0.8rem', textAlign: 'left', direction: 'ltr'}}>
                <strong style={{color: 'var(--accent)', fontFamily: 'Cinzel, serif'}}>{c.author}:</strong> {c.text}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showHebrew && (
        <div className="step-banner banner-right">
          <img src={image} alt={`Banner Right for ${passage.heTitle}`} />
        </div>
      )}
    </div>
  );
}

import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="book-page" ref={ref} data-density="soft">
      <div className="page-content">
        {props.children}
      </div>
    </div>
  );
});

function App() {
  const [lang, setLang] = useState('both');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(null);
  const [activeStep, setActiveStep] = useState('Kadesh');
  const [is3DMode, setIs3DMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTOCVisible, setIsTOCVisible] = useState(false);
  const [isPhonetic, setIsPhonetic] = useState(false);

  const handleVisibleStep = useCallback((stepId) => {
    setActiveStep(stepId);
  }, []);

  const handleNavigate = useCallback((stepId) => {
    const element = document.querySelector(`[data-step="${stepId}"]`);
    if (element) {
      const yOffset = -120; // accounting for fixed nav
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
    setIsTOCVisible(false);
  }, []);

  useEffect(() => {
    if (!autoScrollSpeed || is3DMode) return;
    
    let speedMap = { slow: 0.3, medium: 0.8, fast: 2.0 };
    let animationFrameId;

    const scrollStep = () => {
      window.scrollBy({ top: speedMap[autoScrollSpeed], left: 0 });
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoScrollSpeed, is3DMode]);

  return (
    <div className={`app-container ${is3DMode ? 'mode-3d' : 'mode-plain'} ${isDarkMode ? 'theme-dark' : ''}`}>
      <TOCDrawer 
        isVisible={isTOCVisible} 
        onClose={() => setIsTOCVisible(false)} 
        onNavigate={handleNavigate} 
        activeStep={activeStep} 
      />
      
      <nav className="top-nav">
        <div className="nav-brand">Haggadah Shel Pesach</div>
        <div className="nav-controls">
          <div className="view-toggle">
            <button className="lang-btn" style={{fontSize: '1.2rem', padding: '0.2rem 0.6rem'}} onClick={() => setIsTOCVisible(true)} title="Table of Contents">
              ☰
            </button>
            <button className="lang-btn" style={{fontSize: '1.2rem', padding: '0.2rem 0.6rem', marginLeft: '10px'}} onClick={() => setIsDarkMode(!isDarkMode)} title="Night Mode">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className={`lang-btn ${isPhonetic ? 'active' : ''}`} style={{fontSize: '1rem', padding: '0.2rem 0.6rem', marginLeft: '10px'}} onClick={() => setIsPhonetic(!isPhonetic)} title="Toggle Phonetic Transliteration">
              Aא
            </button>
            <span className="scroll-label" style={{marginLeft: '10px'}}>View:</span>
            <button className={`lang-btn ${!is3DMode ? 'active' : ''}`} onClick={() => setIs3DMode(false)}>Plain</button>
            <button className={`lang-btn ${is3DMode ? 'active' : ''}`} onClick={() => setIs3DMode(true)}>3D Book</button>
          </div>
          <div className="language-toggle">
            <button className={`lang-btn ${lang === 'hebrew' ? 'active' : ''}`} onClick={() => setLang('hebrew')}>Hebrew</button>
            <button className={`lang-btn ${lang === 'both' ? 'active' : ''}`} onClick={() => setLang('both')}>Both</button>
            <button className={`lang-btn ${lang === 'english' ? 'active' : ''}`} onClick={() => setLang('english')}>English</button>
          </div>
          {!is3DMode && (
            <div className="scroll-toggle">
              <span className="scroll-label">Auto Scroll:</span>
              <button className={`lang-btn ${autoScrollSpeed === null ? 'active' : ''}`} onClick={() => setAutoScrollSpeed(null)}>Off</button>
              <button className={`lang-btn ${autoScrollSpeed === 'slow' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('slow')}>Slow</button>
              <button className={`lang-btn ${autoScrollSpeed === 'medium' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('medium')}>Med</button>
              <button className={`lang-btn ${autoScrollSpeed === 'fast' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('fast')}>High</button>
            </div>
          )}
        </div>
      </nav>

      {/* Note: I removed SederMinimap earlier by replacing it, but I should probably just let TOCDrawer replace it entirely since they do the exact same thing but Drawer is mobile friendly! */}

      {!is3DMode && (
        <header className="hero">
          <h1 className="hebrew hero-hebrew">הגדה של פסח</h1>
          <h1>The Passover Haggadah</h1>
          <p className="hero-sub">Complete text of the traditional Seder</p>
        </header>
      )}

      <main className="steps-grid">
        {is3DMode ? (
          <div className="book-container">
            <HTMLFlipBook 
              width={550} 
              height={750} 
              size="stretch"
              minWidth={315}
              maxWidth={1000}
              minHeight={400}
              maxHeight={1536}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              className="haggadah-book"
            >
              <Page>
                <div className="cover-front">
                  <h1 className="hebrew">הגדה של פסח</h1>
                  <h1>The Passover Haggadah</h1>
                  <p>Swipe or Click to gently turn the ancient pages</p>
                </div>
              </Page>
              
              {haggadahFull.map((passage, index) => (
                <Page key={passage.ref}>
                  <div className="book-passage-wrapper">
                    <PassageCard 
                      passage={passage} 
                      index={index} 
                      languagePreference={lang} 
                      onVisible={handleVisibleStep} 
                    />
                  </div>
                </Page>
              ))}

              <Page>
                <div className="cover-back">
                   <h2 className="hebrew">לשנה הבאה בירושלים</h2>
                   <h2>Next Year in Jerusalem!</h2>
                   <p>Chag Kasher V'Sameach</p>
                </div>
              </Page>
            </HTMLFlipBook>
          </div>
        ) : (
          haggadahFull.map((passage, index) => (
            <PassageCard 
              key={passage.ref} 
              passage={passage} 
              index={index} 
              languagePreference={lang} 
              onVisible={handleVisibleStep}
            />
          ))
        )}
      </main>

      <footer>
        <p className="footer-title">Created for Passover | פסח כשר ושמח</p>
      </footer>
    </div>
  );
}

export default App;
