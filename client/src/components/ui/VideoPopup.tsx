import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, Loader2 } from 'lucide-react';

interface VideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoPopup({ isOpen, onClose, videoUrl, title = "Why AI Checklist?" }: VideoPopupProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset loading state when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);
  
  // Check if it's a YouTube URL, Streamable URL, or direct video file
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isStreamable = videoUrl.includes('streamable.com');
  
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (url.includes('streamable.com/e/')) {
      // For Streamable embeds, use the URL as-is since it's already an embed URL
      return url;
    } else if (url.includes('streamable.com/')) {
      // Convert regular Streamable URLs to embed format
      const videoId = url.split('streamable.com/')[1];
      return `https://streamable.com/e/${videoId}?loop=0`;
    }
    return url; // Return as-is for direct video files
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {/* Video Container */}
        <div className="relative">
          {/* Close button overlay */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Video player */}
          <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-5">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="text-white/70 text-sm">Loading video...</span>
                </div>
              </div>
            )}
            
            {isYouTube || isStreamable ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                title={title}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                style={{ border: 'none', width: '100%', height: '100%', position: 'absolute', left: '0px', top: '0px', overflow: 'hidden' }}
              />
            ) : (
              <video
                src={videoUrl}
                title={title}
                className="absolute inset-0 w-full h-full object-contain"
                controls
                preload="metadata"
                loading="lazy"
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMDkwOTBiIi8+PGNpcmNsZSBjeD0iMzIwIiBjeT0iMTgwIiByPSI0MCI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIwOzE7MCIgZHVyPSIxLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvY2lyY2xlPjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTQ5NDk0IiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0cHgiPkNsaWNrIHRvIHBsYXkgZGVtbyB2aWRlbzwvdGV4dD48L3N2Zz4="
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can start playing')}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}