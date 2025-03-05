
import { useEffect, useState } from 'react';
import { X, Heart, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DesignDetailViewProps {
  id: string;
  title: string;
  imageData: string;
  createdAt: string;
  userId?: string;
  onClose: () => void;
}

interface UserProfile {
  username: string;
  avatar_url: string | null;
}

export const DesignDetailView = ({
  id,
  title,
  imageData,
  createdAt,
  userId,
  onClose
}: DesignDetailViewProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
    
    // Check if user has liked this design
    if (user && id) {
      checkIfLiked();
    }
  }, [userId, user, id]);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfLiked = async () => {
    // This would check against a likes table in a real implementation
    // For now we'll just randomly set it for demonstration
    setIsLiked(Math.random() > 0.5);
  };
  
  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to like designs');
      return;
    }
    
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed like' : 'Design liked!');
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };
  
  const handleShare = async () => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-artcraft-primary">{title}</h2>
          <Button
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 hover:bg-artcraft-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-grow overflow-auto relative">
          <div className="flex justify-center items-center bg-artcraft-muted/10 min-h-[300px]">
            <img 
              src={imageData} 
              alt={title}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            {userId && profile ? (
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
                  <AvatarFallback className="bg-artcraft-accent/20 text-artcraft-primary">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-artcraft-primary text-sm">{profile.username}</p>
                  <p className="text-xs text-artcraft-secondary">
                    {new Date(createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-artcraft-secondary">
                Created on {new Date(createdAt).toLocaleDateString()}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  isLiked && "text-red-500 border-red-200 bg-red-50"
                )}
                onClick={handleLike}
              >
                <Heart className={cn(
                  "h-4 w-4 mr-1",
                  isLiked && "fill-current"
                )} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
