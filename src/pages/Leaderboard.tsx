
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Leaderboard as LeaderboardComponent } from '@/components/Leaderboard';
import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
              <h3 className="font-medium text-artcraft-primary mb-3">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Art Champion</p>
                    <p className="text-xs text-artcraft-secondary">Top artist with most creations</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-artcraft-muted/30">
                    <Medal className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Creative Enthusiast</p>
                    <p className="text-xs text-artcraft-secondary">Created at least 5 artworks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <Award className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-artcraft-primary">Challenge Winner</p>
                    <p className="text-xs text-artcraft-secondary">Won a weekly drawing challenge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const TopArtists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useState(() => {
    const fetchArtists = async () => {
      try {
        // This would be implemented with similar logic as in the Leaderboard component
        // Fetching users and their drawing counts
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top artists:', error);
        setLoading(false);
      }
    };
    
    fetchArtists();
  });
  
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };
  
  if (loading) {
    return <div className="animate-pulse">Loading top artists...</div>;
  }
  
  const sampleArtists = [
    { rank: 1, name: "ArtMaster", artworks: 15, badge: "gold" },
    { rank: 2, name: "CreativeGenius", artworks: 12, badge: "silver" },
    { rank: 3, name: "ColorWizard", artworks: 10, badge: "bronze" },
    { rank: 4, name: "PixelPro", artworks: 8 },
    { rank: 5, name: "SketchKing", artworks: 7 },
    { rank: 6, name: "DigitalDreamer", artworks: 6 },
    { rank: 7, name: "CanvasCrafter", artworks: 5 },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 text-sm font-medium text-artcraft-secondary border-b border-artcraft-muted/30 pb-2">
        <div>Rank</div>
        <div>Artist</div>
        <div className="text-right">Artworks</div>
      </div>
      
      {sampleArtists.map((artist) => (
        <div key={artist.rank} className="grid grid-cols-3 items-center py-2">
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
              <AvatarFallback className={cn(
                artist.rank === 1 ? "bg-yellow-200 text-yellow-800" : 
                artist.rank === 2 ? "bg-gray-200 text-gray-800" : 
                artist.rank === 3 ? "bg-amber-200 text-amber-800" : 
                "bg-artcraft-muted/30 text-artcraft-primary"
              )}>
                {artist.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-artcraft-primary truncate">{artist.name}</span>
          </div>
          
          <div className="text-right font-medium">
            {artist.artworks}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
