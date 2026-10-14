import React, { useState } from 'react';
import { 
  auth, 
  db,
  doc,
  setDoc,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail
} from '../firebase';
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface LoginViewProps {
  onAuthSuccess: () => void;
}

export default function LoginView({ onAuthSuccess }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password reset state
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError("Please fill in your Full Name(First name) to register.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up flow
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await setDoc(doc(db, "members", res.user.uid), {
            uid: res.user.uid,
            fullName: fullName.trim(),
            email: email.trim(),
            createdAt: new Date().toISOString(),
            isManager: false
          });
        }
        setInfo("Operator account created successfully! You are now logged in.");
        setTimeout(() => {
          onAuthSuccess();
        }, 1200);
      } else {
        // Sign In flow
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "An error occurred. Please check your inputs and try again.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "The Email & Password Auth Provider is not enabled yet in your Firebase Console. Please go to the Firebase Console, navigate to 'Build > Authentication > Sign-in method', and click 'Add new provider' to enable the 'Email/Password' method.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setResetLoading(true);

    if (!resetEmail) {
      setResetError("Please enter your email address.");
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess(true);
      setResetEmail('');
    } catch (err: any) {
      console.error(err);
      let errMsg = "Unable to process password reset. Please try again.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        errMsg = "No registered account found with this email.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email authentication provider is not enabled in Firebase. Please enable Email/Password provider in your Firebase project console under Authentication > Sign-in method.";
      }
      setResetError(errMsg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" id="login-viewport">
      {/* Absolute ambient light pools */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl p-6 sm:p-8 relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg border border-blue-500/20 mb-3">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white mb-1">
            Cozy Cottage Stay
          </h2>
        </div>

        {/* Regular Login/Registration form */}
        {!forgotPasswordMode ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Context/Error messages */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-900/40 text-red-300 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
                
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400 mt-0.5" />
                <span>{info}</span>
                
              </div>
            )}

            {/* Fields */}
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                    <span className="text-xs font-bold font-mono">N</span>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 font-semibold leading-normal">
                  This name will be saved in the system. Enter your first name only.
                </p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordMode(true);
                      setResetSuccess(false);
                      setResetError(null);
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 transition duration-150 font-bold uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest duration-150 hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 mt-6 border-none"
            >
              {loading ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span>{isSignUp ? "Create Account" : "Login"}</span>
              )}
            </button>

            {/* Toggle */}
            <div className="text-center pt-4 border-t border-slate-700/40 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setInfo(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                {isSignUp ? (
                  <span>Already have an account? <strong className="text-blue-400">Sign in here</strong></span>
                ) : (
                  <span>Need to create your account? <strong className="text-blue-400">Sign up here</strong></span>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Password Reset Flow */
          <form onSubmit={handlePasswordReset} className="space-y-4 animate-fade-in">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-white mb-1">Forgot Password?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your email address to receive a password reset link directly to your Email.
              </p>
            </div>

            {resetError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-900/40 text-red-300 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-300 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400 mt-0.5" />
                <span>The password reset link have been sent to your Email. Please check your inbox or spam folder.</span>
              </div>
            )}

            {!resetSuccess && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {!resetSuccess && (
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest duration-150 hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {resetLoading ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetSuccess(false);
                  setResetError(null);
                }}
                className="w-full py-2.5 bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-650 transition cursor-pointer border-none"
              >
                Return to Login
              </button>
            </div>
          </form>
        )}

        {/* Informative Footer */}
        

      </div>
    </div>
  );
}
