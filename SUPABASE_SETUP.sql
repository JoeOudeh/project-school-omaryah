-- ============================================================
-- SUPABASE SETUP — المدارس العمرية
-- ============================================================
-- انسخ هذا الكود كله والصقه في:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================


-- ===== 1. جدول التعليقات =====
-- يحفظ كل تعليق يكتبه الزوار
CREATE TABLE IF NOT EXISTS comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,           -- اسم الزائر
  role        TEXT DEFAULT 'زائر',     -- صفته (ولي أمر، طالب، إلخ)
  text        TEXT NOT NULL,           -- نص التعليق
  approved    BOOLEAN DEFAULT FALSE,   -- هل وافق عليه الأدمن؟
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- السماح للجميع بقراءة التعليقات المعتمدة فقط
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read approved comments" ON comments
  FOR SELECT USING (approved = TRUE);

CREATE POLICY "insert comments" ON comments
  FOR INSERT WITH CHECK (TRUE);

-- السماح للأدمن بكل شيء (عبر service role)
CREATE POLICY "admin all comments" ON comments
  FOR ALL USING (TRUE);


-- ===== 2. جدول طلبات التسجيل =====
-- يحفظ كل طلب تسجيل يرسله الزوار
CREATE TABLE IF NOT EXISTS registrations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name  TEXT NOT NULL,          -- اسم ولي الأمر
  phone        TEXT NOT NULL,          -- رقم الهاتف
  student_name TEXT,                   -- اسم الطالب
  grade        TEXT,                   -- المرحلة الدراسية
  branch       TEXT,                   -- الفرع (عمّان / الزرقاء)
  message      TEXT,                   -- رسالة إضافية
  status       TEXT DEFAULT 'جديد',   -- الحالة
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert registrations" ON registrations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "admin all registrations" ON registrations
  FOR ALL USING (TRUE);


-- ===== 3. جدول الأخبار =====
-- الأدمن يضيف أخبار من لوحة التحكم وتظهر في الموقع
CREATE TABLE IF NOT EXISTS news (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,           -- عنوان الخبر
  category    TEXT DEFAULT 'فعالية',  -- التصنيف
  content     TEXT NOT NULL,           -- محتوى الخبر
  image       TEXT,                    -- رابط الصورة (اختياري)
  published   BOOLEAN DEFAULT TRUE,   -- هل منشور؟
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read published news" ON news
  FOR SELECT USING (published = TRUE);

CREATE POLICY "admin all news" ON news
  FOR ALL USING (TRUE);


-- ===== 4. جدول الزيارات =====
-- يحفظ كل زيارة للموقع
CREATE TABLE IF NOT EXISTS visits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visited_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert visits" ON visits
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "read visits count" ON visits
  FOR SELECT USING (TRUE);

CREATE POLICY "admin all visits" ON visits
  FOR ALL USING (TRUE);


-- ============================================================
-- ✅ تم! الآن لديك 4 جداول جاهزة:
-- comments      → التعليقات
-- registrations → طلبات التسجيل
-- news          → الأخبار
-- visits        → الزيارات
-- ============================================================
