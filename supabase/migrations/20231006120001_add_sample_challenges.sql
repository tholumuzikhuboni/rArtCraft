
-- Add sample challenges to the challenges table
INSERT INTO public.challenges (title, description, start_date, end_date, is_active)
VALUES 
  (
    'Draw Your Dream Pet', 
    'Create a drawing of your dream pet - real or imaginary! Let your imagination run wild with colors and features.',
    NOW(),
    NOW() + INTERVAL '14 days',
    true
  ),
  (
    'Nature and Seasons', 
    'Draw your favorite season in nature. Show us what you love most about spring, summer, autumn, or winter!',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '11 days',
    true
  ),
  (
    'Space Adventure', 
    'Create an art piece about space exploration. Planets, stars, astronauts, aliens - the universe is yours to explore!',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '9 days',
    true
  ),
  (
    'Underwater World', 
    'Draw amazing underwater creatures and landscapes. Dive deep into your imagination and show us what lives beneath the waves!',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '13 days',
    true
  )
ON CONFLICT DO NOTHING;
