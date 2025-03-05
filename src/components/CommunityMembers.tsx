import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, MoreVertical, ShieldCheck, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommunityMember {
  id: string;
  user_id: string;
  role: string;
  username: string;
  avatar_url: string | null;
}

interface CommunityMembersProps {
  communityId: string;
  members: CommunityMember[];
  creatorId: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdate: () => void;
}

export const CommunityMembers = ({
  communityId,
  members,
  creatorId,
  isOpen,
  onClose,
  onMemberUpdate
}: CommunityMembersProps) => {
  const { user } = useAuth();
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  
  const isCreator = user?.id === creatorId;
  const isAdmin = isCreator || members.some(m => m.user_id === user?.id && m.role === 'admin');
  
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };
  
  const getRoleBadge = (role: string, userId: string) => {
    if (userId === creatorId) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Creator
        </Badge>
      );
    }
    
    if (role === 'admin') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    
    if (role === 'moderator') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
          <UserCog className="h-3 w-3 mr-1" />
          Moderator
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">
        Member
      </Badge>
    );
  };
  
  const handleRoleChange = async (memberId: string, userId: string, newRole: string) => {
    try {
      setUpdatingMember(memberId);
      
      // Don't allow changing the creator's role
      if (userId === creatorId) {
        toast.error("Cannot change the community creator's role");
        return;
      }
      
      const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast.success(`Member role updated to ${newRole}`);
      onMemberUpdate();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    } finally {
      setUpdatingMember(null);
    }
  };
  
  const handleRemoveMember = async (memberId: string, userId: string) => {
    try {
      setUpdatingMember(memberId);
      
      // Don't allow removing the creator
      if (userId === creatorId) {
        toast.error("Cannot remove the community creator");
        return;
      }
      
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast.success('Member removed from community');
      onMemberUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setUpdatingMember(null);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Community Members</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] sm:h-[50vh] mt-2 pr-4">
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-center py-4 text-artcraft-secondary text-sm">
                No members found in this community.
              </p>
            ) : (
              members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Link to={`/user/${member.user_id}`}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={getAvatarUrl(member.avatar_url) || undefined} />
                        <AvatarFallback className="bg-artcraft-accent/20 text-artcraft-primary">
                          {member.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link 
                        to={`/user/${member.user_id}`}
                        className="font-medium text-artcraft-primary hover:text-artcraft-accent transition-colors"
                      >
                        {member.username || 'Unknown User'}
                      </Link>
                      <div className="mt-1">
                        {getRoleBadge(member.role, member.user_id)}
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && member.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updatingMember === member.id}
                          className="h-8 w-8 p-0"
                        >
                          {updatingMember === member.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-artcraft-accent border-t-transparent rounded-full"></div>
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.user_id !== creatorId && (
                          <>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.user_id, 'member')}>
                              Set as Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.user_id, 'moderator')}>
                              Set as Moderator
                            </DropdownMenuItem>
                            {isCreator && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.user_id, 'admin')}>
                                Set as Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id, member.user_id)}
                              className="text-red-600 focus:text-red-700"
                            >
                              Remove from Community
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
