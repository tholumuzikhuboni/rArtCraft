
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Search, MoreVertical, Heart, Download, Share, Trash, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Drawing {
  id: string;
  title: string;
  image_data: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  username?: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allDrawings, setAllDrawings] = useState<Drawing[]>([]);
  const [myDrawings, setMyDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDrawings();
  }, [user]);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      
      // Fetch public drawings from all users
      const { data: publicDrawings, error: publicError } = await supabase
        .from('saved_drawings')
        .select(`
          id, title, image_data, created_at, user_id, is_public,
          profiles:user_id (username)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (publicError) throw publicError;
      
      // Format data to include username
      const formattedPublicDrawings = publicDrawings.map(drawing => ({
        ...drawing,
        username: drawing.profiles?.username
      }));
      
      setAllDrawings(formattedPublicDrawings);
      
      // If user is logged in, fetch their drawings
      if (user) {
        const { data: userDrawings, error: userError } = await supabase
          .from('saved_drawings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (userError) throw userError;
        
        setMyDrawings(userDrawings || []);
      }
    } catch (error) {
      console.error('Error fetching drawings:', error);
      toast.error('Failed to load drawings');
    } finally {
      setLoading(false);
    }
  };

  const togglePublicStatus = async (drawingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_drawings')
        .update({ is_public: !currentStatus })
        .eq('id', drawingId);
      
      if (error) throw error;
      
      // Update local state
      setMyDrawings(prev => 
        prev.map(drawing => 
          drawing.id === drawingId 
            ? { ...drawing, is_public: !currentStatus } 
            : drawing
        )
      );
      
      // If changing from private to public, add to all drawings
      if (!currentStatus) {
        const drawingToAdd = myDrawings.find(d => d.id === drawingId);
        if (drawingToAdd) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user?.id)
            .single();
          
          setAllDrawings(prev => [
            { ...drawingToAdd, is_public: true, username: profileData?.username },
            ...prev
          ]);
        }
      } else {
        // If changing from public to private, remove from all drawings
        setAllDrawings(prev => prev.filter(drawing => drawing.id !== drawingId));
      }
      
      toast.success(`Drawing is now ${!currentStatus ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error toggling public status:', error);
      toast.error('Failed to update drawing');
    }
  };

  const deleteDrawing = async (drawingId: string) => {
    if (!confirm('Are you sure you want to delete this drawing?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('saved_drawings')
        .delete()
        .eq('id', drawingId);
      
      if (error) throw error;
      
      // Update local state
      setMyDrawings(prev => prev.filter(drawing => drawing.id !== drawingId));
      setAllDrawings(prev => prev.filter(drawing => drawing.id !== drawingId));
      
      toast.success('Drawing deleted successfully');
    } catch (error) {
      console.error('Error deleting drawing:', error);
      toast.error('Failed to delete drawing');
    }
  };

  const downloadDrawing = (imageData: string, title: string) => {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filterDrawings = (drawings: Drawing[]) => {
    if (!searchQuery) return drawings;
    return drawings.filter(drawing => 
      drawing.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAllDrawings = filterDrawings(allDrawings);
  const filteredMyDrawings = filterDrawings(myDrawings);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "container pt-24 pb-12 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-artcraft-primary mb-2">Art Gallery</h2>
            <p className="text-artcraft-secondary">
              Browse and share artwork from the community
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
              <Input
                placeholder="Search drawings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={user ? "all" : "all"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Community Gallery</TabsTrigger>
            {user && <TabsTrigger value="my">My Drawings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
              </div>
            ) : filteredAllDrawings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAllDrawings.map(drawing => (
                  <Card key={drawing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img 
                        src={drawing.image_data} 
                        alt={drawing.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="text-white font-medium truncate">{drawing.title}</h3>
                        <p className="text-white/80 text-sm">By {drawing.username || 'Unknown artist'}</p>
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between py-3">
                      <div className="flex items-center">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-artcraft-secondary"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-artcraft-secondary"
                          onClick={() => downloadDrawing(drawing.image_data, drawing.title)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-artcraft-secondary">
                        {new Date(drawing.created_at).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-artcraft-muted/20 rounded-lg">
                <h3 className="text-xl font-medium text-artcraft-primary mb-2">No public drawings found</h3>
                <p className="text-artcraft-secondary mb-6">
                  {searchQuery 
                    ? `No drawings matching "${searchQuery}"`
                    : "No public drawings have been shared yet"}
                </p>
                {user && (
                  <Link to="/">
                    <Button variant="outline">
                      Create art and share it
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
          
          {user && (
            <TabsContent value="my">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
                </div>
              ) : filteredMyDrawings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyDrawings.map(drawing => (
                    <Card key={drawing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={drawing.image_data} 
                          alt={drawing.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/30 text-white hover:bg-black/40">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => togglePublicStatus(drawing.id, drawing.is_public)}>
                                {drawing.is_public ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    <span>Make Private</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    <span>Make Public</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadDrawing(drawing.image_data, drawing.title)}>
                                <Download className="h-4 w-4 mr-2" />
                                <span>Download</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteDrawing(drawing.id)}>
                                <Trash className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="flex justify-between items-center">
                            <h3 className="text-white font-medium truncate">{drawing.title}</h3>
                            {drawing.is_public ? (
                              <span className="bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                                Public
                              </span>
                            ) : (
                              <span className="bg-gray-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                                Private
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="pt-3 pb-0">
                        <div className="text-xs text-artcraft-secondary">
                          Created {new Date(drawing.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-artcraft-muted/20 rounded-lg">
                  <h3 className="text-xl font-medium text-artcraft-primary mb-2">No drawings yet</h3>
                  <p className="text-artcraft-secondary mb-6">
                    {searchQuery 
                      ? `No drawings matching "${searchQuery}"`
                      : "You haven't saved any drawings yet"}
                  </p>
                  <Link to="/">
                    <Button>
                      Create your first drawing
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
