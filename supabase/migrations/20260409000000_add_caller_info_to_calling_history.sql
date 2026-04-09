-- Migration: Add caller identity fields to calling_comment_history JSONB entries
-- Each entry in the calling_comment_history JSONB array now includes:
--   addedById  (UUID)           - the auth.users id of who added the comment
--   addedByRole ("admin"|"staff") - whether the caller was an admin or staff
--   addedBy    (text)           - display name e.g. "Admin - VJ" or "Staff - Rahul"
--
-- No column changes needed (JSONB is schema-flexible).
-- This migration backfills addedByRole for old entries that have addedBy = 'admin' or 'staff'.

UPDATE crm_clients
SET calling_comment_history = (
  SELECT jsonb_agg(
    CASE
      WHEN entry->>'addedBy' = 'admin' AND entry->>'addedByRole' IS NULL
        THEN entry || '{"addedByRole": "admin"}'::jsonb
      WHEN entry->>'addedBy' = 'staff' AND entry->>'addedByRole' IS NULL
        THEN entry || '{"addedByRole": "staff"}'::jsonb
      ELSE entry
    END
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(calling_comment_history) WITH ORDINALITY AS t(entry, ordinality)
)
WHERE jsonb_array_length(calling_comment_history) > 0
  AND calling_comment_history::text LIKE '%"addedBy"%'
  AND calling_comment_history::text NOT LIKE '%"addedByRole"%';
