import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Send, Calendar, User, ArrowLeft, Zap, Loader2 } from 'lucide-react';

export default function PostDetails() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [claps, setClaps] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [clapAnim, setClapAnim] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ""
      }
    })
      .then(res => {
        setPost(res.data);
        setClaps(res.data.claps || 0);
        setComments(res.data.comments || []);
      })
      .catch(err => {
        console.error("Fetch error:", err.response?.data || err.message);
      });
  }, [slug, token]);

  // ✅ ACTIVE SCROLL PROGRESS LISTENER
  useEffect(() => {
    if (!post) return;
    
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  // ✅ CLAP INTERACTION HANDLER
  const handleClap = async () => {
    if (!post) return;
    setClaps(prev => prev + 1);
    setClapAnim(true);
    setTimeout(() => setClapAnim(false), 600);

    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}/clap`);
    } catch (err) {
      console.error("Failed to sync claps with server:", err);
    }
  };

  // ✅ COMMENT SUBMISSION HANDLER
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!post || !commentText.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Append new comment to local state
      setComments(prev => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("Comment submission error:", err);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!post) {
    return <div className="p-20 text-center text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2"><Loader2 className="animate-spin text-indigo-600" /> Loading Story...</div>;
  }

  return (
    <>
      {/* ✅ GLOWING SCROLL PROGRESS INDICATOR */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-slate-100/10 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_#818cf8] transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto p-6 pt-24 pb-32 transition-colors duration-300 space-y-12 animate-entry"
      >
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Stories
        </Link>

        {/* Cover Image */}
        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-[3rem] shadow-xl border dark:border-slate-800"
          />
        )}

        {/* Title & Metadata */}
        <div className="space-y-4 text-left">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} /> By ScribeAI Creator
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
              <Zap size={14} /> AI Audited
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert text-slate-750 dark:text-slate-350 leading-relaxed font-sans border-t border-b border-slate-100 dark:border-slate-850 py-10 text-left">
          {post.content.split('\n').map((para, i) => para.trim() ? <p key={i} className="mb-6">{para}</p> : null)}
        </div>

        {/* ✅ INTERACTIVE FLOATING / BOTTOM CLAP CARD */}
        <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-lg transition-colors duration-300">
          <div className="flex items-center gap-6">
            {/* Clap Trigger */}
            <motion.button
              onClick={handleClap}
              animate={clapAnim ? { scale: [1, 1.4, 0.95, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
              className={`p-3 rounded-2xl cursor-pointer flex items-center justify-center transition-all ${
                claps > 0 
                  ? "bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-100 dark:border-red-900/50" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20 hover:bg-slate-200/50 dark:hover:bg-slate-700"
              }`}
              title="Like this story"
            >
              <Heart size={22} className={claps > 0 ? "fill-current animate-pulse" : ""} />
            </motion.button>

            <div className="text-left">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                {claps} {claps === 1 ? "Like" : "Likes"}
              </p>
              <p className="text-xs text-slate-400">Show your appreciation for the writer</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-450">
            <MessageSquare size={18} />
            <span className="text-sm font-bold">{comments.length} Responses</span>
          </div>
        </div>

        {/* ✅ RESPONSES / COMMENTS SECTION */}
        <div className="space-y-8 pt-6" id="comments">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 text-left">
            Responses ({comments.length})
          </h2>

          {/* Comment Submission Form */}
          {token ? (
            <form onSubmit={handlePostComment} className="space-y-4">
              <textarea
                placeholder="Share your thoughts or leave a response..."
                required
                rows={4}
                className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-colors text-sm font-sans resize-none shadow-inner"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 transition-all cursor-pointer"
                >
                  {commentLoading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Publish Response
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-slate-100/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-450 font-bold">
                Only registered creators can comment. Login to join ScribeAI discussions.
              </p>
              <Link 
                to="/login"
                className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition-all"
              >
                Log In
              </Link>
            </div>
          )}

          {/* Comments Stream */}
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] shadow-sm space-y-3 transition-colors duration-300 text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar Initials */}
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/10 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center">
                      {(comment.userName || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {comment.userName}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed pl-1">
                    {comment.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-6">
                No responses yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>

      </motion.article>
    </>
  );
}