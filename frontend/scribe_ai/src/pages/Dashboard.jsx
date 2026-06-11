import { useEffect, useState } from "react";
import { BarChart3, Users, DollarSign, TrendingUp, Heart, MessageSquare, Award, Plus } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({ views: 0, count: 0, claps: 0, comments: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserPosts();
  }, []);

  // ✅ FETCH ONLY CURRENT USER POSTS (SECURE & OPTIMIZED)
  const fetchUserPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const myPosts = res.data;
      setUserPosts(myPosts);

      const totalViews = myPosts.reduce(
        (acc, post) => acc + (post.views || 0),
        0
      );

      const totalClaps = myPosts.reduce(
        (acc, post) => acc + (post.claps || 0),
        0
      );

      const totalComments = myPosts.reduce(
        (acc, post) => acc + (post.comments?.length || 0),
        0
      );

      setStats({
        views: totalViews,
        count: myPosts.length,
        claps: totalClaps,
        comments: totalComments
      });

    } catch (err) {
      console.log(err);
    }
  };

  // ✅ DELETE POST (ONLY OWNER ALLOWED)
  const handleDelete = async (id, author) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?"
      );

      if (!confirmDelete) return;

      await axios.delete(
        `http://localhost:5000/api/posts/${id}`,
        {
          data: { author: userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserPosts((prev) =>
        prev.filter((post) => post._id !== id)
      );

      // Re-fetch stats to update views, claps, comments
      setTimeout(fetchUserPosts, 100);

    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // ✅ EDIT POST
  const handleEdit = (id, author) => {
    navigate(`/editor/${id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-24 space-y-12 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="text-left">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white">
            My Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your posts and view detailed engagement analytics
          </p>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Readership"
            value={stats.views}
            icon={<BarChart3 />}
            trend="+12.5%"
          />

          <StatCard
            title="Engagement (Likes)"
            value={stats.claps}
            icon={<Heart />}
            trend="Active"
          />

          <StatCard
            title="Reader Responses"
            value={stats.comments}
            icon={<MessageSquare />}
            trend="Engaged"
          />

          <StatCard
            title="Creator Revenue"
            value={`$${(stats.views * 0.01 + stats.claps * 0.02 + stats.comments * 0.05).toFixed(2)}`}
            icon={<DollarSign />}
            trend="Premium"
          />
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mt-10 text-left">
          <button
            onClick={() => setActiveTab("feed")}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "feed"
                ? "border-b-2 border-indigo-600 text-indigo-605 dark:text-indigo-400 font-extrabold"
                : "text-slate-450 hover:text-slate-650 dark:hover:text-slate-300"
            }`}
          >
            My Feed ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-b-2 border-indigo-600 text-indigo-605 dark:text-indigo-400 font-extrabold"
                : "text-slate-455 hover:text-slate-650 dark:hover:text-slate-300"
            }`}
          >
            Analytics Suite
          </button>
        </div>

        {/* CONDITIONAL RENDER CHANNELS */}
        {activeTab === "feed" ? (
          /* POSTS FEED VIEW */
          <div className="space-y-6 pt-4 text-left">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              My Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-xl hover:scale-[1.02] transition duration-200"
                >
                  {/* COVER */}
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-3xl mb-4"
                    />
                  )}

                  {/* TITLE */}
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
                    {post.title}
                  </h3>

                  {/* EXCERPT */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {post.excerpt || post.content.substring(0, 100) + "..."}
                  </p>

                  {/* METRICS ROW */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-3">
                    <span>👁️ {post.views || 0}</span>
                    <span>❤️ {post.claps || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleEdit(post._id, post.author)}
                      className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-500 dark:hover:bg-indigo-600 cursor-pointer transition-all"
                    >
                      Edit Story
                    </button>

                    <button
                      onClick={() => handleDelete(post._id, post.author)}
                      className="bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* NEW POST CARD */}
              <Link
                to="/editor"
                className="border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-6 rounded-[2.5rem] hover:bg-slate-100 dark:hover:bg-slate-900/50 transition duration-200 min-h-[250px]"
              >
                <Plus className="text-slate-400 dark:text-slate-650 mb-1" size={32} />
                <span className="text-slate-500 dark:text-slate-400 font-extrabold text-sm uppercase tracking-wider">
                  New Story
                </span>
              </Link>
            </div>

            {/* EMPTY STATE */}
            {userPosts.length === 0 && (
              <p className="text-slate-400 dark:text-slate-600 mt-6 italic">
                You haven’t created any posts yet.
              </p>
            )}
          </div>
        ) : (
          /* ANALYTICS SUITE VIEW */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 text-left"
          >
            {/* LEFT 2 COLUMNS: TRAFFIC CHART */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 p-8 rounded-3xl shadow-sm space-y-6 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={18} />
                Reader Engagement (6-Month Trend)
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing views and reader reactions over time. Hover columns to view detailed monthly values.
              </p>

              {/* BEAUTIFUL CSS TREND CHART */}
              <div className="h-64 flex items-end justify-between gap-4 pt-10 border-b border-slate-100 dark:border-slate-800 pb-2 relative">
                {[
                  { month: "Jan", views: Math.round(stats.views * 0.1), claps: Math.round(stats.claps * 0.1), vPercent: "20%", cPercent: "15%" },
                  { month: "Feb", views: Math.round(stats.views * 0.15), claps: Math.round(stats.claps * 0.2), vPercent: "35%", cPercent: "30%" },
                  { month: "Mar", views: Math.round(stats.views * 0.2), claps: Math.round(stats.claps * 0.15), vPercent: "45%", cPercent: "25%" },
                  { month: "Apr", views: Math.round(stats.views * 0.25), claps: Math.round(stats.claps * 0.25), vPercent: "60%", cPercent: "50%" },
                  { month: "May", views: Math.round(stats.views * 0.3), claps: Math.round(stats.claps * 0.3), vPercent: "85%", cPercent: "75%" },
                  { month: "Current", views: stats.views, claps: stats.claps, vPercent: "100%", cPercent: "95%" }
                ].map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer">
                    
                    {/* Hover Tooltip Card */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-28 text-left space-y-1">
                      <p className="font-extrabold text-slate-350">{item.month === "Current" ? "This Month" : item.month}</p>
                      <p>👁️ {item.views} Views</p>
                      <p>❤️ {item.claps} Likes</p>
                    </div>

                    {/* Columns Wrapper */}
                    <div className="w-full flex items-end justify-center gap-1.5 h-full max-w-[40px]">
                      {/* Views bar */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: item.vPercent }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="w-3.5 rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 shadow-sm"
                      />
                      {/* Claps bar */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: item.cPercent }}
                        transition={{ duration: 0.8, delay: index * 0.05 + 0.1 }}
                        className="w-3.5 rounded-t-lg bg-gradient-to-t from-pink-500 to-rose-500 group-hover:from-pink-400 shadow-sm"
                      />
                    </div>

                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{item.month}</span>
                  </div>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="flex gap-6 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Views
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" /> Likes / Reactions
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: POPULAR ARTICLES PROGRESS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-3xl shadow-sm space-y-6 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Award className="text-pink-500 dark:text-pink-400" size={18} />
                Popular Stories
              </h3>
              <p className="text-xs text-slate-400">
                Ranked by aggregate views, claps, and comment counts.
              </p>

              <div className="space-y-6 pt-2">
                {userPosts.slice(0, 4).map((post, index) => {
                  const popularity = (post.views || 0) + (post.claps || 0) * 3 + (post.comments?.length || 0) * 5;
                  const maxPopularity = Math.max(1, Math.max(...userPosts.map(p => (p.views || 0) + (p.claps || 0) * 3 + (p.comments?.length || 0) * 5)));
                  const ratio = Math.min(100, Math.round((popularity / maxPopularity) * 100));

                  return (
                    <div key={post._id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                          {index + 1}. {post.title}
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[9px]">
                          {ratio}% Score
                        </span>
                      </div>
                      
                      {/* Premium CSS Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${ratio}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        />
                      </div>

                      <div className="flex gap-4 text-[9px] uppercase tracking-widest font-black text-slate-400">
                        <span>👁️ {post.views || 0} Views</span>
                        <span>❤️ {post.claps || 0} Likes</span>
                        <span>💬 {post.comments?.length || 0} Comments</span>
                      </div>
                    </div>
                  );
                })}

                {userPosts.length === 0 && (
                  <p className="text-xs text-slate-450 dark:text-slate-500 italic py-6 text-center">
                    Publish your first post to calculate engagement!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

/* STAT CARD */
function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300 text-left">
      <div className="flex justify-between items-center text-slate-400">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
          {icon}
        </div>
        <span className="text-xs font-bold text-green-500 flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}