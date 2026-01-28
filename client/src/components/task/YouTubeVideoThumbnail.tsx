import { useState } from "react";
import { Play, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { extractYouTubeVideoId, getYouTubeThumbnail, getYouTubeEmbedUrl, getYouTubeWatchUrl } from "@/utils/youtube";

interface YouTubeVideoThumbnailProps {
  url: string;
  className?: string;
  showTitle?: boolean;
}

export function YouTubeVideoThumbnail({ url, className = "", showTitle = false }: YouTubeVideoThumbnailProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId, 'medium');
  const embedUrl = getYouTubeEmbedUrl(videoId);
  const watchUrl = getYouTubeWatchUrl(videoId);

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  const handleOpenInNewTab = () => {
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  if (thumbnailError) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <Play className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">YouTube Video</p>
          </div>
        </div>
        <Button
          onClick={handleOpenInNewTab}
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in YouTube
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src={thumbnailUrl}
              alt="YouTube video thumbnail"
              className="w-full h-auto max-h-32 object-cover"
              onError={handleThumbnailError}
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-red-600 rounded-full p-2">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            {showTitle && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-sm font-medium truncate">YouTube Video</p>
              </div>
            )}
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              YouTube Video
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in YouTube
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}