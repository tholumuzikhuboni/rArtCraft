import { useState } from 'react';
import { Heart, Share2, Eye, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityDesignCardProps {
  id: string;
  title: string;
  imageData: string;
  createdAt: string;
  communityId?: string;
  userId?: string;
  username?: string;
  avatarUrl?: string | null;
  likes?: number;
  hasLiked?: boolean;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
}

export const CommunityDesignCard = ({
  id,
  title,
  imageData,
  createdAt,
  communityId,
  userId,
  username = 'Anonymous Artist',
  avatarUrl,
  likes = 0,
  hasLiked = false,
  onLike,
  onView
}: CommunityDesignCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isSharing, setIsSharing] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like designs');
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
    
    if (onLike) {
      onLike(id);
    }

    toast.success(isLiked ? 'Removed like' : 'Design liked!');
  };

  const handleView = () => {
    if (onView) {
      onView(id);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `ArtCraft - ${title}`,
          text: `Check out this amazing artwork "${title}" on ArtCraft!`,
          url: `${window.location.origin}/design/${id}`
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback for browsers that don't support navigator.share
        await navigator.clipboard.writeText(`${window.location.origin}/design/${id}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(url)
      .data.publicUrl;
  };

  return (
    <Card className="overflow-hidden group transition-all hover:shadow-md">
      <div 
        className="relative aspect-square cursor-pointer overflow-hidden"
        onClick={handleView}
      >
        <img 
          src={imageData} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-artcraft-primary truncate">{title}</h3>
        <p className="text-xs text-artcraft-secondary mt-1">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        {userId && (
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={getAvatarUrl(avatarUrl)} />
              <AvatarFallback className="bg-artcraft-accent/20 text-artcraft-primary text-xs">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-artcraft-secondary truncate max-w-[100px]">{username}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8", 
                    isLiked && "text-red-500"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    isLiked && "fill-current"
                  )} />
                  {likeCount > 0 && (
                    <span className="text-xs ml-1">{likeCount}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLiked ? 'Unlike' : 'Like'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleView}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in full view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};
