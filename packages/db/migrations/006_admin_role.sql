ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
UPDATE profiles SET is_admin = true WHERE handle = 'cedar-thrush-04';
