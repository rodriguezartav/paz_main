-- Add room_type column to rooms table (enum already exists from previous attempt)

-- Add the room_type column to rooms table (nullable initially for existing data)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type room_type;

-- Set default room_type based on is_private field with proper casting
UPDATE rooms SET room_type = (CASE WHEN is_private THEN 'private' ELSE 'double' END)::room_type WHERE room_type IS NULL;

-- Make room_type NOT NULL after populating existing data
ALTER TABLE rooms ALTER COLUMN room_type SET NOT NULL;
