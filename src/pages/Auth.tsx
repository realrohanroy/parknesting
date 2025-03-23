
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthType = 'signin' | 'signup';

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authType, setAuthType] = useState<AuthType>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse query param to determine if signin or signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'signup') {
      setAuthType('signup');
    } else {
      setAuthType('signin');
    }
  }, [location]);
  
  const toggleAuthType = () => {
    setAuthType(authType === 'signin' ? 'signup' : 'signin');
    navigate(`/auth?type=${authType === 'signin' ? 'signup' : 'signin'}`);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/search');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative">
                {/* Top decorative bar */}
                <div className="h-2 bg-gradient-to-r from-parkongo-400 to-parkongo-600" />
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">
                      {authType === 'signin' ? 'Welcome Back' : 'Create an Account'}
                    </h1>
                    <p className="text-gray-600">
                      {authType === 'signin' 
                        ? 'Sign in to your Parkongo account' 
                        : 'Join Parkongo to find or list parking spaces'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {authType === 'signup' && (
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-parkongo-400 focus:ring focus:ring-parkongo-200 focus:ring-opacity-50 transition-all"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-parkongo-400 focus:ring focus:ring-parkongo-200 focus:ring-opacity-50 transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-parkongo-400 focus:ring focus:ring-parkongo-200 focus:ring-opacity-50 transition-all"
                          placeholder={authType === 'signin' ? '••••••••' : 'Create password'}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {authType === 'signin' && (
                      <div className="flex justify-end">
                        <a href="#" className="text-sm text-parkongo-600 hover:text-parkongo-700">
                          Forgot password?
                        </a>
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      isLoading={isSubmitting}
                      fullWidth
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      customStyle="accent"
                    >
                      {authType === 'signin' ? 'Sign In' : 'Create Account'}
                    </Button>
                  </form>
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      {authType === 'signin' ? "Don't have an account?" : "Already have an account?"}
                      {' '}
                      <button
                        type="button"
                        onClick={toggleAuthType}
                        className="text-parkongo-600 hover:text-parkongo-700 font-medium"
                      >
                        {authType === 'signin' ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Button variant="outline" size="lg" className="justify-center">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" size="lg" className="justify-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.86 4.345A10.585 10.585 0 0 0 11.721 1.5C6.376 1.5 2 6.253 2 12.309c0 2.837 1.019 5.594 2.875 7.6L4 24l4.213-1.547a9.643 9.643 0 0 0 3.508.682h.003c5.343 0 9.72-4.754 9.72-10.806a11.968 11.968 0 0 0-2.584-7.984zm-7.139 16.6h-.002a8.03 8.03 0 0 1-3.822-.958l-.274-.16-2.85 1.036.943-2.876-.177-.276a8.434 8.434 0 0 1-1.295-4.415c0-4.878 3.644-8.848 8.128-8.848a8.044 8.044 0 0 1 5.884 2.766 9.033 9.033 0 0 1 2.191 6.097c-.001 4.879-3.645 8.847-8.126 8.847z"/>
                          <path d="M16.604 14.943a.992.992 0 0 0-.359-.164c-.158-.039-.913-.458-1.055-.51a.245.245 0 0 0-.281.062c-.367.41-.569.512-.796.612-.049.022-.095.042-.138.063a.457.457 0 0 1-.281.013c-.107-.024-.254-.089-.438-.171a7.458 7.458 0 0 1-1.171-.697 8.046 8.046 0 0 1-.888-.91c-.073-.086-.144-.175-.211-.257a3.22 3.22 0 0 1-.418-.661.405.405 0 0 1 .071-.368c.097-.11.194-.194.291-.277.024-.021.048-.042.071-.063.123-.116.189-.197.261-.332.036-.068.018-.143-.013-.202l-.45-1.196c-.12-.319-.246-.318-.335-.318h-.047a.866.866 0 0 0-.577.234c-.209.18-.8.778-.8 1.897 0 .364.081.704.157.938.202.619.7 1.228.798 1.357.03.039.42.57.1.137 1.252 1.879 2.807 2.777 4.104 3.18.525.136.935.217 1.253.217h.005c.347 0 .63-.134.833-.36.16-.17.35-.451.416-.706.046-.175.086-.356.104-.444.036-.178.051-.346.031-.396-.034-.09-.127-.138-.262-.196z"/>
                        </svg>
                        Phone
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              By {authType === 'signin' ? 'signing in' : 'creating an account'}, you agree to Parkongo's{' '}
              <a href="#" className="text-parkongo-600 hover:text-parkongo-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-parkongo-600 hover:text-parkongo-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
