import React, { useState } from 'react';
import { Video } from '../types';
import { Save, Plus, Trash2, Video as VideoIcon, Youtube, Pencil, X } from 'lucide-react';

interface AdminPanelProps {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ videos, setVideos }) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'sql'>('videos');
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResults, setSqlResults] = useState<any[]>([]);
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

  const handleSqlQuery = () => {
    try {
      // Mock SQL execution - replace with actual database query
      const mockResults = [
        { id: 1, title: 'Sample Video 1', views: 150 },
        { id: 2, title: 'Sample Video 2', views: 89 }
      ];
      setSqlResults(mockResults);
    } catch (error) {
      console.error('SQL Query Error:', error);
      setSqlResults([]);
    }
  };

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
          <h3 className="text-lg font-semibold mb-4">SQL Query Interface</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">SQL Query</label>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                placeholder="SELECT * FROM videos WHERE..."
              />
            </div>
            <button
              onClick={handleSqlQuery}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Execute Query
            </button>
            {sqlResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">Results:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(sqlResults[0]).map(key => (
                          <th key={key} className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResults.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-4 py-2 text-sm text-slate-600">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;