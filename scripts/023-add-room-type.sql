-- Add room_type enum and column to rooms table

-- Create the enum type for room types
CREATE TYPE room_type AS ENUM ('private', 'double', 'triple', 'quad');

-- Add the room_type column to rooms table (nullable initially for existing data)
ALTER TABLE rooms ADD COLUMN room_type room_type;

-- Set default room_type based on is_private field
UPDATE rooms SET room_type = CASE WHEN is_private THEN 'private' ELSE 'double' END;

-- Make room_type NOT NULL after populating existing data
ALTER TABLE rooms ALTER COLUMN room_type SET NOT NULL;
