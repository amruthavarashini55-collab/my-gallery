import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, getDrawings, isUserAdmin } from "./lib/firebase";
import { Drawing } from "./types";
import { Loader2, Palette, ShieldAlert } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GallerySection from "./components/GallerySection";
import HobbySection from "./components/HobbySection";
import LoginForm from "./components/LoginForm";
import AdminPanel from "./components/AdminPanel";
import { useLanguage } from "./lib/i18n";

export default function App() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<"public" | "admin">("public");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loadingDrawings, setLoadingDrawings] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch drawings from Firestore database
  const loadDrawings = async () => {
    try {
      setLoadingDrawings(true);
      const data = await getDrawings();
      setDrawings(data);
    } catch (err) {
      console.error("Error loading drawings in app: ", err);
    } finally {
      setLoadingDrawings(false);
    }
  };

  // Setup Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const checkAdmin = isUserAdmin(currentUser);
      setIsAdmin(checkAdmin);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Fetch drawings on mount
  useEffect(() => {
    loadDrawings();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setUser(null);
      setCurrentView("public");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-brand-beige text-brand-charcoal space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-accent" />
        <p className="font-serif text-sm tracking-widest uppercase text-brand-charcoal/60">{t("loading.init")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-beige">
      
      {/* Shared Header Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === "public" ? (
          /* PUBLIC GALLERY SITE (Home | Drawings | Hobby) */
          <div>
            <Hero isAdmin={isAdmin} />
            
            {loadingDrawings ? (
              <div className="py-24 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-accent mx-auto" />
                <p className="text-xs tracking-wider text-brand-charcoal/50 uppercase font-bold">{t("loading.brushing")}</p>
              </div>
            ) : (
              <GallerySection
                drawings={drawings}
                isAdmin={isAdmin}
                onEditClick={() => setCurrentView("admin")}
                onDeleteClick={() => setCurrentView("admin")}
              />
            )}
            
            <HobbySection />
          </div>
        ) : (
          /* SECURE ADMIN INTERFACE (Login or Admin Dashboard) */
          <div className="py-12 md:py-16">
            {!user || !isAdmin ? (
              <div className="px-6">
                <LoginForm onSuccess={loadDrawings} />
                
                {/* Visual warning for unauthenticated visitors attempting direct URL hacks */}
                {user && !isAdmin && (
                  <div className="mt-8 max-w-md mx-auto flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold p-4 rounded-xl shadow-xs">
                    <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <span>Logged in as non-admin profile:</span>
                      <p className="font-bold text-brand-charcoal/70 mt-0.5">{user.email}</p>
                      <p className="mt-2 font-normal leading-relaxed text-brand-charcoal/80">
                        Only the authorized gallery owner ({'amrutha.varashini55@gmail.com'}) can access the upload dashboard. Please log in with the correct account.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AdminPanel
                drawings={drawings}
                onRefresh={loadDrawings}
              />
            )}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <footer className="bg-brand-charcoal text-brand-beige/80 border-t border-brand-charcoal/10 py-10 px-6 lg:px-8 text-center text-xs tracking-wide">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-serif font-semibold text-white">
            <Palette className="h-4 w-4 text-brand-accent" />
            <span>{t("hero.title1")} {t("hero.title2")}</span>
          </div>
          
          <p className="text-brand-beige/50 font-light">
            {t("footer.rights")}
          </p>
          
          <div className="flex gap-4 text-brand-beige/60">
            <button 
              onClick={() => {
                setCurrentView("public");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className="hover:text-white hover:underline cursor-pointer"
            >
              {t("footer.public")}
            </button>
            <span className="text-brand-beige/20">|</span>
            <button 
              onClick={() => setCurrentView("admin")} 
              className="hover:text-white hover:underline cursor-pointer"
            >
              {t("nav.owner")}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
