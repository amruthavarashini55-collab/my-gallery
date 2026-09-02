import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'kn';

interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.gallery": { en: "Gallery", kn: "ಗ್ಯಾಲರಿ" },
  "nav.hobby": { en: "My Hobby", kn: "ನನ್ನ ಹವ್ಯಾಸ" },
  "nav.admin": { en: "Admin Login", kn: "ನಿರ್ವಾಹಕರ ಲಾಗಿನ್" },
  "nav.logout": { en: "Log Out", kn: "ಲಾಗ್ ಔಟ್" },
  "nav.owner": { en: "Owner Portal", kn: "ಮಾಲೀಕರ ಪೋರ್ಟಲ್" },

  // Hero
  "hero.title1": { en: "My Drawing", kn: "ನನ್ನ ಚಿತ್ರಕಲಾ" },
  "hero.title2": { en: "Gallery", kn: "ಗ್ಯಾಲರಿ" },
  "hero.description": { 
    en: "Drawing is one of my favorite hobbies and interests. I enjoy creating drawings in my free time and sharing my artwork through this gallery.", 
    kn: "ಚಿತ್ರ ಬಿಡಿಸುವುದು ನನ್ನ ನೆಚ್ಚಿನ ಹವ್ಯಾಸಗಳಲ್ಲಿ ಒಂದು. ನನ್ನ ಬಿಡುವಿನ ವೇಳೆಯಲ್ಲಿ ಚಿತ್ರಗಳನ್ನು ರಚಿಸುವುದು ಮತ್ತು ಈ ಗ್ಯಾಲರಿಯ ಮೂಲಕ ನನ್ನ ಕಲಾಕೃತಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದು ನನಗೆ ತುಂಬಾ ಇಷ್ಟ." 
  },
  "hero.explore": { en: "Explore My Artwork", kn: "ನನ್ನ ಕಲಾಕೃತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ" },
  "hero.story": { en: "My Hobby Story", kn: "ನನ್ನ ಹವ್ಯಾಸದ ಕಥೆ" },
  "hero.quote": { en: '"Devotion is the canvas where the soul paints its truest colors."', kn: '"ಭಕ್ತಿಯು ಆತ್ಮವು ತನ್ನ ನೈಜ ಬಣ್ಣಗಳನ್ನು ಬಿಡಿಸುವ ಕ್ಯಾನ್ವಾಸ್ ಆಗಿದೆ."' },
  "hero.changePhoto": { en: "Change Photo", kn: "ಫೋಟೋ ಬದಲಾಯಿಸಿ" },
  "hero.uploading": { en: "Uploading...", kn: "ಅಪ್ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },

  // Loading
  "loading.init": { en: "Initializing Art Studio...", kn: "ಆರ್ಟ್ ಸ್ಟುಡಿಯೋ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ..." },
  "loading.brushing": { en: "Brushing canvas...", kn: "ಕ್ಯಾನ್ವಾಸ್ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..." },

  // Footer
  "footer.rights": { en: "Created with passion for drawing ❤️ © 2026 All Rights Reserved.", kn: "ಚಿತ್ರಕಲೆಯ ಮೇಲಿನ ಆಸಕ್ತಿಯಿಂದ ರಚಿಸಲಾಗಿದೆ ❤️ © 2026 ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ." },
  "footer.public": { en: "Public Gallery", kn: "ಸಾರ್ವಜನಿಕ ಗ್ಯಾಲರಿ" },

  // Gallery
  "gallery.title": { en: "Artwork Gallery", kn: "ಕಲಾಕೃತಿಗಳ ಗ್ಯಾಲರಿ" },
  "gallery.subtitle": { en: "A collection of my recent drawings and sketches.", kn: "ನನ್ನ ಇತ್ತೀಚಿನ ಚಿತ್ರಕಲೆಗಳ ಸಂಗ್ರಹ." },
  "gallery.empty": { en: "No drawings in the gallery yet.", kn: "ಗ್ಯಾಲರಿಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಚಿತ್ರಗಳಿಲ್ಲ." },
  "gallery.adminEmpty": { en: "Upload your first drawing to display it here.", kn: "ನಿಮ್ಮ ಮೊದಲ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲು ಅಪ್ಲೋಡ್ ಮಾಡಿ." },

  // Hobby
  "hobby.tag": { en: "My Passion & Hobby", kn: "ನನ್ನ ಉತ್ಸಾಹ ಮತ್ತು ಹವ್ಯಾಸ" },
  "hobby.title1": { en: "Finding Peace on", kn: "ಶಾಂತಿಯನ್ನು ಕಂಡುಕೊಳ್ಳುವುದು" },
  "hobby.title2": { en: "Paper", kn: "ಕಾಗದದ ಮೇಲೆ" },
  "hobby.desc": { en: "For as long as I can remember, drawing has been my sanctuary. In a busy world, there is something deeply meditative about sitting down with a clean sheet of paper, a selection of pencils, and letting my hands translate my thoughts into tangible strokes.", kn: "ನನಗೆ ನೆನಪಿರುವವರೆಗೂ, ಚಿತ್ರ ಬಿಡಿಸುವುದು ನನ್ನ ಆಶ್ರಯವಾಗಿದೆ. ಈ ಕಾರ್ಯನಿರತ ಜಗತ್ತಿನಲ್ಲಿ, ಖಾಲಿ ಕಾಗದ ಮತ್ತು ಪೆನ್ಸಿಲ್‌ಗಳೊಂದಿಗೆ ಕುಳಿತು, ನನ್ನ ಆಲೋಚನೆಗಳನ್ನು ರೇಖೆಗಳಾಗಿ ಪರಿವರ್ತಿಸುವುದು ನನಗೆ ಬಹಳ ಧ್ಯಾನದ ಅನುಭವ ನೀಡುತ್ತದೆ." },
  
  "hobby.why": { en: "Why I Draw in My Free Time:", kn: "ಬಿಡುವಿನ ವೇಳೆಯಲ್ಲಿ ನಾನು ಏಕೆ ಚಿತ್ರಿಸುತ್ತೇನೆ:" },
  "hobby.reason1.title": { en: "Mindful Sanctuary", kn: "ಧ್ಯಾನಸ್ಥ ಆಶ್ರಯ" },
  "hobby.reason1.desc": { en: "A quiet offline space where notifications disappear, allowing full visual focus and creative calmness.", kn: "ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲದ ಪ್ರಶಾಂತವಾದ ಆಫ್‌ಲೈನ್ ಸ್ಥಳ, ಇದು ಸಂಪೂರ್ಣ ದೃಶ್ಯ ಗಮನ ಮತ್ತು ಸೃಜನಶೀಲ ನೆಮ್ಮದಿಗೆ ಅನುವು ಮಾಡಿಕೊಡುತ್ತದೆ." },
  
  "hobby.reason2.title": { en: "Infinite Exploration", kn: "ಅನಂತ ಅನ್ವೇಷಣೆ" },
  "hobby.reason2.desc": { en: "No boundaries. A sketch can be portrait realism one day, and a whimsical abstract forest the next.", kn: "ಯಾವುದೇ ಮಿತಿಗಳಿಲ್ಲ. ಒಂದು ದಿನ ನೈಜ ಭಾವಚಿತ್ರ, ಮರುದಿನ ಕಾಲ್ಪನಿಕ ಅಮೂರ್ತ ಅರಣ್ಯ, ಹೀಗೆ ಅನಂತ ಅನ್ವೇಷಣೆ." },
  
  "hobby.reason3.title": { en: "Tangible Progress", kn: "ನೈಜ ಪ್ರಗತಿ" },
  "hobby.reason3.desc": { en: "Watching an empty paper gradually fill with depth, line weight, and shadows is incredibly rewarding.", kn: "ಖಾಲಿ ಕಾಗದವು ಕ್ರಮೇಣ ಆಳ, ರೇಖೆಯ ತೂಕ ಮತ್ತು ನೆರಳುಗಳಿಂದ ತುಂಬಿಕೊಳ್ಳುವುದನ್ನು ನೋಡುವುದು ನಂಬಲಾಗದಷ್ಟು ಲಾಭದಾಯಕವಾಗಿದೆ." },
  
  "hobby.reason4.title": { en: "Idea Journal", kn: "ಕಲ್ಪನೆಗಳ ಡೈರಿ" },
  "hobby.reason4.desc": { en: "Every drawing is a visual record of a specific afternoon, an emotion, or an inspiration from life.", kn: "ಪ್ರತಿಯೊಂದು ಚಿತ್ರವು ಒಂದು ನಿರ್ದಿಷ್ಟ ಮಧ್ಯಾಹ್ನ, ಭಾವನೆ ಅಥವಾ ಜೀವನದ ಸ್ಫೂರ್ತಿಯ ದೃಶ್ಯ ದಾಖಲೆಯಾಗಿದೆ." },

  "hobby.toolsTag": { en: "Favorite Tools", kn: "ನೆಚ್ಚಿನ ಪರಿಕರಗಳು" },
  "hobby.toolsTitle": { en: "Preferred Mediums", kn: "ನೆಚ್ಚಿನ ಮಾಧ್ಯಮಗಳು" },
  
  "hobby.tool1.name": { en: "Graphite & Charcoal", kn: "ಗ್ರಾಫೈಟ್ ಮತ್ತು ಇದ್ದಿಲು (ಚಾರ್ಕೋಲ್)" },
  "hobby.tool1.desc": { en: "For exploring deep, dramatic contrasts, soft blending, and fine photorealistic facial shadows.", kn: "ಆಳವಾದ, ನಾಟಕೀಯ ಕಾಂಟ್ರಾಸ್ಟ್‌ಗಳು, ಮೃದುವಾದ ಮಿಶ್ರಣ ಮತ್ತು ನೈಜ ಭಾವಚಿತ್ರಗಳಿಗಾಗಿ." },
  
  "hobby.tool2.name": { en: "Fine Liner & Ink", kn: "ಫೈನ್ ಲೈನರ್ ಮತ್ತು ಶಾಯಿ (ಇಂಕ್)" },
  "hobby.tool2.desc": { en: "For clean crosshatch shading, intricate floral lines, and bold graphic outlines.", kn: "ಸ್ವಚ್ಛವಾದ ಶೇಡಿಂಗ್, ಸಂಕೀರ್ಣವಾದ ಹೂವಿನ ರೇಖೆಗಳು ಮತ್ತು ದಪ್ಪ ಗ್ರಾಫಿಕ್ ಔಟ್‌ಲೈನ್‌ಗಳಿಗಾಗಿ." },
  
  "hobby.tool3.name": { en: "Watercolor & Gouache", kn: "ವಾಟರ್ ಕಲರ್ ಮತ್ತು ಗೌಚೆ" },
  "hobby.tool3.desc": { en: "For adding light translucent washes and dreamlike moods to graphite sketches.", kn: "ಗ್ರಾಫೈಟ್ ರೇಖಾಚಿತ್ರಗಳಿಗೆ ತಿಳಿಯಾದ ಬಣ್ಣ ಮತ್ತು ಕನಸಿನಂತಹ ಭಾವನೆಗಳನ್ನು ಸೇರಿಸಲು." },
  
  "hobby.quote": { en: '"Every child is an artist. The problem is how to remain an artist once we grow up."', kn: '"ಪ್ರತಿ ಮಗು ಒಬ್ಬ ಕಲಾವಿದ. ಬೆಳೆದ ನಂತರವೂ ಕಲಾವಿದನಾಗಿ ಹೇಗೆ ಉಳಿಯಬೇಕು ಎಂಬುದೇ ಸಮಸ್ಯೆ."' },
  "hobby.quoteAuthor": { en: "— Pablo Picasso", kn: "— ಪ್ಯಾಬ್ಲೋ ಪಿಕಾಸೊ" }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
