import React, { useState, useEffect } from 'react';
import { Video, AppView } from './types';
import AdminPanel from './components/AdminPanel';
import VideoModal from './components/VideoModal';
import { PlayCircle, Search, LayoutGrid, ShieldCheck, LogOut } from 'lucide-react';
import { saveVideos, loadVideos } from './services/firebaseService';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';





const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('adminLoggedIn');
    return saved === 'true' ? AppView.ADMIN : AppView.CUSTOMER;
  });
  const [showAdminEntry, setShowAdminEntry] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleAdminAccess = () => {
    setShowLogin(true);
    setLoginError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      localStorage.setItem('adminLoggedIn', 'true');
      setCurrentView(AppView.ADMIN);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('adminLoggedIn');
    setCurrentView(AppView.CUSTOMER);
    setShowAdminEntry(false);
  };

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedVideos = await loadVideos();
        setVideos(loadedVideos);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to Firebase when data changes
  useEffect(() => {
    if (!loading) {
      saveVideos(videos).catch(console.error);
    }
  }, [videos, loading]);



  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <LayoutGrid size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                Polosys Support
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {currentView === AppView.CUSTOMER ? (
                showAdminEntry && (
                  <button 
                    onClick={handleAdminAccess}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors animate-fade-in"
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Access</span>
                  </button>
                )
              ) : (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        ) : currentView === AppView.ADMIN ? (
          <AdminPanel 
            videos={videos} 
            setVideos={setVideos}
          />
        ) : (
          /* Customer View */
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-12">
            
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
              <h1 
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight px-2 cursor-pointer select-none"
                onClick={() => setShowAdminEntry(!showAdminEntry)}
                title="Click for admin options"
              >
                How can we help you today?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
                Browse our video library for quick tutorials or chat with our AI assistant for instant support.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-xl mx-auto mt-6 sm:mt-8 relative group px-4">
                <div className="absolute inset-y-0 left-0 pl-7 sm:pl-8 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => setActiveVideoId(video.videoId)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} 
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-110 transition-all duration-300">
                        <PlayCircle size={24} className="text-blue-600 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                      Video
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">
                      {video.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-blue-600 font-medium text-sm">
                      Watch Tutorial <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No videos found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}


      </main>

      {/* Video Player Modal */}
      <VideoModal 
        videoId={activeVideoId} 
        onClose={() => setActiveVideoId(null)} 
      />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96 max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setLoginData({ email: '', password: '' });
                    setLoginError('');
                  }}
                  className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;