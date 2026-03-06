-- ============================================================================
-- XIN EXCHANGE PLATFORM - DATABASE SETUP SCRIPT
-- ============================================================================
-- Run this script in Supabase SQL Editor to reset and configure database
-- ============================================================================

-- DROP OLD TABLES (if they exist)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;

-- ============================================================================
-- CREATE APP CONFIG TABLE - For storing admin settings & wallet addresses
-- ============================================================================
CREATE TABLE app_config (
    id INT PRIMARY KEY,
    rate1 TEXT,
    rate2 TEXT,
    rate3 TEXT,
    bep20 TEXT,
    trc20 TEXT,
    admin_pass TEXT,
    chat_toast TEXT,
    chat_toast_timer INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INSERT FRESH DATA
-- ============================================================================
INSERT INTO app_config (id, rate1, rate2, rate3, bep20, trc20, admin_pass, chat_toast, chat_toast_timer)
VALUES (
    1,
    '105rs CDM',
    '110rs IMPS & UPI',
    '115rs UPI & IMPS',
    '0x851b9F760E98A2eE860699CB625C0921EDc3243D',
    'TMYaeAdabrTJuMVhUZScfRGfyo774uNs2A',
    'Samar@143',
    'We are paying plzz wair..',
    10
) ON CONFLICT (id) DO UPDATE SET
    rate1 = EXCLUDED.rate1,
    rate2 = EXCLUDED.rate2,
    rate3 = EXCLUDED.rate3,
    bep20 = EXCLUDED.bep20,
    trc20 = EXCLUDED.trc20,
    admin_pass = EXCLUDED.admin_pass,
    chat_toast = EXCLUDED.chat_toast,
    chat_toast_timer = EXCLUDED.chat_toast_timer;

-- ============================================================================
-- CREATE CHAT SESSIONS TABLE
-- ============================================================================
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'open',
    close_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- CREATE CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (Required for Vercel frontend access)
-- ============================================================================
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFY DATA
-- ============================================================================
-- Run this to check if everything is correct:
-- SELECT * FROM app_config WHERE id = 1;
