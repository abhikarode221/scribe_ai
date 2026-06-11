import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-4 z-50 mx-auto max-w-6xl px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 rounded-3xl shadow-lg flex justify-between items-center transition-colors duration-300"
    >
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xl">
        <div className="p-2 bg-indigo-600 rounded-xl text-white">
          <PenTool size={20} />
        </div>
        ScribeAI
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        
        {/* Always visible */}
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Home
        </Link>

        {token ? (
          <div className="flex items-center gap-6">

            {/* Dashboard */}
            <Link 
              to="/dashboard" 
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>

            {/* Write */}
            <Link 
              to="/editor" 
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Write
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-2xl font-bold transition-all cursor-pointer"
            >
              Logout
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-4">

            <Link 
              to="/login" 
              className="font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Login
            </Link>

            <Link 
              to="/register" 
              className="px-5 py-2 bg-slate-900 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-md cursor-pointer"
            >
              Join ScribeAI
            </Link>

          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center border border-slate-200/20 shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-yellow-400 animate-pulse" /> : <Moon size={18} />}
        </button>

      </div>
    </motion.nav>
  );
}