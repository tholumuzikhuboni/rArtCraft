import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Users, Calendar, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export default function Communities() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      // Fetch all communities
      const { data: communitiesData, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If user is logged in, check which communities they're a member of
      let membershipData: Record<string, boolean> = {};
      
      if (user) {
        const { data: memberships, error: membershipError } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id);
        
        if (!membershipError && memberships) {
          membershipData = memberships.reduce((acc, item) => {
            acc[item.community_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }
      
      // Get member count for each community
      const communityIds = communitiesData?.map(c => c.id) || [];
      const memberCountPromises = communityIds.map(id => 
        supabase
          .from('community_members')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', id)
      );
      
      const memberCountResults = await Promise.all(memberCountPromises);
      const memberCounts = memberCountResults.reduce((acc, result, index) => {
        acc[communityIds[index]] = result.count || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Combine the data
      const enrichedCommunities = communitiesData?.map(community => ({
        ...community,
        member_count: memberCounts[community.id] || 0,
        is_member: membershipData[community.id] || false
      })) || [];
      
      setCommunities(enrichedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createCommunity = async () => {
    if (!user) {
      toast.error('You must be logged in to create a community');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('Community name is required');
      return;
    }
    
    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('communities')
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            created_by: user.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Automatically join the community as creator
      if (data) {
        await supabase
          .from('community_members')
          .insert([
            {
              community_id: data.id,
              user_id: user.id,
              role: 'admin'
            }
          ]);
      }
      
      toast.success('Community created successfully!');
      setFormData({ name: '', description: '' });
      setCreateDialogOpen(false);
      fetchCommunities();
    } catch (error: any) {
      console.error('Error creating community:', error);
      if (error.code === '23505') {
        toast.error('A community with this name already exists');
      } else {
        toast.error(error.message || 'Failed to create community');
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleMembership = async (communityId: string, isMember: boolean) => {
    if (!user) {
      toast.error('You must be logged in to join communities');
      return;
    }
    
    try {
      if (isMember) {
        // Leave community
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast.success('Left community');
      } else {
        // Join community
        const { error } = await supabase
          .from('community_members')
          .insert([
            {
              community_id: communityId,
              user_id: user.id,
              role: 'member'
            }
          ]);
        
        if (error) throw error;
        
        toast.success('Joined community');
      }
      
      // Update the local state
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId 
            ? { 
                ...community, 
                is_member: !isMember,
                member_count: isMember 
                  ? (community.member_count || 1) - 1 
                  : (community.member_count || 0) + 1
              } 
            : community
        )
      );
    } catch (error: any) {
      console.error('Error toggling membership:', error);
      toast.error(error.message || 'Failed to update membership');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <h2 className="text-3xl font-bold text-artcraft-primary mb-2">Communities</h2>
            <p className="text-artcraft-secondary">
              Join creative communities and collaborate on art projects
            </p>
          </div>
          
          {user && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Community</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new community</DialogTitle>
                  <DialogDescription>
                    Communities bring artists together to create and share artwork
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Community Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Pixel Artists"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="What's this community about?"
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createCommunity}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : 'Create Community'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="mb-6">
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(community => (
              <Card key={community.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-r from-artcraft-accent/30 to-artcraft-accent/10 flex items-center justify-center">
                  {/* Cover image would go here */}
                  <Users className="h-12 w-12 text-artcraft-accent/60" />
                </div>
                
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <Link to={`/communities/${community.id}`} className="hover:text-artcraft-accent transition-colors">
                      {community.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{community.member_count} members</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-artcraft-secondary line-clamp-2">
                    {community.description || "No description provided."}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div className="text-xs text-artcraft-secondary flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {new Date(community.created_at).toLocaleDateString()}
                  </div>
                  
                  {user ? (
                    <Button
                      size="sm"
                      variant={community.is_member ? "outline" : "default"}
                      onClick={() => toggleMembership(community.id, community.is_member || false)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-3 w-3" />
                      {community.is_member ? 'Leave' : 'Join'}
                    </Button>
                  ) : (
                    <Link to="/auth">
                      <Button size="sm" variant="outline">
                        Sign in to join
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-artcraft-muted/20 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-artcraft-secondary mb-4" />
            <h3 className="text-xl font-medium text-artcraft-primary mb-2">No communities found</h3>
            <p className="text-artcraft-secondary mb-6">
              {searchQuery 
                ? `No communities matching "${searchQuery}"`
                : "There are no communities yet. Create the first one!"}
            </p>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => setCreateDialogOpen(true)}
                className="mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
