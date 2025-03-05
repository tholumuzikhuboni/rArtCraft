
-- Create function to manually reset the leaderboard
CREATE OR REPLACE FUNCTION public.reset_leaderboard_manual()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Store current leaderboard in history before reset
  INSERT INTO public.leaderboard_history (user_id, rank, artwork_count, reset_date)
  WITH leaderboard AS (
    SELECT 
      p.id as user_id,
      ROW_NUMBER() OVER (ORDER BY COUNT(sd.id) DESC) as rank,
      COUNT(sd.id) as artwork_count
    FROM profiles p
    LEFT JOIN saved_drawings sd ON p.id = sd.user_id
    GROUP BY p.id
    ORDER BY COUNT(sd.id) DESC
    LIMIT 10
  )
  SELECT user_id, rank, artwork_count, now() FROM leaderboard;
  
  -- Award badges to top 3 users
  INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
  SELECT 
    user_id, 
    CASE 
      WHEN rank = 1 THEN 'weekly_champion'
      WHEN rank = 2 THEN 'weekly_silver'
      WHEN rank = 3 THEN 'weekly_bronze'
    END as badge_type,
    CASE 
      WHEN rank = 1 THEN 'Weekly Champion'
      WHEN rank = 2 THEN 'Weekly Silver'
      WHEN rank = 3 THEN 'Weekly Bronze'
    END as badge_name,
    CASE 
      WHEN rank = 1 THEN 'Topped the weekly leaderboard'
      WHEN rank = 2 THEN 'Second place in the weekly leaderboard'
      WHEN rank = 3 THEN 'Third place in the weekly leaderboard'
    END as badge_description
  FROM leaderboard_history
  WHERE rank <= 3 AND reset_date = (SELECT MAX(reset_date) FROM leaderboard_history)
  ON CONFLICT (user_id, badge_type) DO NOTHING;
  
  RETURN;
END;
$$;
