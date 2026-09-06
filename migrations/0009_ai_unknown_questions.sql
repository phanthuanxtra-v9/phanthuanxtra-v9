CREATE TABLE IF NOT EXISTS ai_unknown_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  question TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  human_answer TEXT,
  notified_at TEXT,
  answered_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_unknown_questions_status ON ai_unknown_questions(status);
CREATE INDEX IF NOT EXISTS idx_ai_unknown_questions_conversation ON ai_unknown_questions(conversation_id, created_at);
