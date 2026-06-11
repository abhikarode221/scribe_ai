import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', res.data.email);
      localStorage.setItem('userId', res.data.id);
      navigate('/editor');
      window.location.reload(); // Refresh to update Navbar
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md space-y-8 transition-colors duration-300"
      >
        <div className="text-center space-y-2">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400">Sign in to your ScribeAI dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" placeholder="Email" required
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <button className="w-full bg-slate-900 dark:bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-550 transition-all shadow-lg cursor-pointer">
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}