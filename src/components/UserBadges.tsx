
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Star, BadgeCheck, Crown, Shield, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type UserBadge = {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  user_id: string;
};

interface UserBadgesProps {
  userId: string;
}

export const UserBadges = ({ userId }: UserBadgesProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwner = userId === 'c8bd2f31-fffd-43a3-98b4-2e89c27ca34f';

  useEffect(() => {
    if (userId) {
      fetchUserBadges();
    }
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      
      // Use a direct query to the user_badges table
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching badges:', error);
        return;
      }
      
      // Cast the data to our UserBadge type
      let userBadges = (data as unknown as UserBadge[]) || [];
      
      // Add owner badge if this is the owner
      if (isOwner) {
        const ownerBadge: UserBadge = {
          id: 'owner-badge',
          badge_type: 'owner',
          badge_name: 'App Owner',
          badge_description: 'Creator and owner of ArtCraft',
          earned_at: new Date().toISOString(),
          user_id: userId
        };
        
        // Check if the owner badge is already in the data
        const hasOwnerBadge = userBadges.some(badge => badge.badge_type === 'owner');
        
        if (!hasOwnerBadge) {
          userBadges = [ownerBadge, ...userBadges];
        }
      }
      
      setBadges(userBadges);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'owner':
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'weekly_champion':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'weekly_silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 'weekly_bronze':
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <BadgeCheck className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'owner':
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 'admin':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'verified':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'weekly_champion':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'weekly_silver':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'weekly_bronze':
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="rounded-lg bg-artcraft-muted/10 p-4 text-center">
        <Star className="h-6 w-6 text-artcraft-muted mx-auto mb-2" />
        <p className="text-artcraft-secondary text-sm">No badges earned yet</p>
        <p className="text-xs text-artcraft-secondary mt-1">
          Create more artwork to earn recognition!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-artcraft-primary font-medium">Badges & Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-1 py-1 px-3", 
                    getBadgeColor(badge.badge_type)
                  )}
                >
                  {getBadgeIcon(badge.badge_type)}
                  <span>{badge.badge_name}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.badge_description}</p>
                <p className="text-xs opacity-70 mt-1">
                  Earned on {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
