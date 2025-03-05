import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Leaderboard as LeaderboardComponent } from '@/components/Leaderboard';
import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

type Artist = {
  id: string;
  rank: number;
  username: string;
  artworks: number;
  avatar_url: string | null;
};

const Leaderboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onToggleSidebar={toggleSidebar} />
      
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "container pt-24 pb-16 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-artcraft-accent/10 text-artcraft-accent text-xs font-medium mb-3">
            Community Leaders
          </div>
          <h2 className="text-3xl font-bold text-artcraft-primary mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-artcraft-accent to-orange-400">Leaderboard</span>
          </h2>
          <p className="text-artcraft-secondary max-w-2xl">
            Celebrating our most active artists and their amazing contributions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm border border-artcraft-muted/20 rounded-xl shadow-sm p-6">
              <Tabs defaultValue="artworks">
                <TabsList className="mb-6">
                  <TabsTrigger value="artworks">Most Artworks</TabsTrigger>
                  <TabsTrigger value="challenges">Challenge Winners</TabsTrigger>
                </TabsList>
                
                <TabsContent value="artworks">
                  <TopArtists />
                </TabsContent>
                
                <TabsContent value="challenges">
                  <div className="text-center py-10">
                    <Trophy className="mx-auto h-12 w-12 text-artcraft-accent/50 mb-4" />
                    <h3 className="text-lg font-medium text-artcraft-primary mb-2">
                      Coming Soon!
                    </h3>
                    <p className="text-artcraft-secondary max-w-md mx-auto">
                      Challenge winners will be displayed here. Start participating in our weekly challenges to get featured!
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div>
            <LeaderboardComponent />
            
            <div className="mt-6 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-artcraft-muted/20">
              <h3 className="font-medium text-artcraft-primary mb-3">Weekly Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Weekly Champion</p>
                    <p className="text-xs text-artcraft-secondary">Top artist with most creations this week</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <Medal className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Weekly Silver</p>
                    <p className="text-xs text-artcraft-secondary">Second place in the weekly leaderboard</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
                    <Medal className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Weekly Bronze</p>
                    <p className="text-xs text-artcraft-secondary">Third place in the weekly leaderboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

const TopArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // First get all saved drawings with user_id
        const { data: drawingsData, error: drawingsError } = await supabase
          .from('saved_drawings')
          .select('user_id');
          
        if (drawingsError) {
          console.error('Error fetching drawings:', drawingsError);
          return;
        }
        
        // Count the drawings per user
        const drawingCounts: Record<string, number> = {};
        drawingsData.forEach(drawing => {
          if (drawing.user_id) {
            drawingCounts[drawing.user_id] = (drawingCounts[drawing.user_id] || 0) + 1;
          }
        });
        
        // Get all users who have created drawings
        const userIds = Object.keys(drawingCounts);
        if (userIds.length === 0) {
          setLoading(false);
          return;
        }
        
        // Fetch only real users (those that have a profile)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }
        
        // Combine data and sort by drawing count
        const leaderboardData = profilesData
          .filter(profile => profile.username) // Only include users with usernames
          .map(profile => ({
            id: profile.id,
            username: profile.username || 'Anonymous Artist',
            avatar_url: profile.avatar_url,
            artworks: drawingCounts[profile.id] || 0,
            rank: 0 // Will be set below
          }))
          .sort((a, b) => b.artworks - a.artworks);
        
        // Add rank
        leaderboardData.forEach((user, index) => {
          user.rank = index + 1;
        });
        
        setArtists(leaderboardData);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtists();
  }, []);
  
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
      </div>
    );
  }
  
  if (artists.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="mx-auto h-12 w-12 text-artcraft-accent/20 mb-4" />
        <h3 className="text-lg font-medium text-artcraft-primary mb-2">
          No Artists Yet
        </h3>
        <p className="text-artcraft-secondary max-w-md mx-auto">
          Be the first to create artwork and appear on the leaderboard!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 text-sm font-medium text-artcraft-secondary border-b border-artcraft-muted/30 pb-2">
        <div>Rank</div>
        <div>Artist</div>
        <div className="text-right">Artworks</div>
      </div>
      
      {artists.map((artist) => (
        <Link 
          key={artist.rank} 
          to={`/user/${artist.id}`}
          className="grid grid-cols-3 items-center py-2 hover:bg-artcraft-muted/10 rounded-md transition-colors"
        >
          <div className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-2",
              artist.rank === 1 ? "bg-yellow-100" : 
              artist.rank === 2 ? "bg-gray-100" : 
              artist.rank === 3 ? "bg-amber-100" : "bg-artcraft-muted/20"
            )}>
              {artist.rank <= 3 ? (
                <span className="font-bold text-artcraft-primary">{artist.rank}</span>
              ) : (
                <span className="text-artcraft-secondary">{artist.rank}</span>
              )}
            </div>
            {artist.rank <= 3 && (
              <div className={cn(
                artist.rank === 1 ? "text-yellow-500" : 
                artist.rank === 2 ? "text-gray-500" : "text-amber-600"
              )}>
                {artist.rank === 1 ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={getAvatarUrl(artist.avatar_url) || undefined} />
              <AvatarFallback className={cn(
                artist.rank === 1 ? "bg-yellow-200 text-yellow-800" : 
                artist.rank === 2 ? "bg-gray-200 text-gray-800" : 
                artist.rank === 3 ? "bg-amber-200 text-amber-800" : 
                "bg-artcraft-muted/30 text-artcraft-primary"
              )}>
                {artist.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-artcraft-primary truncate">{artist.username}</span>
          </div>
          
          <div className="text-right font-medium">
            {artist.artworks}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Leaderboard;
