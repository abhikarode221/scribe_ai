import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function PostView() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${slug}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
  }, [slug]);

  if (!post) return <div className="p-20 text-center animate-pulse text-slate-400">Loading your story...</div>;

  return (
    <article className="max-w-3xl mx-auto mt-12 pb-20 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-8 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <header className="mb-12 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-slate-400 font-medium border-y border-slate-100 py-4">
          <span className="flex items-center gap-2"><User size={16}/> {post.author || 'Anonymous'}</span>
          <span className="flex items-center gap-2"><Calendar size={16}/> {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </header>

      {/* Content Rendering with Tailwind Typography */}
      <div className="prose prose-slate lg:prose-xl max-w-none 
        prose-headings:text-slate-900 prose-p:text-slate-600 
        prose-pre:bg-slate-900 prose-pre:rounded-3xl prose-pre:shadow-2xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <h3 className="text-2xl font-bold text-white mb-2">Enjoyed this?</h3>
        <p className="text-slate-400 mb-6">Subscribe to get more technical deep-dives.</p>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition-all">
          Join the Newsletter
        </button>
      </div>
    </article>
  );
}