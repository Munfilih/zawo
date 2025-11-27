import React, { useState } from 'react';
import { Video } from '../types';
import { Save, Plus, Trash2, Video as VideoIcon, Youtube, Pencil, X } from 'lucide-react';

interface AdminPanelProps {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ videos, setVideos }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'sql'>('videos');
  const [sqlQueries, setSqlQueries] = useState<{id: string, title: string, query: string}[]>([]);
  const [sqlForm, setSqlForm] = useState({title: '', query: ''});
  const [showSqlForm, setShowSqlForm] = useState(false);
  const [sqlSearch, setSqlSearch] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);



  // YouTube ID extractor helper
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
    const newQuery = {
      id: Date.now().toString(),
      title: sqlForm.title,
      query: sqlForm.query
    };
    setSqlQueries(prev => [newQuery, ...prev]);
    setSqlForm({title: '', query: ''});
  };

  const handleSelectQuery = (query: string) => {
    setSqlForm(prev => ({...prev, query}));
    setShowSqlForm(true);
  };

  const filteredSqlQueries = sqlQueries.filter(q => 
    q.title.toLowerCase().includes(sqlSearch.toLowerCase()) || 
    q.query.toLowerCase().includes(sqlSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="https://youtube.com/watch?v=..."
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
      ) : (
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
                    <button
                      onClick={() => handleSelectQuery(query.query)}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
                    >
                      Use
                    </button>
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
      )}
    </div>
  );
};

export default AdminPanel;