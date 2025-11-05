import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Mail, Key } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34.05,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const AuthForm = ({ isSignUpForm }) => {
  const { signIn, signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e, action) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await action(email, password);
    setLoading(false);
    if (!error) {
      toast({ title: isSignUpForm ? 'Account created!' : 'Welcome back!', description: isSignUpForm ? 'Please check your email to verify your account.' : 'You have successfully signed in.' });
      navigate('/dashboard');
    }
  };
  
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    await signInWithProvider(provider);
    // Note: The user will be redirected by Supabase, so setLoading(false) might not be reached.
  };

  return (
    <motion.div
      key={isSignUpForm ? 'signup' : 'signin'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <form onSubmit={(e) => handleAuthAction(e, isSignUpForm ? signUp : signIn)} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2 text-emerald-600">{isSignUpForm ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-center text-gray-500 mb-8">{isSignUpForm ? 'Join the BuildNet network.' : 'Sign in to your dashboard.'}</p>
        
        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input id="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-12" />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 h-12" />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-8 h-12 text-base bg-emerald-600 hover:bg-emerald-700">
          {loading ? 'Processing...' : (isSignUpForm ? <><UserPlus className="mr-2" />Sign Up</> : <><LogIn className="mr-2" />Sign In</>)}
        </Button>

        <div className="relative flex py-5 items-center"><div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink mx-4 text-gray-400 text-xs">OR CONTINUE WITH</span><div className="flex-grow border-t border-gray-300"></div></div>

        <Button type="button" variant="outline" onClick={() => handleSocialLogin('google')} disabled={loading} className="w-full h-12 text-base border-gray-300 text-gray-700">
          <GoogleIcon className="mr-3 h-5 w-5" />
          {isSignUpForm ? 'Sign Up with Google' : 'Sign In with Google'}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUpForm ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={() => navigate(isSignUpForm ? '/account' : '/account?signup=true')} className="font-semibold text-emerald-600 hover:underline">
            {isSignUpForm ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </motion.div>
  );
};

const AccountPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isSignUp = params.get('signup') === 'true';

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  if (loading || user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>Loading...</p>
        </div>
      );
  }

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} - BuildNet</title>
        <meta name="description" content="Access your BuildNet account or create a new one." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button>
        </div>
        <AuthForm isSignUpForm={isSignUp} />
      </div>
    </>
  );
};

export default AccountPage;