import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CollaborativeCanvas } from '@/components/CollaborativeCanvas';
import { CommunityChat } from '@/components/CommunityChat';
import { CommunityMembers } from '@/components/CommunityMembers';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  MessageSquare, 
  Palette
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  created_by: string;
  cover_image: string | null;
}

interface CommunityMember {
  id: string;
  user_id: string;
  role: string;
  username: string;
  avatar_url: string | null;
}

const CommunityDetail = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'chat'>('canvas');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (!communityId) return;
    fetchCommunityDetails();
  }, [communityId, user]);
  
  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
        
      if (communityError) throw communityError;
      
      setCommunity(communityData);
      
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select('id, user_id, role')
        .eq('community_id', communityId);
        
      if (membersError) throw membersError;
      
      const memberPromises = membersData.map(async (member) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', member.user_id)
          .single();
          
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          username: profileData?.username || 'Unknown User',
          avatar_url: profileData?.avatar_url
        };
      });
      
      const formattedMembers = await Promise.all(memberPromises);
      setMembers(formattedMembers);
      
      if (user) {
        const userMember = membersData.find(member => member.user_id === user.id);
        setIsMember(!!userMember);
      }
    } catch (error) {
      console.error('Error fetching community details:', error);
      toast.error('Failed to load community details');
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinCommunity = async () => {
    if (!user || !communityId) return;
    
    try {
      setJoining(true);
      
      if (isMember) {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast.success('Left community');
        setIsMember(false);
      } else {
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
        setIsMember(true);
      }
      
      fetchCommunityDetails();
    } catch (error) {
      console.error('Error toggling community membership:', error);
      toast.error('Failed to update membership');
    } finally {
      setJoining(false);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
        <Header onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <main className={cn(
          "container pt-24 pb-12 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
        <Header onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <main className={cn(
          "container pt-24 pb-12 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-artcraft-primary mb-2">Community Not Found</h2>
            <p className="text-artcraft-secondary mb-6">
              The community you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/communities')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </div>
        </main>
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
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/communities')}
            className="p-0 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-artcraft-secondary text-sm">
            Back to Communities
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-artcraft-primary">{community.name}</h1>
              <p className="text-artcraft-secondary mt-1">
                {community.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMembersDialogOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                <span>{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
              </Button>
              
              {user && (
                <Button
                  variant={isMember ? "outline" : "default"}
                  size="sm"
                  onClick={handleJoinCommunity}
                  disabled={joining}
                  className="min-w-24"
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      <span>{isMember ? 'Leaving...' : 'Joining...'}</span>
                    </>
                  ) : (
                    <span>{isMember ? 'Leave Community' : 'Join Community'}</span>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="sm:hidden flex border-b mb-4">
            <button
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium",
                activeTab === 'canvas' 
                  ? "border-b-2 border-artcraft-accent text-artcraft-primary" 
                  : "text-artcraft-secondary"
              )}
              onClick={() => setActiveTab('canvas')}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Palette className="h-4 w-4" />
                <span>Canvas</span>
              </div>
            </button>
            <button
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium",
                activeTab === 'chat' 
                  ? "border-b-2 border-artcraft-accent text-artcraft-primary" 
                  : "text-artcraft-secondary"
              )}
              onClick={() => setActiveTab('chat')}
            >
              <div className="flex items-center justify-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </div>
            </button>
          </div>
        </div>
        
        {!isMember && (
          <div className="bg-artcraft-accent/10 text-artcraft-primary p-4 rounded-lg mb-6 text-center">
            <p>Join this community to collaborate on the canvas and chat with members.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cn(
            "md:col-span-2",
            activeTab !== 'canvas' && 'hidden sm:block'
          )}>
            {isMember ? (
              <CollaborativeCanvas 
                communityId={communityId || ''} 
                showMembersList={() => setMembersDialogOpen(true)} 
              />
            ) : (
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-canvas-border">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Palette className="h-12 w-12 text-artcraft-secondary mx-auto mb-3" />
                    <h3 className="text-xl font-medium text-artcraft-primary mb-2">
                      Join to Collaborate
                    </h3>
                    <p className="text-artcraft-secondary mb-4">
                      Join this community to access the collaborative canvas.
                    </p>
                    <Button 
                      onClick={handleJoinCommunity}
                      disabled={joining}
                    >
                      {joining ? 'Joining...' : 'Join Now'}
                    </Button>
                  </div>
                </div>
                <div style={{ height: '600px' }}></div>
              </div>
            )}
          </div>
          
          <div className={cn(
            activeTab !== 'chat' && 'hidden sm:block'
          )}>
            {isMember ? (
              <CommunityChat 
                communityId={communityId || ''} 
                communityMembers={members} 
                creatorId={community.created_by}
              />
            ) : (
              <div className="relative rounded-xl overflow-hidden shadow-lg border h-[600px] flex items-center justify-center bg-gray-100">
                <div className="text-center p-6">
                  <MessageSquare className="h-12 w-12 text-artcraft-secondary mx-auto mb-3" />
                  <h3 className="text-xl font-medium text-artcraft-primary mb-2">
                    Join to Chat
                  </h3>
                  <p className="text-artcraft-secondary mb-4">
                    Join this community to chat with other members.
                  </p>
                  <Button 
                    onClick={handleJoinCommunity}
                    disabled={joining}
                  >
                    {joining ? 'Joining...' : 'Join Now'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <CommunityMembers
        communityId={communityId || ''}
        members={members}
        creatorId={community.created_by}
        isOpen={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        onMemberUpdate={fetchCommunityDetails}
      />
    </div>
  );
};

export default CommunityDetail;
