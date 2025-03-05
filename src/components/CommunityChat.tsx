
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  role?: string;
}

interface CommunityMember {
  id: string;
  user_id: string;
  role: string;
  username: string;
  avatar_url: string | null;
}

interface CommunityChatProps {
  communityId: string;
  communityMembers: CommunityMember[];
  creatorId: string;
}

export const CommunityChat = ({ communityId, communityMembers, creatorId }: CommunityChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!communityId) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // First fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles(username, avatar_url)
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: true })
          .limit(100);
          
        if (messagesError) throw messagesError;
        
        // Format messages with user data
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          username: msg.profiles?.username || 'Unknown User',
          avatar_url: msg.profiles?.avatar_url,
          role: communityMembers.find(m => m.user_id === msg.user_id)?.role
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching community messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`community-${communityId}-messages`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${communityId}`
      }, async (payload: any) => {
        // Fetch the complete user information for the new message
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
            
          if (userError) throw userError;
          
          const newMsg: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            username: userData?.username || 'Unknown User',
            avatar_url: userData?.avatar_url,
            role: communityMembers.find(m => m.user_id === payload.new.user_id)?.role
          };
          
          setMessages(prev => [...prev, newMsg]);
        } catch (error) {
          console.error('Error handling new message:', error);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, communityMembers]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !communityId) return;
    
    try {
      setSending(true);
      
      const { error } = await supabase
        .from('community_messages')
        .insert([
          {
            community_id: communityId,
            user_id: user.id,
            content: newMessage.trim()
          }
        ]);
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  const getUserRoleBadge = (userId: string, role: string | undefined) => {
    if (userId === creatorId) {
      return (
        <span className="inline-flex items-center ml-1">
          <CheckCircle2 className="h-3 w-3 text-blue-500" />
        </span>
      );
    }
    
    if (role === 'admin') {
      return (
        <span className="inline-flex text-xs px-1.5 py-0.5 ml-1 rounded bg-red-100 text-red-800">
          Admin
        </span>
      );
    }
    
    if (role === 'moderator') {
      return (
        <span className="inline-flex text-xs px-1.5 py-0.5 ml-1 rounded bg-green-100 text-green-800">
          Mod
        </span>
      );
    }
    
    return null;
  };
  
  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };
  
  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="p-3 border-b bg-artcraft-muted/10">
        <h3 className="font-medium text-artcraft-primary">Community Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-artcraft-accent border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-artcraft-secondary">
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.user_id === user?.id;
              
              return (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    isCurrentUser ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={getAvatarUrl(message.avatar_url) || undefined} />
                      <AvatarFallback className="bg-artcraft-accent/20 text-artcraft-primary text-xs">
                        {message.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {!isCurrentUser && (
                      <div className="flex items-center mb-1 text-xs text-artcraft-secondary">
                        <span className="font-medium">{message.username}</span>
                        {getUserRoleBadge(message.user_id, message.role)}
                      </div>
                    )}
                    <div 
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        isCurrentUser 
                          ? "bg-artcraft-accent text-white rounded-tr-none" 
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      )}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-artcraft-secondary mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3 border-t bg-white">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending || !user}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={sending || !newMessage.trim() || !user}
          className="flex items-center gap-1"
        >
          {sending ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
};
