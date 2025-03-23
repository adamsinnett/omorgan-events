-- Drop the existing check constraint
ALTER TABLE reactions
DROP CONSTRAINT reactions_reaction_type_check;

-- Add new check constraint for emoji reactions
ALTER TABLE reactions
ADD CONSTRAINT reactions_reaction_type_check
CHECK (reaction_type IN ('👍', '❤️', '🎉', '👏'));

-- Update existing reactions to use new emoji format
UPDATE reactions
SET reaction_type = CASE
    WHEN reaction_type = 'like' THEN '👍'
    WHEN reaction_type = 'love' THEN '❤️'
    WHEN reaction_type = 'laugh' THEN '🎉'
    WHEN reaction_type = 'wow' THEN '👏'
    ELSE reaction_type
END; 