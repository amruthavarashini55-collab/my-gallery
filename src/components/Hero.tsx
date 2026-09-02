import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Pencil, BookOpen, Image as ImageIcon, Loader2 } from "lucide-react";
import { getHeroImage, saveHeroImage, compressImage } from "../lib/firebase";
import { useLanguage } from "../lib/i18n";

// You can change this URL to point to any image you've uploaded to your gallery
const DEFAULT_HERO_IMAGE_URL = "https://1drv.ms/i/c/72717958e697027f/IQDuPC2zMKXRQbYys9HjvP6uAbFmsZwesljKTGvdK1kHAKo?e=lyO2Fn.jpg";

interface HeroProps {
  isAdmin?: boolean;
}

export default function Hero({ isAdmin = false }: HeroProps) {
  const { t } = useLanguage();
  const [heroImageUrl, setHeroImageUrl] = useState<string>(DEFAULT_HERO_IMAGE_URL);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getHeroImage().then((url) => {
      if (url) setHeroImageUrl(url);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Str = reader.result as string;
        const compressed = await compressImage(base64Str, 1200, 1200, 0.8);
        await saveHeroImage(compressed);
        setHeroImageUrl(compressed);
      } catch (err) {
        console.error("Error updating hero image:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const scrollToDoDrawing = () => {
    const drawingsSection = document.getElementById("drawings");
    if (drawingsSection) {
      drawingsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-brand-beige py-20 md:py-28 px-6 lg:px-8"
    >
      {/* Warm ambient glow inspired by the painting */}
      <div className="absolute inset-0 bg-radial from-orange-200/20 via-transparent to-transparent pointer-events-none" />

      {/* Hand-drawn geometric background grid decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Pencil-Sketch lines on the corners */}
      <div className="absolute top-10 right-10 w-32 h-32 opacity-20 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3">
          <path d="M10,90 Q50,10 90,90" />
          <path d="M20,90 Q50,20 80,90" />
          <path d="M30,90 Q50,30 70,90" />
        </svg>
      </div>
      <div className="absolute bottom-10 left-10 w-40 h-40 opacity-20 pointer-events-none hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 4" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-brand-accent/10 px-4 py-2 rounded-full border border-brand-accent/20 text-brand-accent text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="h-4 w-4" />
            <span>Welcome to My Creative Corner</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-charcoal leading-[1.1]"
          >
            {t("hero.title1")} <br />
            <span className="relative">
              <span className="relative z-10 text-brand-accent font-normal italic">{t("hero.title2")}</span>
              <span className="absolute left-0 bottom-2 sm:bottom-3 w-full h-[8px] bg-brand-accent/10 -rotate-1 rounded-sm -z-10" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-brand-charcoal/80 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light"
          >
            {t("hero.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={scrollToDoDrawing}
              className="bg-brand-charcoal text-brand-beige hover:bg-brand-accent hover:text-brand-charcoal border border-brand-charcoal hover:border-brand-accent transition-all duration-300 font-bold px-8 py-3.5 rounded-full shadow-md text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              <span>{t("hero.explore")}</span>
            </button>
            <a
              href="#hobby"
              className="border border-brand-charcoal/20 text-brand-charcoal/95 hover:border-brand-charcoal hover:bg-brand-charcoal/5 transition-all duration-300 font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-brand-accent" />
              <span>{t("hero.story")}</span>
            </a>
          </motion.div>
        </div>

        {/* Animated Artwork & Thought */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 flex justify-center lg:justify-end mt-12 lg:mt-0"
        >
          <div className="relative w-full max-w-[420px] flex flex-col items-center">
            
            {/* The Animated Image */}
            <motion.div 
              className="relative w-full aspect-[2/3] bg-white rounded-xl shadow-2xl p-3 border border-brand-charcoal/10 z-10"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="w-full h-full relative overflow-hidden rounded-lg bg-stone-100 group">
                {/* Fallback placeholder image matching the spiritual/art theme. 
                    User can upload their real image via admin panel later. */}
                <img 
                  src={heroImageUrl} 
                  alt={t("hero.devotionalArt")} 
                  className="w-full h-full object-contain object-center p-2"
                />
                
                {/* Subtle overlay glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-transparent pointer-events-none" />

                {/* Admin Image Edit Button */}
                {isAdmin && (
                  <div className="absolute inset-0 bg-brand-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-brand-beige text-brand-charcoal font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white shadow-xl transition-all cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("hero.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 text-brand-accent" />
                          <span>{t("hero.changePhoto")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* The Thought / Quote Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative -mt-10 z-20 bg-brand-beige border border-brand-charcoal/10 rounded-xl p-6 shadow-xl w-[90%] text-center"
            >
              <p className="font-serif text-lg md:text-xl text-brand-charcoal font-bold italic leading-snug">
                {t("hero.quote")}
              </p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
