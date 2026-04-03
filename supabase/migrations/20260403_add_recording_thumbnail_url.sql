-- Add thumbnail_url to recordings table
ALTER TABLE recordings
ADD COLUMN thumbnail_url TEXT;

COMMENT ON COLUMN recordings.thumbnail_url IS 'Custom thumbnail URL for the recording (defaults to YouTube maxresdefault if NULL)';
