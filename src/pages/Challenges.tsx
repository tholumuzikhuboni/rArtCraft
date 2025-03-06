
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Loader2, CalendarDays, Trophy, Clock, Users, ArrowRight, 
  Sparkles, Award, Flame, Palette, Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  submission_count?: number;
  days_remaining?: number;
  has_submitted?: boolean;
}

export default function Challenges() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      // Fetch all active challenges
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      
      // Get submission counts for each challenge
      const challengeIds = challengesData?.map(c => c.id) || [];
      const submissionCountPromises = challengeIds.map(id => 
        supabase
          .from('challenge_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', id)
      );
      
      const submissionCountResults = await Promise.all(submissionCountPromises);
      const submissionCounts = submissionCountResults.reduce((acc, result, index) => {
        acc[challengeIds[index]] = result.count || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Check if user has submitted to each challenge
      let userSubmissions: Record<string, boolean> = {};
      if (user) {
        const { data: submissions, error: submissionError } = await supabase
          .from('challenge_submissions')
          .select('challenge_id')
          .eq('user_id', user.id);
        
        if (!submissionError && submissions) {
          userSubmissions = submissions.reduce((acc, item) => {
            acc[item.challenge_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }
      
      // Enrich challenges with additional data
      const now = new Date();
      const enrichedChallenges = challengesData?.map(challenge => {
        const endDate = new Date(challenge.end_date);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...challenge,
          submission_count: submissionCounts[challenge.id] || 0,
          days_remaining: diffDays > 0 ? diffDays : 0,
          has_submitted: userSubmissions[challenge.id] || false
        };
      }) || [];
      
      setChallenges(enrichedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get a random icon for each challenge
  const getChallengeIcon = (index: number) => {
    const icons = [
      <Palette className="h-8 w-8 text-pink-500" />,
      <Sparkles className="h-8 w-8 text-purple-500" />,
      <Trophy className="h-8 w-8 text-yellow-500" />,
      <Award className="h-8 w-8 text-blue-500" />,
      <Flame className="h-8 w-8 text-red-500" />
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "container px-4 sm:px-6 pt-24 pb-12 transition-all duration-300",
        sidebarOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-artcraft-primary mb-2">Art Challenges</h2>
          <p className="text-artcraft-secondary">
            Join creative challenges and showcase your artistic skills
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-artcraft-accent" />
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge, index) => (
              <Card 
                key={challenge.id} 
                className={cn(
                  "border overflow-hidden hover:shadow-md transition-shadow",
                  challenge.days_remaining === 0 && "border-amber-300 bg-amber-50",
                  challenge.has_submitted && "border-green-300 bg-green-50/50"
                )}
              >
                <div className={cn(
                  "h-2 bg-gradient-to-r",
                  index % 5 === 0 && "from-pink-400 to-purple-500",
                  index % 5 === 1 && "from-blue-400 to-indigo-500",
                  index % 5 === 2 && "from-green-400 to-teal-500",
                  index % 5 === 3 && "from-orange-400 to-amber-500",
                  index % 5 === 4 && "from-red-400 to-rose-500"
                )} />
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-full p-2",
                        index % 5 === 0 && "bg-pink-100",
                        index % 5 === 1 && "bg-blue-100",
                        index % 5 === 2 && "bg-green-100",
                        index % 5 === 3 && "bg-amber-100",
                        index % 5 === 4 && "bg-red-100"
                      )}>
                        {getChallengeIcon(index)}
                      </div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    </div>
                    
                    {challenge.days_remaining === 0 ? (
                      <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        Ending Today
                      </span>
                    ) : challenge.has_submitted ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Submitted
                      </span>
                    ) : (
                      <span className="bg-artcraft-accent text-white text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-artcraft-secondary mb-4">
                    {challenge.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-artcraft-accent" />
                      <span className="text-artcraft-secondary">
                        Starts: {new Date(challenge.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-artcraft-accent" />
                      <span className={cn(
                        "text-artcraft-secondary",
                        challenge.days_remaining <= 2 && "text-amber-600 font-medium"
                      )}>
                        {challenge.days_remaining} days left
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-artcraft-accent" />
                      <span className="text-artcraft-secondary">
                        Ends: {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-artcraft-accent" />
                      <span className="text-artcraft-secondary">
                        {challenge.submission_count} submissions
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  {user ? (
                    <Link 
                      to={`/challenges/${challenge.id}`} 
                      className="w-full"
                    >
                      <Button 
                        className={cn("w-full", 
                          challenge.has_submitted && "bg-green-600 hover:bg-green-700"
                        )}
                        variant={challenge.has_submitted ? "default" : "default"}
                      >
                        {challenge.has_submitted 
                          ? "View Your Submission" 
                          : "Submit Your Artwork"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth" className="w-full">
                      <Button variant="outline" className="w-full">
                        Sign in to participate
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-artcraft-muted/20 rounded-lg">
            <Trophy className="h-12 w-12 mx-auto text-artcraft-secondary mb-4" />
            <h3 className="text-xl font-medium text-artcraft-primary mb-2">No active challenges</h3>
            <p className="text-artcraft-secondary mb-6">
              There are no active challenges at the moment. Check back soon!
            </p>
          </div>
        )}
        
        <div className="mt-12 bg-gradient-to-r from-artcraft-accent/20 to-orange-200/20 p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-white/60 shadow-sm">
              <Trophy className="h-8 w-8 text-artcraft-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-artcraft-primary mb-1">How Challenges Work</h3>
              <p className="text-artcraft-secondary">
                Art challenges are a fun way to improve your skills and engage with the community.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-white/50 transform transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-artcraft-accent rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
              <h4 className="font-medium text-artcraft-primary mb-2">Join a Challenge</h4>
              <p className="text-sm text-artcraft-secondary">
                Browse active challenges and find one that inspires you.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-white/50 transform transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-artcraft-accent rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
              <h4 className="font-medium text-artcraft-primary mb-2">Create Your Art</h4>
              <p className="text-sm text-artcraft-secondary">
                Use our canvas to create artwork based on the challenge theme.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-white/50 transform transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-artcraft-accent rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
              <h4 className="font-medium text-artcraft-primary mb-2">Submit & Share</h4>
              <p className="text-sm text-artcraft-secondary">
                Submit your artwork and see what others in the community have created.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="bg-white/80 gap-2">
              <Bookmark className="h-4 w-4" />
              View Past Challenges
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
