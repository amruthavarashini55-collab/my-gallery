import React from "react";
import { motion } from "motion/react";
import { Heart, Compass, Pen, Zap, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export default function HobbySection() {
  const { t } = useLanguage();
  
  const favoriteMediums = [
    { name: t("hobby.tool1.name"), desc: t("hobby.tool1.desc") },
    { name: t("hobby.tool2.name"), desc: t("hobby.tool2.desc") },
    { name: t("hobby.tool3.name"), desc: t("hobby.tool3.desc") }
  ];

  return (
    <section id="hobby" className="py-24 bg-brand-beige px-6 lg:px-8 border-t border-brand-charcoal/5">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Storytelling / Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-brand-accent font-bold block">{t("hobby.tag")}</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-charcoal">
                {t("hobby.title1")} <span className="italic text-brand-accent font-normal">{t("hobby.title2")}</span>
              </h2>
            </div>

            <p className="text-brand-charcoal/85 text-base sm:text-lg leading-relaxed font-light">
              {t("hobby.desc")}
            </p>

            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                {t("hobby.why")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-charcoal text-sm">{t("hobby.reason1.title")}</h4>
                    <p className="text-xs text-brand-charcoal/70 mt-1">
                      {t("hobby.reason1.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-charcoal text-sm">{t("hobby.reason2.title")}</h4>
                    <p className="text-xs text-brand-charcoal/70 mt-1">
                      {t("hobby.reason2.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent">
                    <Pen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-charcoal text-sm">{t("hobby.reason3.title")}</h4>
                    <p className="text-xs text-brand-charcoal/70 mt-1">
                      {t("hobby.reason3.desc")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-brand-charcoal text-sm">{t("hobby.reason4.title")}</h4>
                    <p className="text-xs text-brand-charcoal/70 mt-1">
                      {t("hobby.reason4.desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sketchboard / Preferred Mediums Display card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-brand-charcoal/10 rounded-2xl p-8 shadow-md relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand-charcoal text-brand-beige text-[10px] uppercase tracking-widest font-bold px-3.5 py-1.5 rounded-full border border-brand-charcoal/20">
                {t("hobby.toolsTag")}
              </div>

              <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-6">
                {t("hobby.toolsTitle")}
              </h3>

              <div className="space-y-6">
                {favoriteMediums.map((medium, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-accent flex-none" />
                      <span className="font-semibold text-brand-charcoal text-sm">{medium.name}</span>
                    </div>
                    <p className="text-xs text-brand-charcoal/70 pl-6 leading-relaxed font-light">
                      {medium.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-brand-charcoal/5">
                <blockquote className="italic text-xs text-brand-charcoal/60 leading-relaxed relative pl-4 border-l-2 border-brand-accent">
                  {t("hobby.quote")}
                  <span className="block font-semibold uppercase tracking-widest text-[9px] mt-2 text-brand-charcoal/50 not-italic">{t("hobby.quoteAuthor")}</span>
                </blockquote>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
