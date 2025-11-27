import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { Save, Plus, Trash2, Video as VideoIcon, Youtube, Pencil, X, Database } from 'lucide-react';
import { saveSqlQueries, loadSqlQueries, saveLinks, loadLinks } from '../services/firebaseService';

interface AdminPanelProps {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ videos, setVideos }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'sql' | 'links'>('videos');
  const [sqlQueries, setSqlQueries] = useState<{id: string, title: string, query: string}[]>([]);
  const [sqlForm, setSqlForm] = useState({title: '', query: ''});
  const [showSqlForm, setShowSqlForm] = useState(false);
  const [sqlSearch, setSqlSearch] = useState('');
  const [editingSqlId, setEditingSqlId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [channelVideos, setChannelVideos] = useState<any[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showChannelVideos, setShowChannelVideos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [links, setLinks] = useState<{id: string, title: string, url: string, description: string}[]>([]);
  const [linkForm, setLinkForm] = useState({title: '', url: '', description: ''});
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedQueries = await loadSqlQueries();
        setSqlQueries(loadedQueries);
        const loadedLinks = await loadLinks();
        setLinks(loadedLinks);
      } catch (error) {
        console.error('Error loading data:', error);
        setSqlQueries([]);
        setLinks([]);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      saveSqlQueries(sqlQueries).catch(console.error);
    }
  }, [sqlQueries, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      saveLinks(links).catch(console.error);
    }
  }, [links, dataLoaded]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // YouTube ID extractor helper
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractChannelId = (url: string) => {
    // For video URLs, we'll use the video ID to get channel info
    const videoId = extractVideoId(url);
    return videoId; // Return videoId as placeholder for channel lookup
  };

  const fetchVideoMetadata = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || `Video ${videoId}`,
          description: ''
        };
      }
      throw new Error('Failed to fetch');
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return {
        title: `YouTube Video ${videoId}`,
        description: ''
      };
    }
  };

  const fetchYouTubeVideos = async (searchQuery: string) => {
    try {
      setLoading(true);
      
      // Use environment variable or show message
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
      
      if (!API_KEY) {
        alert('YouTube API key not configured. Add REACT_APP_YOUTUBE_API_KEY to your .env file.');
        // Show mock results as fallback
        const mockResults = [
          { id: 'mock1', title: `${searchQuery} Tutorial`, description: 'Tutorial video', videoId: 'dQw4w9WgXcQ' },
          { id: 'mock2', title: `${searchQuery} Guide`, description: 'How-to guide', videoId: 'oHg5SJYRHA0' },
          { id: 'mock3', title: `${searchQuery} Tips`, description: 'Tips and tricks', videoId: 'ZZ5LpwO-An4' }
        ];
        setChannelVideos(mockResults);
        return;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        videoId: item.id.videoId
      }));
      
      setChannelVideos(videos);
      
    } catch (error) {
      console.error('Error searching YouTube:', error);
      alert('YouTube search failed. Using mock results.');
      // Fallback to mock data
      const mockResults = [
        { id: 'fb1', title: `${searchQuery} Video 1`, description: 'Sample video', videoId: 'dQw4w9WgXcQ' },
        { id: 'fb2', title: `${searchQuery} Video 2`, description: 'Another sample', videoId: 'oHg5SJYRHA0' }
      ];
      setChannelVideos(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelVideos = async (videoId: string) => {
    try {
      setLoading(true);
      
      // You need to add your YouTube Data API key here
      const API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with actual API key
      
      if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        alert('YouTube API key required. Please add your API key to fetch real channel videos.');
        return;
      }
      
      // Get video details to find channel ID
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );
      
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video details');
      }
      
      const videoData = await videoResponse.json();
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('Video not found');
      }
      
      const channelId = videoData.items[0].snippet.channelId;
      
      // Get channel videos
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=10&order=date&key=${API_KEY}`
      );
      
      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel videos');
      }
      
      const channelData = await channelResponse.json();
      
      const videos = channelData.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        videoId: item.id.videoId
      }));
      
      setChannelVideos(videos);
      setShowChannelVideos(true);
      
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      alert('Could not load channel videos. Using mock data instead.');
      
      // Fallback to mock data
      const mockVideos = [
        { id: 'mock1', title: 'Sample Video 1', description: 'Mock video description', videoId: 'dQw4w9WgXcQ' },
        { id: 'mock2', title: 'Sample Video 2', description: 'Another mock video', videoId: 'oHg5SJYRHA0' }
      ];
      setChannelVideos(mockVideos);
      setShowChannelVideos(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetails = async () => {
    const videoId = extractVideoId(formData.url);
    if (videoId) {
      setLoading(true);
      const metadata = await fetchVideoMetadata(videoId);
      if (metadata) {
        setFormData(prev => ({
          ...prev,
          title: metadata.title,
          description: metadata.description
        }));
      }
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(formData.url);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    if (editingId) {
      // Update existing video using functional state update
      setVideos(prevVideos => prevVideos.map(v => 
        v.id === editingId 
          ? { ...v, title: formData.title, description: formData.description, url: formData.url, videoId } 
          : v
      ));
      setEditingId(null);
    } else {
      // Add new video using functional state update
      const video: Video = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        url: formData.url,
        videoId
      };
      setVideos(prevVideos => [video, ...prevVideos]);
    }

    // Reset form
    setFormData({ title: '', description: '', url: '' });
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description,
      url: video.url
    });
    setEditingId(video.id);
    // Optional: scroll to top if list is long
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ title: '', description: '', url: '' });
    setEditingId(null);
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(prevVideos => prevVideos.filter(v => v.id !== id)); // Functional update ensures we filter the latest state
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleSaveSqlQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSqlId) {
      setSqlQueries(prev => prev.map(q => 
        q.id === editingSqlId 
          ? { ...q, title: sqlForm.title, query: sqlForm.query }
          : q
      ));
      setEditingSqlId(null);
    } else {
      const newQuery = {
        id: Date.now().toString(),
        title: sqlForm.title,
        query: sqlForm.query
      };
      setSqlQueries(prev => [newQuery, ...prev]);
    }
    setSqlForm({title: '', query: ''});
    setShowSqlForm(false);
    showNotification(editingSqlId ? 'Query updated successfully!' : 'Query saved successfully!', 'success');
  };

  const handleSelectQuery = (query: string) => {
    setSqlForm(prev => ({...prev, query}));
    setShowSqlForm(true);
  };

  const filteredSqlQueries = sqlQueries.filter(q => 
    q.title.toLowerCase().includes(sqlSearch.toLowerCase()) || 
    q.query.toLowerCase().includes(sqlSearch.toLowerCase())
  );

  const handleEditSqlQuery = (query: {id: string, title: string, query: string}) => {
    setSqlForm({title: query.title, query: query.query});
    setEditingSqlId(query.id);
    setShowSqlForm(true);
  };

  const handleDeleteSqlQuery = (id: string) => {
    if (window.confirm('Delete this query?')) {
      setSqlQueries(prev => prev.filter(q => q.id !== id));
      showNotification('Query deleted successfully!', 'success');
    }
  };

  const handleCopySqlQuery = async (query: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(query);
      } else {
        // Fallback for mobile/older browsers
        const textArea = document.createElement('textarea');
        textArea.value = query;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      showNotification('Query copied to clipboard!', 'success');
    } catch (err) {
      showNotification('Failed to copy query', 'error');
    }
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLinkId) {
      setLinks(prev => prev.map(l => 
        l.id === editingLinkId 
          ? { ...l, title: linkForm.title, url: linkForm.url, description: linkForm.description }
          : l
      ));
      setEditingLinkId(null);
    } else {
      const newLink = {
        id: Date.now().toString(),
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description
      };
      setLinks(prev => [newLink, ...prev]);
    }
    setLinkForm({title: '', url: '', description: ''});
    setShowLinkForm(false);
    showNotification(editingLinkId ? 'Link updated successfully!' : 'Link saved successfully!', 'success');
  };

  const handleEditLink = (link: {id: string, title: string, url: string, description: string}) => {
    setLinkForm({title: link.title, url: link.url, description: link.description});
    setEditingLinkId(link.id);
    setShowLinkForm(true);
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Delete this link?')) {
      setLinks(prev => prev.filter(l => l.id !== id));
      showNotification('Link deleted successfully!', 'success');
    }
  };

  const handleBulkImport = () => {
    const videosToAdd = channelVideos.filter(v => selectedVideos.includes(v.id));
    const newVideos = videosToAdd.map(v => ({
      id: Date.now().toString() + Math.random(),
      title: v.title,
      description: v.description,
      url: `https://youtube.com/watch?v=${v.videoId}`,
      videoId: v.videoId
    }));
    setVideos(prev => [...newVideos, ...prev]);
    setSelectedVideos([]);
    setShowChannelVideos(false);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-up ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {notification.message}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-500">Manage support video content.</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VideoIcon size={18} className="inline mr-2" />
            Videos
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sql'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL Query
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'links'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Useful Links
          </button>
        </div>
      </div>

      {activeTab === 'videos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add/Edit Video Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {editingId ? <Pencil size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
                    {editingId ? 'Edit Video' : 'Add New Video'}
                  </h3>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <button
                      type="button"
                      onClick={handleFetchDetails}
                      disabled={!formData.url || loading}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Loading...' : 'Fetch Details'}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Video Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="e.g. How to Reset Password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Brief summary of the video content..."
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 font-medium rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-white ${
                      editingId 
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    {editingId ? <Save size={18} /> : <Plus size={18} />}
                    {editingId ? 'Update Video' : 'Save Video'}
                  </button>
                </form>
              </div>

            </div>

            {/* Video List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Published Videos ({videos.length})</h3>
              {videos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                  <Youtube size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No videos added yet.</p>
                </div>
              ) : (
                videos.map(video => (
                  <div key={video.id} className={`bg-white p-4 rounded-xl border shadow-sm flex gap-4 hover:shadow-md transition-all ${editingId === video.id ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'}`}>
                    <div className="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                      <img 
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-800 line-clamp-1">{video.title}</h4>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(video)}
                            className={`p-1.5 rounded-lg transition-colors ${editingId === video.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title="Edit video"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteVideo(video.id, e)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Delete video"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{video.description}</p>
                      <a href={video.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-2 inline-block hover:underline">
                        View on YouTube
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      ) : activeTab === 'sql' ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 
              className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setShowSqlForm(!showSqlForm)}
            >
              Useful Queries {showSqlForm ? '▼' : '▶'}
            </h3>
            <input
              type="text"
              placeholder="Search queries..."
              value={sqlSearch}
              onChange={(e) => setSqlSearch(e.target.value)}
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          {showSqlForm && (
            <form onSubmit={handleSaveSqlQuery} className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <input
                type="text"
                required
                value={sqlForm.title}
                onChange={(e) => setSqlForm({...sqlForm, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Query title"
              />
              <textarea
                required
                value={sqlForm.query}
                onChange={(e) => setSqlForm({...sqlForm, query: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                placeholder="SQL query"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
            </form>
          )}
          
          <div className="space-y-3">
            {filteredSqlQueries.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{sqlQueries.length === 0 ? 'No saved queries yet.' : 'No queries match your search.'}</p>
            ) : (
              filteredSqlQueries.map(query => (
                <div key={query.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800">{query.title}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditSqlQuery(query)}
                        className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCopySqlQuery(query.query)}
                        className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 rounded"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDeleteSqlQuery(query.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-slate-600 hover:text-slate-800">View Query</summary>
                    <pre className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono overflow-x-auto">{query.query}</pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div 
            className="cursor-pointer hover:bg-slate-50 transition-colors mb-4"
            onClick={() => setShowLinkForm(!showLinkForm)}
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database size={20} className="text-purple-600" />
              Useful Links
              <span className="text-sm text-slate-500">(Click to expand)</span>
            </h3>
          </div>
          
          {showLinkForm && (
            <form onSubmit={handleSaveLink} className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <input
                type="text"
                required
                value={linkForm.title}
                onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Link title"
              />
              <input
                type="url"
                required
                value={linkForm.url}
                onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com"
              />
              <textarea
                required
                value={linkForm.description}
                onChange={(e) => setLinkForm({...linkForm, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                placeholder="Brief description of the link"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Save Link
              </button>
            </form>
          )}
          
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Saved Links ({links.length})</h4>
            {links.length === 0 ? (
              <p className="text-slate-500 text-sm">No links saved yet.</p>
            ) : (
              links.map(link => (
                <div key={link.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-slate-800">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {link.title}
                      </a>
                    </h5>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditLink(link)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs mb-2">{link.description}</p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    {link.url}
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;