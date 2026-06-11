import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Save, Loader2, Wand2, Copy, Check, FileText, Bold, Italic, Heading, Quote, List, ListOrdered, Code, Link2, Image } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Editor() {

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("# Start writing...");
  const [coverImage, setCoverImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seoData, setSeoData] = useState(null);

  // ✅ OWNER STATE
  const [isOwner, setIsOwner] = useState(false);

  // ✅ GET ID FROM URL
  const { id } = useParams();

  const navigate = useNavigate();

  // ✅ CURRENT USER EMAIL
  const userId = localStorage.getItem('userId');

  // ✅ AI WRITING ASSISTANT STATES
  const [activeTab, setActiveTab] = useState("write"); // 'write' or 'ai'
  const [hookTopic, setHookTopic] = useState("");
  const [hookResult, setHookResult] = useState("");
  const [toneInput, setToneInput] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [toneResult, setToneResult] = useState("");
  const [promoKit, setPromoKit] = useState(null);
  const [isCopied, setIsCopied] = useState({ newsletter: false, twitter: false, linkedin: false });

  // ✅ AUTO-SAVE DRAFTS STATES
  const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState(null);



  // ✅ FETCH POST FOR EDIT MODE WITH AUTO-SAVE RECOVERY
  useEffect(() => {

    if (!id) return;

    const fetchPost = async () => {

      try {

        const res = await axios.get(
          `${API_BASE_URL}/api/posts/edit/${id}`
        );

        const post = res.data;

        // ✅ OWNER CHECK
        if (post.author !== userId) {

          alert("You are not allowed to edit this post");

          navigate('/');

          return;
        }

        setIsOwner(true);

        // Check if there is an unsaved local draft for this post
        const localDraftStr = localStorage.getItem(`scribe_ai_draft_${id}`);
        if (localDraftStr) {
          const draft = JSON.parse(localDraftStr);
          if (draft.content !== post.content || draft.title !== post.title) {
            setRecoveredDraft(draft);
            setShowRecoveryAlert(true);
          }
        }

        setTitle(post.title || "");
        setExcerpt(post.excerpt || "");
        setContent(post.content || "");
        setCoverImage(post.coverImage || "");

      } catch (err) {

        console.error("Error fetching post:", err);

        alert("Failed to fetch post");

      }
    };

    fetchPost();

  }, [id, navigate, userId]);

  // ✅ CHECK LOCAL DRAFTS FOR NEW POSTS
  useEffect(() => {
    if (!id) {
      const localDraftStr = localStorage.getItem("scribe_ai_draft_new");
      if (localDraftStr) {
        const draft = JSON.parse(localDraftStr);
        if (draft.content && draft.content !== "# Start writing...") {
          setRecoveredDraft(draft);
          setShowRecoveryAlert(true);
        }
      }
    }
  }, [id]);

  // ✅ AUTO-SAVE TIMER EFFECT (DEBOUNCED BY 1s)
  useEffect(() => {
    if (showRecoveryAlert) return;
    if (!title && content === "# Start writing...") return;

    const draftData = { title, excerpt, content, coverImage };
    const draftKey = id ? `scribe_ai_draft_${id}` : "scribe_ai_draft_new";
    
    const delayDebounce = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [title, excerpt, content, coverImage, id, showRecoveryAlert]);

  // ✅ DRAFT HANDLERS
  const handleLoadDraft = () => {
    if (recoveredDraft) {
      setTitle(recoveredDraft.title || "");
      setExcerpt(recoveredDraft.excerpt || "");
      setContent(recoveredDraft.content || "");
      if (recoveredDraft.coverImage) setCoverImage(recoveredDraft.coverImage);
      alert("Draft loaded successfully!");
    }
    setShowRecoveryAlert(false);
  };

  const handleDiscardDraft = () => {
    const draftKey = id ? `scribe_ai_draft_${id}` : "scribe_ai_draft_new";
    localStorage.removeItem(draftKey);
    setRecoveredDraft(null);
    setShowRecoveryAlert(false);
    alert("Local draft discarded.");
  };



  // ✅ IMAGE UPLOAD
  const handleImageUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append('image', file);

    setIsUploading(true);

    try {

      const res = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
              // Add auth header if your upload route is protected
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setCoverImage(res.data.imageUrl);

      alert("Image uploaded successfully!");

    } catch (err) {

      console.error("Upload error:", err);

      alert("Image upload failed");

    } finally {

      setIsUploading(false);

    }
  };



  // ✅ CREATE / UPDATE POST
  const handleSave = async () => {

    if (!title || !content) {
      return alert("Title and Content are required!");
    }

    const postData = {

      title,
      excerpt,
      content,
      coverImage,

      // ✅ SAVE AUTHOR ID
      author: userId,

      slug: title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, ''),

      seo: seoData
    };

    setLoading(true);

    try {

      // ✅ UPDATE EXISTING POST
      if (id) {

        if (!isOwner) {
          alert("Unauthorized");
          return;
        }

        await axios.put(
          `${API_BASE_URL}/api/posts/${id}`,
          postData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        alert("Post updated successfully!");

      }

      // ✅ CREATE NEW POST
      else {

        await axios.post(
          `${API_BASE_URL}/api/posts`,
          postData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        alert("Post published successfully!");
      }

      navigate('/dashboard');

    } catch (err) {

      console.error("Save failed:", err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong");
      }

    } finally {

      setLoading(false);

    }
  };



  // ✅ AI SEO AUDIT
  const auditSEO = async () => {

    if (!content || content === "# Start writing...") {
      return alert("Please write some content first!");
    }

    setLoading(true);

    try {

      const res = await axios.post(
        `${API_BASE_URL}/api/ai/audit`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',  
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSeoData(res.data);

    } catch (err) {

      console.error("SEO audit failed:", err.message || err);

      alert("SEO audit failed");

    } finally {

      setLoading(false);

    }
  };

  // ✅ AI HOOK WRITER
  const generateHook = async () => {
    if (!hookTopic) return alert("Please specify a topic or title!");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/transform`,
        { text: hookTopic, task: "draft" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setHookResult(res.data.result);
    } catch (err) {
      console.error(err);
      alert("Hook generation failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ AI TONE SHIFTER
  const transformTone = async () => {
    if (!toneInput) return alert("Please enter some text to transform!");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/transform`,
        { text: toneInput, task: "tone", option: selectedTone },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setToneResult(res.data.result);
    } catch (err) {
      console.error(err);
      alert("Tone transformation failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ AI SOCIAL & NEWSLETTER PROMO KIT
  const generatePromoKit = async () => {
    if (!content || content === "# Start writing...") {
      return alert("Please write some content first!");
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/transform`,
        { text: content, task: "social" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPromoKit(res.data);
    } catch (err) {
      console.error(err);
      alert("Promo Kit generation failed!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HELPER: INSERT INTO EDITOR
  const handleInsertText = (textToInsert) => {
    setContent((prev) => prev + "\n\n" + textToInsert);
    alert("Text appended to editor!");
  };

  // ✅ HELPER: COPY TO CLIPBOARD
  const handleCopyToClipboard = (textToCopy, field) => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [field]: false }));
    }, 2000);
  };

  // ✅ HELPER: INSERT MARKDOWN SYNTAX (CURSOR AWARE)
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = document.getElementById("editor-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    // Keep active focus and select wrapped text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // ✅ ANALYTICS HELPERS
  const getWordCount = () => {
    const cleanContent = content.replace(/[#*`_>-\d.]/g, "").trim();
    if (!cleanContent) return 0;
    return cleanContent.split(/\s+/).filter(Boolean).length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    return Math.max(1, Math.ceil(words / 200));
  };

  const getReadability = () => {
    const words = getWordCount();
    const sentences = content.split(/[.!?]+/).filter(Boolean).length;
    if (words === 0 || sentences === 0) return "Very Easy";

    const avgSentenceLength = words / sentences;
    if (avgSentenceLength < 10) return "Very Easy (Grade 4-5)";
    if (avgSentenceLength < 15) return "Easy (Grade 6-8)";
    if (avgSentenceLength < 22) return "Medium (Grade 9-12)";
    return "Advanced (College)";
  };



  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto mt-6 px-4 pb-20 transition-colors duration-300"
    >

      {/* ✅ RECOVERY BANNER */}
      {showRecoveryAlert && (
        <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
              Unsaved local draft detected!
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-450 mt-1">
              We found a recovered local draft containing unsaved edits for this story. Would you like to restore it?
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleLoadDraft}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer text-center"
            >
              Load Local Draft
            </button>
            <button
              onClick={handleDiscardDraft}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-750 dark:text-indigo-350 rounded-xl text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all cursor-pointer text-center"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* ✅ COVER IMAGE */}
      <div className="mb-6 space-y-4">

        {coverImage && (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-[2rem] shadow-lg border dark:border-slate-800"
          />
        )}

        <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all inline-block border dark:border-slate-800/80">

          {isUploading ? "Uploading..." : "Add Cover Image"}

          <input
            type="file"
            className="hidden"
            onChange={handleImageUpload}
          />

        </label>

      </div>



      {/* ✅ HEADER */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">

        <div className="flex-1 space-y-2 w-full">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Post Title"
            className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* EXCERPT */}
          <input
            type="text"
            placeholder="Short excerpt..."
            className="w-full text-slate-500 dark:text-slate-400 bg-transparent border-none focus:ring-0 text-lg"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

        </div>



        {/* ✅ SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading || (id && !isOwner)}
          className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-50"
        >

          {loading
            ? <Loader2 className="animate-spin" />
            : <Save size={20} />
          }

          {id ? "Update Post" : "Publish Post"}

        </button>

      </div>



      {/* ✅ EDITOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[70vh]">

        {/* LEFT SIDE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors duration-300">

          {/* TOP BAR WITH TABS */}
          <div className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center px-4 py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("write")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  activeTab === "write"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Markdown Editor
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles size={12} />
                AI Assistant
              </button>
            </div>

            {activeTab === "write" && (
              <button
                onClick={auditSEO}
                disabled={loading}
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                AI Audit
              </button>
            )}
          </div>

          {activeTab === "write" ? (
            <>
              {/* MARKDOWN FORMATTING TOOLBAR */}
              <div className="px-4 py-2 border-b dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap gap-1 items-center">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  title="Bold"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  title="Italic"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("# ")}
                  title="Heading 1"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer flex items-center"
                >
                  <Heading size={15} /> <span className="text-[9px] font-black ml-0.5">1</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("## ")}
                  title="Heading 2"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer flex items-center"
                >
                  <Heading size={15} /> <span className="text-[9px] font-black ml-0.5">2</span>
                </button>
                
                <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></span>

                <button
                  type="button"
                  onClick={() => insertMarkdown("> ")}
                  title="Blockquote"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ")}
                  title="Bullet List"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ")}
                  title="Numbered List"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <ListOrdered size={15} />
                </button>

                <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></span>

                <button
                  type="button"
                  onClick={() => insertMarkdown("```\n", "\n```")}
                  title="Code Block"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Code size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](url)")}
                  title="Hyperlink"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Link2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("![", "](image-url)")}
                  title="Image Link"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <Image size={15} />
                </button>
              </div>

              {/* TEXTAREA */}
              <textarea
                id="editor-textarea"
                className="flex-1 p-8 focus:outline-none font-mono text-slate-700 dark:text-slate-200 resize-none bg-transparent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* SEO RESULTS */}
              {seoData && (
                <div className="m-4 p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-350 mb-2 flex items-center gap-2">
                    <Sparkles size={16} />
                    AI SEO Recommendations
                  </h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400 italic mb-2">
                    "{seoData.metaDescription}"
                  </p>
                  <ul className="text-xs text-indigo-600 dark:text-indigo-450 space-y-1">
                    {seoData.tips?.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LIVE METRICS FOOTER */}
              <div className="border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-2.5 flex flex-wrap justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500 gap-4">
                <div className="flex gap-4">
                  <span>
                    Words: <strong className="text-slate-600 dark:text-slate-350">{getWordCount()}</strong>
                  </span>
                  <span>
                    Characters: <strong className="text-slate-600 dark:text-slate-350">{content.length}</strong>
                  </span>
                  <span>
                    Read Time: <strong className="text-slate-600 dark:text-slate-350">{getReadingTime()} min</strong>
                  </span>
                </div>
                <div>
                  Readability: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{getReadability()}</strong>
                </div>
              </div>
            </>
          ) : (
            // AI WRITING ASSISTANT TAB
            <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
              
              {/* FEATURE 1: DRAFT HOOKS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Wand2 className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Hook & Intro Generator
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500">
                  Write a captivating opening hook paragraph for your article based on your topic.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter article topic or title..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm text-slate-900 dark:text-slate-100 transition-colors duration-300"
                    value={hookTopic}
                    onChange={(e) => setHookTopic(e.target.value)}
                  />
                  <button
                    onClick={generateHook}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : "Generate"}
                  </button>
                </div>
                {hookResult && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl space-y-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{hookResult}"
                    </p>
                    <button
                      onClick={() => handleInsertText(hookResult)}
                      className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-550 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Check size={14} /> Append to Story
                    </button>
                  </div>
                )}
              </div>

              {/* FEATURE 2: TONE SHIFTER */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Tone Shifter & Rewriter
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500">
                  Paste a draft paragraph and transform its tone instantly.
                </p>
                <div className="space-y-3">
                  <textarea
                    placeholder="Paste draft paragraph to rewrite..."
                    className="w-full p-4 h-24 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm font-sans resize-none text-slate-900 dark:text-slate-100 transition-colors duration-300"
                    value={toneInput}
                    onChange={(e) => setToneInput(e.target.value)}
                  />
                  <div className="flex justify-between items-center gap-4">
                    <select
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 outline-none cursor-pointer"
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                    >
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Witty</option>
                      <option>Dramatic</option>
                      <option>Persuasive</option>
                    </select>
                    <button
                      onClick={transformTone}
                      disabled={loading}
                      className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-550 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : "Shift Tone"}
                    </button>
                  </div>
                </div>
                {toneResult && (
                  <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {toneResult}
                    </p>
                    <button
                      onClick={() => handleInsertText(toneResult)}
                      className="bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-550 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Check size={14} /> Append to Story
                    </button>
                  </div>
                )}
              </div>

              {/* FEATURE 3: SOCIAL MEDIA & NEWSLETTER COPY */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Social Promo & Newsletter Kit
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500">
                  Generate promotional copy for your article (Email Newsletter, Twitter/X, and LinkedIn) with one click!
                </p>
                <button
                  onClick={generatePromoKit}
                  disabled={loading}
                  className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={16} />}
                  Generate Promotion Kit
                </button>
                {promoKit && (
                  <div className="space-y-4 mt-4">
                    {/* Newsletter Card */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">📧 Email Newsletter</span>
                        <button
                          onClick={() => handleCopyToClipboard(promoKit.newsletter, 'newsletter')}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied.newsletter ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied.newsletter ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans whitespace-pre-line bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        {promoKit.newsletter}
                      </p>
                    </div>

                    {/* Twitter Card */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">🐦 Twitter / X Post</span>
                        <button
                          onClick={() => handleCopyToClipboard(promoKit.twitter, 'twitter')}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied.twitter ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied.twitter ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        {promoKit.twitter}
                      </p>
                    </div>

                    {/* LinkedIn Card */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">💼 LinkedIn Post</span>
                        <button
                          onClick={() => handleCopyToClipboard(promoKit.linkedin, 'linkedin')}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied.linkedin ? <Check size={12} /> : <Copy size={12} />}
                          {isCopied.linkedin ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans whitespace-pre-line bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        {promoKit.linkedin}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>



        {/* ✅ RIGHT SIDE PREVIEW */}
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-10 overflow-y-auto prose prose-invert max-w-none shadow-2xl border border-white/5">

          <ReactMarkdown>
            {content}
          </ReactMarkdown>

        </div>

      </div>

    </motion.div>
  );
}