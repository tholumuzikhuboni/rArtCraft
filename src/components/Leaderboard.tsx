.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Medal, Star, Trophy, Award, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type LeaderboardUser = {
  username: string;
  avatar_url: string | null;
  drawing_count: number;
  id: string;
  rank: number;
};

export const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextReset, setNextReset] = useState<string>('');

  useEffect(() => {
    fetchLeaderboardData();
    calculateNextReset();
    
    // Set up a timer to recalculate the next reset time
    const timer = setInterval(calculateNextReset, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const calculateNextReset = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    
    const timeRemaining = nextSunday.getTime() - now.getTime();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    setNextReset(`${days}d ${hours}h`);
  };

  const fetchLeaderboardData = async () => {
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
          drawing_count: drawingCounts[profile.id] || 0,
          rank: 0 // Will be set below
        }))
        .sort((a, b) => b.drawing_count - a.drawing_count);
      
      // Add rank
      leaderboardData.forEach((user, index) => {
        user.rank = index + 1;
      });
      
      setUsers(leaderboardData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-artcraft-accent/70" />;
    }
  };

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(avatarUrl)
      .data.publicUrl;
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-artcraft-muted/20">
        <h3 className="font-medium text-artcraft-primary mb-3">Top Artists</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-artcraft-muted/20">
        <h3 className="font-medium text-artcraft-primary mb-2">Top Artists</h3>
        <p className="text-sm text-artcraft-secondary">No artwork has been created yet. Be the first to create something amazing!</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-artcraft-muted/20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-artcraft-primary">Top Artists</h3>
        <div className="flex items-center text-xs text-artcraft-secondary">
          <Clock className="h-3 w-3 mr-1" />
          <span>Resets in: {nextReset}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {users.slice(0, 5).map((user) => (
          <Link key={user.id} to={`/user/${user.id}`} className="flex items-center gap-3 group hover:bg-artcraft-muted/10 p-2 rounded-md transition-colors">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              user.rank <= 3 ? "bg-gradient-to-br from-artcraft-accent/20 to-orange-200" : "bg-artcraft-muted/50"
            )}>
              {getBadgeIcon(user.rank)}
            </div>
            
            <div className="flex-1 flex items-center">
              <div className="mr-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(user.avatar_url) || undefined} />
                  <AvatarFallback className="bg-artcraft-accent/20 text-artcraft-primary">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-artcraft-primary group-hover:text-artcraft-accent transition-colors">{user.username}</span>
                  {user.rank <= 3 && (
                    <Award className={cn(
                      "ml-1.5 h-4 w-4",
                      user.rank === 1 ? "text-yellow-500" : 
                      user.rank === 2 ? "text-gray-400" : "text-amber-600"
                    )} />
                  )}
                </div>
                <p className="text-xs text-artcraft-secondary">
                  {user.drawing_count} {user.drawing_count === 1 ? 'artwork' : 'artworks'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-artcraft-muted/20">
        <Badge variant="outline" className="bg-artcraft-accent/5 text-artcraft-accent hover:bg-artcraft-accent/10">
          Weekly Competition
        </Badge>
        <p className="mt-2 text-xs text-artcraft-secondary">
          Top 3 artists each week receive special badges on their profile!
        </p>
      </div>
    </div>
  );
};
