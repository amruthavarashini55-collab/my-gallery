import React from "react";
import { User, LogOut, LayoutDashboard, Palette, Eye, Globe } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { useLanguage } from "../lib/i18n";

interface NavbarProps {
  currentView: "public" | "admin";
  setCurrentView: (view: "public" | "admin") => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Navbar({
  currentView,
  setCurrentView,
  user,
  isAdmin,
  onLogout,
}: NavbarProps) {
  const { lang, setLang, t } = useLanguage();

  const scrollToSection = (id: string) => {
    setCurrentView("public");
    // Wait a brief tick for the view state to update and render the public sections
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'kn' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-charcoal/5 bg-brand-beige/90 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Brand Title */}
        <button
          onClick={() => {
            setCurrentView("public");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-brand-charcoal hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Palette className="h-6 w-6 text-brand-accent animate-pulse" />
          <span className="hidden sm:inline">{t("hero.title1")} {t("hero.title2")}</span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          {currentView === "public" ? (
            <>
              <button
                onClick={() => scrollToSection("drawings")}
                className="text-brand-charcoal/70 hover:text-brand-charcoal transition-colors cursor-pointer"
              >
                {t("nav.gallery")}
              </button>
              <button
                onClick={() => scrollToSection("hobby")}
                className="text-brand-charcoal/70 hover:text-brand-charcoal transition-colors cursor-pointer"
              >
                {t("nav.hobby")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentView("public")}
              className="flex items-center gap-1.5 text-brand-charcoal/70 hover:text-brand-charcoal transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>{t("footer.public")}</span>
            </button>
          )}

          <div className="h-4 w-px bg-brand-charcoal/10" />
          
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-brand-charcoal hover:text-brand-accent transition-colors font-bold uppercase tracking-wider text-xs"
            title="Toggle Language (English / ಕನ್ನಡ)"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          <div className="h-4 w-px bg-brand-charcoal/10" />

          {/* User Status / Action */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-brand-charcoal/80 bg-brand-accent/10 px-3 py-1.5 rounded-full text-xs font-semibold">
                <User className="h-3.5 w-3.5 text-brand-accent" />
                <span className="truncate max-w-[120px]">{user.email}</span>
                {isAdmin && <span className="text-[10px] uppercase tracking-wider bg-brand-accent text-white px-1.5 py-0.5 rounded-sm font-bold">Admin</span>}
              </div>
              
              {currentView === "public" && isAdmin && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className="flex items-center gap-1.5 text-xs text-brand-accent hover:underline font-bold cursor-pointer"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>
              )}

              <button
                onClick={onLogout}
                title="Log Out"
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView("admin")}
              className={`text-xs uppercase tracking-wider font-bold px-4 py-2 border rounded-full transition-all cursor-pointer ${
                currentView === "admin"
                  ? "bg-brand-charcoal text-brand-beige border-brand-charcoal"
                  : "border-brand-charcoal/20 text-brand-charcoal/80 hover:border-brand-charcoal hover:text-brand-charcoal"
              }`}
            >
              {t("nav.admin")}
            </button>
          )}
        </nav>

        {/* Mobile Navigation View Indicators */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-brand-charcoal hover:text-brand-accent transition-colors font-bold text-[10px]"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
          </button>
          
          {currentView === "public" ? (
            <button
              onClick={() => setCurrentView("admin")}
              className="text-xs font-bold text-brand-accent uppercase tracking-wider bg-brand-accent/5 hover:bg-brand-accent/10 px-3.5 py-2 rounded-full border border-brand-accent/20 transition-all cursor-pointer"
            >
              {user && isAdmin ? "Dashboard" : t("nav.admin")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView("public")}
                className="text-xs font-semibold text-brand-charcoal/80 hover:text-brand-charcoal bg-brand-charcoal/5 px-3 py-2 rounded-full border border-brand-charcoal/10 cursor-pointer"
              >
                {t("footer.public")}
              </button>
              {user && (
                <button
                  onClick={onLogout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
