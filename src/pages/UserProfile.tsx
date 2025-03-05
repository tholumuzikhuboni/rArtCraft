
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Image as ImageIcon, Calendar, User, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserBadges } from '@/components/UserBadges';

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Drawing = {
  id: string;
  title: string;
  image_data: string;
  created_at: string;
};

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [drawingCount, setDrawingCount] = useState(0);
  
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserDrawings();
    }
  }, [userId]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
  
  const fetchUserDrawings = async () => {
    try {
      // Get public drawings for this user
      const { data, error, count } = await supabase
        .from('saved_drawings')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (error) {
        console.error('Error fetching drawings:', error);
        return;
      }
      
      setDrawings(data || []);
      setDrawingCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
        <Header onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <main className={cn(
          "container pt-24 pb-12 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-artcraft-muted mb-4" />
            <h2 className="text-2xl font-bold text-artcraft-primary mb-2">User Not Found</h2>
            <p className="text-artcraft-secondary mb-6">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        </main>
        
        <footer className="border-t border-artcraft-muted/50 py-6 bg-white/50">
          <div className="container text-center">
            <p className="text-sm text-artcraft-secondary">
              &copy; {new Date().getFullYear()} r/ArtCraft — All rights reserved
            </p>
          </div>
        </footer>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "container pt-24 pb-12 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-artcraft-muted/20 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-2 border-artcraft-muted">
                <AvatarImage src={getAvatarUrl(profile.avatar_url) || undefined} />
                <AvatarFallback className="bg-artcraft-accent text-2xl text-white">
                  {profile.username?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold text-artcraft-primary">
                  {profile.username || "Anonymous Artist"}
                </h1>
                {profile.full_name && (
                  <p className="text-artcraft-secondary">{profile.full_name}</p>
                )}
              </div>
              
              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-artcraft-primary">{drawingCount}</p>
                  <p className="text-xs text-artcraft-secondary">Artworks</p>
                </div>
              </div>
              
              {userId && (
                <div className="mt-6 w-full">
                  <UserBadges userId={userId} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-artcraft-primary mb-2">About</h2>
                <p className="text-artcraft-secondary">
                  {profile.bio || "This user hasn't added a bio yet."}
                </p>
              </div>
              
              <div className="flex items-center text-artcraft-secondary text-sm mb-6">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              
              {user?.id === userId && (
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-artcraft-primary mb-4">Public Artworks</h2>
          
          {drawings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-artcraft-muted/20 aspect-square hover:shadow-md transition-shadow">
                  {drawing.image_data ? (
                    <img 
                      src={drawing.image_data} 
                      alt={drawing.title}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-artcraft-muted/20">
                      <ImageIcon className="h-12 w-12 text-artcraft-muted" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 w-full">
                      <h3 className="text-white font-medium truncate">{drawing.title}</h3>
                      <p className="text-white/70 text-sm">
                        {new Date(drawing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-artcraft-muted/10 rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-artcraft-muted mb-4" />
              <h3 className="text-lg font-medium text-artcraft-primary mb-2">No Public Artworks</h3>
              <p className="text-artcraft-secondary">
                This user hasn't published any artworks yet.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t border-artcraft-muted/50 py-6 bg-white/50">
        <div className="container text-center">
          <p className="text-sm text-artcraft-secondary">
            &copy; {new Date().getFullYear()} r/ArtCraft — All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;
