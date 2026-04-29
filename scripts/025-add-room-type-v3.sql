-- Add room_type to rooms table using text type with check constraint

-- Add the room_type column 
ALTER TABLE rooms ADD COLUMN room_type text;

-- Add check constraint for valid values
ALTER TABLE rooms ADD CONSTRAINT rooms_room_type_check 
  CHECK (room_type IN ('private', 'double', 'triple', 'quad'));

-- Set default room_type based on is_private field
UPDATE rooms SET room_type = CASE WHEN is_private THEN 'private' ELSE 'double' END;

-- Make room_type NOT NULL
ALTER TABLE rooms ALTER COLUMN room_type SET NOT NULL;

-- Set default for new rows
ALTER TABLE rooms ALTER COLUMN room_type SET DEFAULT 'double';
