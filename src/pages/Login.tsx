import { useState } from 'react';
import { signInWithPopup, AuthError } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login failed:', authError);
      
      if (authError.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion. Please try again.');
      } else if (authError.code === 'auth/blocked-at-popup-request') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('An unexpected error occurred during sign-in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-rose-500 p-4 rounded-2xl shadow-xl shadow-rose-200/50">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Spark</h1>
          <p className="text-zinc-500 font-medium">Find your perfect connection.</p>
        </div>

        <div className="space-y-4 pt-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-700 px-6 py-4 rounded-2xl font-semibold shadow-sm hover:bg-zinc-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            )}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          
          <p className="text-xs text-zinc-400 px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-rose-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
    </div>
  );
}

