import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, ADMIN_EMAIL } from "../lib/firebase";
import { Lock, ShieldAlert, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Enforce admin email strictly at login
      if (result.user.email !== ADMIN_EMAIL) {
        setError(`Access Denied: You signed in with ${result.user.email}, but only the website owner (${ADMIN_EMAIL}) has admin access.`);
        // Note: In a production app, we would also sign the user out here or let Firestore rules block them.
        return;
      }
      
      onSuccess();
    } catch (err: any) {
      console.error("Authentication error: ", err);
      let friendlyMsg = "Authentication failed. Please try again.";
      if (err.code === "auth/popup-closed-by-user") {
        friendlyMsg = "Sign-in popup was closed before completion.";
      } else if (err.code === "auth/cancelled-popup-request") {
        friendlyMsg = "Multiple popups were opened. Please try again.";
      }
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-brand-charcoal/10 rounded-2xl p-8 shadow-lg space-y-6">
      
      {/* Form Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-accent/10 text-brand-accent mb-2">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal">
          Admin Login
        </h3>
        <p className="text-xs text-brand-charcoal/60 max-w-xs mx-auto leading-relaxed">
          Only authenticated website administrators can access drawing uploads and adjustments. Sign in with your Google account.
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium p-3.5 rounded-lg">
          <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-brand-charcoal hover:bg-brand-accent text-brand-beige hover:text-brand-charcoal font-bold py-3.5 rounded-lg text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-brand-charcoal/40 font-medium uppercase tracking-wider mt-4">
        Admin Access restricted to: {ADMIN_EMAIL}
      </p>
    </div>
  );
}
