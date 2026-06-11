import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Editor from './pages/Editor';
import PostView from './pages/PostView'; // optional (can remove if unused)
import PostDetails from './pages/PostDetails'; // ✅ added
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
        
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="pt-8 px-4 pb-20">
          <Routes>

            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Editor */}
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />

            {/* ✅ FIXED: matches your Link `/post/:slug` */}
            <Route path="/post/:slug" element={<PostDetails />} />

            {/* Optional: keep only if you still use this */}
            {/* <Route path="/posts/:slug" element={<PostView />} /> */}

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;