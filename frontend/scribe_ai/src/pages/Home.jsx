import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart3, Zap } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/posts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => setPosts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-12 px-6"
    >
      
      {/* Hero Section - Centered with Flexbox */}
      <header className="py-24 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Write <span className="text-indigo-600 dark:text-indigo-400">Smarter.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          The intersection of human creativity and machine intelligence has 
          reached a tipping point. Write, curate, and evolve with ScribeAI.
        </motion.p>
      </header>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px] pb-20">
        {posts.length > 0 ? posts.map((post, index) => (
          <Link 
            to={`/post/${post.slug}`} 
            key={post._id} 
            className={index === 0 ? 'md:col-span-2 md:row-span-1' : ''}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="h-full group relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-slate-950/80 transition-all cursor-pointer"
            >
              {/* Image Container */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.coverImage || "https://via.placeholder.com/800x400?text=ScribeAI"} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content Area */}
              <div className="p-8 flex flex-col justify-between h-[calc(100%-12rem)]">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest rounded-full border border-indigo-100/10">
                      Article
                    </span>
                    <ArrowUpRight className="text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" size={24} />
                  </div>

                  <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h2>

                  <p className="mt-3 text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed">
                    {post.excerpt || post.content.substring(0, 120)}...
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="flex items-center gap-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-4">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 size={14} className="text-slate-300 dark:text-slate-600"/> {post.views || 0} Views
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <Zap size={14}/> AI Audited
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-xl font-medium">No posts yet.</p>
            <p className="text-sm mt-2">Head to the Editor to create your first masterpiece!</p>
            <Link to="/editor" className="mt-6 bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md">
              Start Writing
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}