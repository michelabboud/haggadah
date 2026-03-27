import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import haggadahFull from './data/haggadah_full.json';
import './index.css';
import ancientScrollImage from '../public/images/ancient_scroll_webp_1774514783867.png';
import chadGadyaImage from '../public/images/chad_gadya_webp_1774511775890.png';
import elijahCupImage from '../public/images/elijah_cup_webp_1774511759503.png';
import exodusDesertImage from '../public/images/exodus_desert_webp_1774495732237.png';
import fourSonsImage from '../public/images/four_sons_webp_1774511730284.png';
import haggadahOrnamentImage from '../public/images/haggadah_ornament_webp_1774514848951.png';
import karpasImage from '../public/images/karpas_webp_1774511793554.png';
import matzahWineImage from '../public/images/matzah_wine_webp_1774495714915.png';
import menorahAntiqueImage from '../public/images/menorah_antique_webp_1774514813235.png';
import sederPlateImage from '../public/images/seder_plate_webp_1774495702418.png';
import tenPlaguesImage from '../public/images/ten_plagues_webp_1774511744010.png';

const genericImages = [
  ancientScrollImage,
  menorahAntiqueImage,
  haggadahOrnamentImage
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

function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function isNativeSpeechPlatform() {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform() && (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios');
}

function isHebrewVoice(voice) {
  return typeof voice?.lang === 'string' && voice.lang.toLowerCase().startsWith('he');
}

function getPassageSpeechText(passage) {
  return (passage.hebrew || []).join(' ').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function getPreferredSpeechLang(voices, selectedVoiceURI) {
  const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceURI);
  if (selectedVoice?.lang) return selectedVoice.lang;

  const firstHebrewVoice = voices.find(isHebrewVoice);
  if (firstHebrewVoice?.lang) return firstHebrewVoice.lang;

  return 'he-IL';
}

function chunkPassage(passage, rowsPerPage) {
  const maxLines = Math.max((passage.hebrew || []).length, (passage.english || []).length);
  if (maxLines <= rowsPerPage) {
    return [{ ...passage, showHeader: true, showFooter: true, chunkId: 0 }];
  }
  const chunks = [];
  for (let i = 0; i < maxLines; i += rowsPerPage) {
    chunks.push({
      ...passage,
      hebrew: (passage.hebrew || []).slice(i, i + rowsPerPage),
      english: (passage.english || []).slice(i, i + rowsPerPage),
      transliteration: (passage.transliteration || []).slice(i, i + rowsPerPage),
      showHeader: i === 0,
      showFooter: (i + rowsPerPage >= maxLines),
      chunkId: i
    });
  }
  return chunks;
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

const PassageCard = ({ passage, index, languagePreference, isPhonetic, showHeader = true, showFooter = true, onVisible, speechSupported = false, playingPassageRef, isSpeakingState, onPlayPassage }) => {
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
    if (!speechSupported || !onPlayPassage) return;
    onPlayPassage(passage);
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
    image = matzahWineImage;
  } else if (ref.includes("Ha Lachma Anya")) {
    image = exodusDesertImage;
  } else if (ref.includes("Shulchan Orech")) {
    image = sederPlateImage;
  } else if (ref.includes("The Four Sons")) {
    image = fourSonsImage;
  } else if (ref.includes("The Ten Plagues")) {
    image = tenPlaguesImage;
  } else if (ref.includes("Pour Out Thy Wrath")) {
    image = elijahCupImage;
  } else if (ref.includes("Chad Gadya")) {
    image = chadGadyaImage;
  } else if (ref.includes("Karpas")) {
    image = karpasImage;
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
    <div
      className={`step-card full-passage lang-${languagePreference} ${isSpeakingState && playingPassageRef === ref ? 'playing-highlight' : ''}`}
      ref={cardRef}
      data-step={stepId}
    >
      {showEnglish && (
        <div className="step-banner banner-left">
          <img src={image} alt={`Banner Left for ${passage.enTitle}`} />
        </div>
      )}

      <div className="step-content">
        {showHeader && (
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
              {speechSupported && showHebrew && (
                <button className="assign-badge audio-btn" style={{border: 'none', background: 'transparent'}} onClick={handlePlayPassage} title="Read Aloud in Hebrew">
                  🔊 Listen
                </button>
              )}
            </div>
          </div>
        )}
        
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

        {showFooter && commentaries.length > 0 && (
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
  const nativeSpeechPlatform = isNativeSpeechPlatform();
  const speechSupported = nativeSpeechPlatform || supportsSpeechSynthesis();
  const canPauseResume = !nativeSpeechPlatform && supportsSpeechSynthesis();
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  const [lang, setLang] = useState('both');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(null);
  const [activeStep, setActiveStep] = useState('Kadesh');
  const [is3DMode, setIs3DMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTOCVisible, setIsTOCVisible] = useState(false);
  const [isPhonetic, setIsPhonetic] = useState(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playingPassageRef, setPlayingPassageRef] = useState(null);
  const speechRequestIdRef = useRef(0);
  const is3DEnabled = is3DMode && !isMobileViewport;

  useEffect(() => {
    if (!speechSupported || nativeSpeechPlatform) return;

    const checkSpeechState = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
      setIsPaused(window.speechSynthesis.paused);
    }, 200);

    return () => clearInterval(checkSpeechState);
  }, [nativeSpeechPlatform, speechSupported]);

  const resetSpeechState = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
    setPlayingPassageRef(null);
  }, []);

  const handlePlayStart = useCallback((ref) => {
    setPlayingPassageRef(ref);
    const step = getStepFromRef(ref);
    if (step) {
       setActiveStep(step);
    }
  }, []);

  const wait = useCallback((delayMs) => new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  }), []);

  const withNativeSpeechRetry = useCallback(async (operation) => {
    let lastError = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const message = String(error?.message || error || '').toLowerCase();
        const shouldRetry = message.includes('not yet initialized') || message.includes('not available');
        if (!shouldRetry || attempt === 5) {
          break;
        }
        await wait(350);
      }
    }

    throw lastError;
  }, [wait]);

  const loadNativeVoices = useCallback(async () => {
    const { voices: supportedVoices = [] } = await withNativeSpeechRetry(() => TextToSpeech.getSupportedVoices());
    setVoices(supportedVoices);
  }, [withNativeSpeechRetry]);

  const handlePauseResumeToggle = () => {
    if (!canPauseResume) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  };

  const handleStopSpeech = async () => {
    if (!speechSupported) return;

    speechRequestIdRef.current += 1;

    if (nativeSpeechPlatform) {
      try {
        await TextToSpeech.stop();
      } catch (error) {
        console.error('Failed to stop native speech.', error);
      }
      resetSpeechState();
      return;
    }

    window.speechSynthesis.cancel();
    resetSpeechState();
  };

  useEffect(() => {
    if (!speechSupported) return;

    if (nativeSpeechPlatform) {
      loadNativeVoices().catch((error) => {
        console.error('Failed to load native speech voices.', error);
      });
      return undefined;
    }

    const loadVoices = () => {
      const supportedVoices = window.speechSynthesis.getVoices();
      setVoices(supportedVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadNativeVoices, nativeSpeechPlatform, speechSupported]);

  useEffect(() => {
     if (selectedVoiceURI === null && voices.length > 0) {
        const he = voices.find(isHebrewVoice);
        if (he) setSelectedVoiceURI(he.voiceURI);
     }
  }, [voices, selectedVoiceURI]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleViewportChange = (event) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (isMobileViewport && is3DMode) {
      setIs3DMode(false);
    }
  }, [is3DMode, isMobileViewport]);

  // Disable 'both' lang mode strictly when in 3D Mode
  useEffect(() => {
    if (is3DEnabled && lang === 'both') {
      setLang('hebrew'); // Force default to Hebrew when entering 3D to maintain physical realism
    }
  }, [is3DEnabled, lang]);

  // Derive fixed-size pages dynamically (e.g., max 2 long blocks of text per physical book page to prevent scrolling)
  const paginatedHaggadah = React.useMemo(() => {
    return haggadahFull.flatMap(p => chunkPassage(p, 2));
  }, []);

  // Hook to properly toggle Night Mode directly on the entire document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [isDarkMode]);

  const handleVisibleStep = useCallback((stepId) => {
    setActiveStep(stepId);
  }, []);

  const handlePlayPassage = useCallback(async (passage) => {
    if (!speechSupported) return;

    const text = getPassageSpeechText(passage);
    if (!text) return;

    const requestId = speechRequestIdRef.current + 1;
    speechRequestIdRef.current = requestId;

    handlePlayStart(passage.ref);
    setIsPaused(false);

    if (nativeSpeechPlatform) {
      try {
        const voiceIndex = voices.findIndex((voice) => voice.voiceURI === selectedVoiceURI);
        const langCode = getPreferredSpeechLang(voices, selectedVoiceURI);

        setIsSpeaking(true);
        await withNativeSpeechRetry(() => TextToSpeech.speak({
          text,
          lang: langCode,
          rate: 0.66,
          pitch: 1.0,
          volume: 1.0,
          ...(voiceIndex >= 0 ? { voice: voiceIndex } : {})
        }));

        if (speechRequestIdRef.current === requestId) {
          resetSpeechState();
        }
      } catch (error) {
        console.error('Native speech playback failed.', error);
        if (Capacitor.getPlatform() === 'android') {
          try {
            await TextToSpeech.openInstall();
          } catch (installError) {
            console.error('Failed to open Android TTS installer.', installError);
          }
        }
        if (speechRequestIdRef.current === requestId) {
          resetSpeechState();
        }
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = getPreferredSpeechLang(voices, selectedVoiceURI);
    utterance.rate = 0.66;
    utterance.onstart = () => {
      if (speechRequestIdRef.current === requestId) {
        setIsSpeaking(true);
        setIsPaused(false);
      }
    };
    utterance.onend = () => {
      if (speechRequestIdRef.current === requestId) {
        resetSpeechState();
      }
    };
    utterance.onerror = () => {
      if (speechRequestIdRef.current === requestId) {
        resetSpeechState();
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [handlePlayStart, nativeSpeechPlatform, resetSpeechState, selectedVoiceURI, speechSupported, voices, withNativeSpeechRetry]);

  const handleNavigate = useCallback((stepId) => {
    if (is3DEnabled) {
       const pIndex = paginatedHaggadah.findIndex(p => getStepFromRef(p.ref) === stepId);
       if (pIndex !== -1) {
          const ltrIndex = pIndex + 1; // Offset by 1 for cover-front
          const totalPages = paginatedHaggadah.length + 2; 
          // If in RTL mode, the array is physically reversed in the Virtual DOM. Find its mirrored index.
          const finalIndex = lang === 'hebrew' ? totalPages - 1 - ltrIndex : ltrIndex;
          if (flipBookRef.current && flipBookRef.current.pageFlip) {
             flipBookRef.current.pageFlip().turnToPage(finalIndex);
          }
       }
    } else {
      const element = document.querySelector(`[data-step="${stepId}"]`);
      if (element) {
        const yOffset = -120; // accounting for fixed nav
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }
    
    // Automatically close internal Drawer if running on a tablet/mobile. On Desktop, leave panel rigidly open.
    if (window.innerWidth < 1024) {
      setIsTOCVisible(false);
    }
  }, [is3DEnabled, paginatedHaggadah, lang]);

  const flipBookRef = useRef(null);

  useEffect(() => {
    if (!autoScrollSpeed) return;
    
    if (is3DEnabled) {
      const timingMap = { slow: 30000, medium: 15000, fast: 8000 }; // Wait X ms before auto page-flip
      const intervalId = setInterval(() => {
        try {
          if (flipBookRef.current && flipBookRef.current.pageFlip) {
             if (lang === 'hebrew') {
               flipBookRef.current.pageFlip().flipPrev(); // Read backwards for Hebrew RTL emulation
             } else {
               flipBookRef.current.pageFlip().flipNext();
             }
          }
        } catch (e) {
          console.error("Page-flip interval error", e);
        }
      }, timingMap[autoScrollSpeed]);
      return () => clearInterval(intervalId);
    } else {
      // Speeds are measured in Pixels Per Second (halved from prior speeds)
      const speedMap = { slow: 6, medium: 15, fast: 45 }; 
      let animationFrameId;
      let lastTime = performance.now();
      let exactScrollY = window.scrollY;
  
      const scrollStep = (timestamp) => {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // If user manually scrolls, naturally resync our theoretical position
        if (Math.abs(exactScrollY - window.scrollY) > 2.0) {
           exactScrollY = window.scrollY;
        }

        exactScrollY += (speedMap[autoScrollSpeed] * deltaTime) / 1000;
        
        // Pass the highly accurate float to the compositor for native sub-pixel anti-aliased scrolling
        window.scrollTo(0, exactScrollY);

        animationFrameId = requestAnimationFrame(scrollStep);
      };
  
      animationFrameId = requestAnimationFrame(scrollStep);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [autoScrollSpeed, is3DEnabled, lang]);

  return (
    <div
      className={`app-container ${is3DEnabled ? 'mode-3d' : 'mode-plain'} ${isDarkMode ? 'theme-dark' : ''} ${isMobileViewport ? 'mobile-viewport' : ''}`}
      style={{ '--ancient-scroll-image': `url(${ancientScrollImage})` }}
    >
      <nav className={`top-nav ${isMobileViewport ? 'mobile-nav' : ''}`}>
        {isMobileViewport ? (
          <>
            <div className="mobile-nav-row mobile-nav-row-top">
              <div className="nav-brand compact-brand">Pesach Haggadah</div>
              <div className="global-tools compact-group">
                <button className="lang-btn icon-btn" onClick={() => setIsTOCVisible(true)} title="Table of Contents">
                  ☰
                </button>
                <button className="lang-btn icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Night Mode">
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button className={`lang-btn icon-btn ${isPhonetic ? 'active' : ''}`} onClick={() => setIsPhonetic(!isPhonetic)} title="Toggle Phonetic Transliteration">
                  Aא
                </button>
              </div>
              <div className="language-toggle compact-group">
                <button className={`lang-btn ${lang === 'hebrew' ? 'active' : ''}`} onClick={() => setLang('hebrew')}>He</button>
                {!is3DEnabled && (
                  <button className={`lang-btn ${lang === 'both' ? 'active' : ''}`} onClick={() => setLang('both')}>Bi</button>
                )}
                <button className={`lang-btn ${lang === 'english' ? 'active' : ''}`} onClick={() => setLang('english')}>En</button>
              </div>
            </div>

            <div className="mobile-nav-row mobile-nav-row-bottom">
              {speechSupported && (
                <div className="voice-toggle compact-group compact-voice">
                  {isSpeaking && (
                    <div className="compact-voice-controls">
                      {canPauseResume && (
                        <button className="lang-btn icon-btn compact-icon-btn" onClick={handlePauseResumeToggle} title={isPaused ? "Resume Reading" : "Pause Reading"}>
                          {isPaused ? '▶️' : '⏸️'}
                        </button>
                      )}
                      <button className="lang-btn icon-btn compact-icon-btn" onClick={handleStopSpeech} title="Stop Reading">
                        ⏹️
                      </button>
                    </div>
                  )}
                  <select
                    value={selectedVoiceURI || ''}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="voice-select"
                  >
                    <option value="">System</option>
                    {voices.filter(isHebrewVoice).map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="scroll-toggle compact-group">
                <button className={`lang-btn ${autoScrollSpeed === null ? 'active' : ''}`} onClick={() => setAutoScrollSpeed(null)}>Off</button>
                <button className={`lang-btn ${autoScrollSpeed === 'slow' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('slow')}>S</button>
                <button className={`lang-btn ${autoScrollSpeed === 'medium' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('medium')}>M</button>
                <button className={`lang-btn ${autoScrollSpeed === 'fast' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('fast')}>H</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="nav-brand-row">
              <div className="nav-brand">Haggadah Shel Pesach</div>
            </div>
            <div className="nav-controls">
              <div className="global-tools">
                <button className="lang-btn icon-btn" onClick={() => setIsTOCVisible(true)} title="Table of Contents">
                  ☰
                </button>
                <button className="lang-btn icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Night Mode">
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button className={`lang-btn icon-btn ${isPhonetic ? 'active' : ''}`} onClick={() => setIsPhonetic(!isPhonetic)} title="Toggle Phonetic Transliteration">
                  Aא
                </button>
              </div>

              <div className="view-mode-toggle">
                <span className="scroll-label">View:</span>
                <button className={`lang-btn ${!is3DEnabled ? 'active' : ''}`} onClick={() => setIs3DMode(false)}>Plain</button>
                <button className={`lang-btn ${is3DEnabled ? 'active' : ''}`} onClick={() => setIs3DMode(true)}>3D Book</button>
              </div>

              {speechSupported && (
                <div className="voice-toggle">
                  <span className="scroll-label">Voice:</span>
                  {isSpeaking && (
                    <div style={{display: 'flex', gap: '4px', marginRight: '6px', borderRight: '1px solid var(--border-color)', paddingRight: '8px'}}>
                      {canPauseResume && (
                        <button className="lang-btn icon-btn" style={{padding: '0 4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}} onClick={handlePauseResumeToggle} title={isPaused ? "Resume Reading" : "Pause Reading"}>
                          {isPaused ? '▶️' : '⏸️'}
                        </button>
                      )}
                      <button className="lang-btn icon-btn" style={{padding: '0 4px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', filter: 'grayscale(0.2)'}} onClick={handleStopSpeech} title="Stop Reading">
                        ⏹️
                      </button>
                    </div>
                  )}
                  <select
                    value={selectedVoiceURI || ''}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="voice-select"
                  >
                    <option value="">System Default</option>
                    {voices.filter(isHebrewVoice).map(v => (
                       <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="language-toggle">
                <button className={`lang-btn ${lang === 'hebrew' ? 'active' : ''}`} onClick={() => setLang('hebrew')}>Hebrew</button>
                {!is3DEnabled && (
                  <button className={`lang-btn ${lang === 'both' ? 'active' : ''}`} onClick={() => setLang('both')}>Both</button>
                )}
                <button className={`lang-btn ${lang === 'english' ? 'active' : ''}`} onClick={() => setLang('english')}>English</button>
              </div>
              <div className="scroll-toggle">
                <span className="scroll-label">{is3DEnabled ? 'Auto Flip:' : 'Auto Scroll:'}</span>
                <button className={`lang-btn ${autoScrollSpeed === null ? 'active' : ''}`} onClick={() => setAutoScrollSpeed(null)}>Off</button>
                <button className={`lang-btn ${autoScrollSpeed === 'slow' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('slow')}>Slow</button>
                <button className={`lang-btn ${autoScrollSpeed === 'medium' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('medium')}>Med</button>
                <button className={`lang-btn ${autoScrollSpeed === 'fast' ? 'active' : ''}`} onClick={() => setAutoScrollSpeed('fast')}>High</button>
              </div>
            </div>
          </>
        )}
      </nav>

      <div className="main-layout">
        <TOCDrawer 
          isVisible={isTOCVisible} 
          onClose={() => setIsTOCVisible(false)} 
          onNavigate={handleNavigate} 
          activeStep={activeStep} 
        />
        
        <div className="content-area">
          {!is3DEnabled && (
            <header className="hero">
              <h1 className="hebrew hero-hebrew">הגדה של פסח</h1>
              <h1>The Passover Haggadah</h1>
              <p className="hero-sub">Complete text of the traditional Seder</p>
            </header>
          )}

          <main className="steps-grid">
            {is3DEnabled ? (() => {
              const isHebrew = lang === 'hebrew';
              
              let bookElements = [
                <Page key="cover-front">
                  <div className="cover-front">
                    <div className="cover-inner">
                      <h1 className="hebrew" style={{marginBottom: '0'}}>הגדה של פסח</h1>
                      <img src={menorahAntiqueImage} alt="Ornate Emblem" className="cover-ornament" />
                      <h1 style={{marginTop: '0'}}>The Passover Haggadah</h1>
                      <div className="cover-divider"></div>
                      <p style={{fontStyle: 'italic', color: '#d4af37', fontWeight: 'bold'}}>A Premium Seder Experience</p>
                    </div>
                  </div>
                </Page>
              ];

              paginatedHaggadah.forEach((passage, index) => {
                bookElements.push(
                  <Page key={`${passage.ref}-${passage.chunkId}`}>
                    <div className="book-passage-wrapper">
                      <PassageCard 
                        passage={passage} 
                        index={passage._originalIndex || index} 
                        languagePreference={lang} 
                        isPhonetic={isPhonetic}
                        showHeader={passage.showHeader}
                        showFooter={passage.showFooter}
                        onVisible={handleVisibleStep} 
                        speechSupported={speechSupported}
                        playingPassageRef={playingPassageRef}
                        isSpeakingState={isSpeaking}
                        onPlayPassage={handlePlayPassage}
                      />
                    </div>
                  </Page>
                );
              });

              bookElements.push(
                <Page key="cover-back">
                  <div className="cover-back">
                    <div className="cover-inner">
                      <h2 className="hebrew" style={{fontSize: '3rem', color: '#d4af37', textShadow: '2px 2px 8px rgba(0,0,0,0.9)'}}>לשנה הבאה בירושלים</h2>
                      <img src={haggadahOrnamentImage} alt="Ending Emblem" className="cover-ornament" style={{width: '90px'}} />
                      <h2 style={{color: '#e8dbb0', fontFamily: 'Cinzel, serif'}}>Next Year in Jerusalem!</h2>
                      <div className="cover-divider"></div>
                      <p style={{fontStyle: 'italic', color: '#d4af37', fontWeight: 'bold'}}>Chag Kasher V'Sameach</p>
                    </div>
                  </div>
                </Page>
              );

              if (isHebrew) {
                bookElements.reverse();
              }

              return (
                <div className="book-container">
                  <HTMLFlipBook 
                    key={isHebrew ? 'rtl-book' : 'ltr-book'} // Force remount to reset startPage
                    ref={flipBookRef}
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
                    startPage={isHebrew ? bookElements.length - 1 : 0}
                  >
                    {bookElements}
                  </HTMLFlipBook>
                </div>
              );
            })() : (
              haggadahFull.map((passage, index) => (
                <PassageCard 
                  key={passage.ref} 
                  passage={passage} 
                  index={index} 
                  languagePreference={lang} 
                  isPhonetic={isPhonetic}
                  onVisible={handleVisibleStep}
                  speechSupported={speechSupported}
                  playingPassageRef={playingPassageRef}
                  isSpeakingState={isSpeaking}
                  onPlayPassage={handlePlayPassage}
                />
              ))
            )}
          </main>

          <footer>
            <p className="footer-title">Created for Passover | פסח כשר ושמח</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
