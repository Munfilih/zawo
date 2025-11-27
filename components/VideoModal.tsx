import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  videoId: string | null;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoId, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!videoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;