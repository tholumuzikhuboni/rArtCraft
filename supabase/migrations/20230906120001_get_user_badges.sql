
-- Create a function to fetch user badges
CREATE OR REPLACE FUNCTION public.get_user_badges(user_id_param UUID)
RETURNS SETOF user_badges
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.user_badges 
  WHERE user_id = user_id_param
  ORDER BY earned_at DESC;
$$;
