import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, form);
      alert("Registration successful! You can now log in.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Email might already be taken.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md space-y-8 transition-colors duration-300"
      >
        <div className="text-center space-y-2">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400">Join the ScribeAI community today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" placeholder="Email Address" required
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
            <input 
              type="password" placeholder="Create Password" required
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>
          
          <button className="w-full bg-slate-900 dark:bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-550 transition-all shadow-lg cursor-pointer">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}