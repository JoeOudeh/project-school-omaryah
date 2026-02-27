-- ============================================================
-- SECURITY FIX — قواعد الحماية للمدارس العمرية
-- ============================================================
-- انسخ هذا الكود كله والصقه في:
-- Supabase → SQL Editor → New Query → Run
-- ============================================================


-- ===== حذف القواعد القديمة أولاً =====
DROP POLICY IF EXISTS "read approved comments" ON comments;
DROP POLICY IF EXISTS "insert comments" ON comments;
DROP POLICY IF EXISTS "admin all comments" ON comments;

DROP POLICY IF EXISTS "insert registrations" ON registrations;
DROP POLICY IF EXISTS "admin all registrations" ON registrations;

DROP POLICY IF EXISTS "read published news" ON news;
DROP POLICY IF EXISTS "admin all news" ON news;

DROP POLICY IF EXISTS "insert visits" ON visits;
DROP POLICY IF EXISTS "read visits count" ON visits;
DROP POLICY IF EXISTS "admin all visits" ON visits;


-- ============================================================
-- ===== جدول التعليقات =====
-- ============================================================

-- ✅ أي زائر يقدر يقرأ التعليقات المعتمدة فقط
CREATE POLICY "public can read approved comments"
ON comments FOR SELECT
USING (approved = true);

-- ✅ أي زائر يقدر يضيف تعليق — لكن مو معتمد تلقائياً
CREATE POLICY "public can insert comments"
ON comments FOR INSERT
WITH CHECK (
  approved = false        -- لا يقدر يضيف تعليق معتمد مباشرة
  AND length(text) > 2    -- الحد الأدنى للتعليق حرفين
  AND length(text) < 1000 -- الحد الأقصى 1000 حرف
  AND length(name) > 1    -- الاسم لازم يكون موجود
  AND length(name) < 100  -- الاسم ما يتجاوز 100 حرف
);

-- 🔒 لا أحد يقدر يعدّل أو يحذف تعليقات عبر الـ anon key
-- (هذا يحمي من أي شخص يحاول يغير التعليقات مباشرة)


-- ============================================================
-- ===== جدول طلبات التسجيل =====
-- ============================================================

-- ✅ أي زائر يقدر يرسل طلب تسجيل
CREATE POLICY "public can insert registrations"
ON registrations FOR INSERT
WITH CHECK (
  length(parent_name) > 1   -- الاسم موجود
  AND length(parent_name) < 200
  AND length(phone) > 5      -- الهاتف موجود
  AND length(phone) < 20     -- الهاتف ما يتجاوز 20 رقم
);

-- 🔒 لا أحد يقدر يقرأ أو يعدّل الطلبات عبر الـ anon key
-- (الطلبات سرية — فقط الأدمن يشوفها من لوحة التحكم)


-- ============================================================
-- ===== جدول الأخبار =====
-- ============================================================

-- ✅ أي زائر يقدر يقرأ الأخبار المنشورة فقط
CREATE POLICY "public can read published news"
ON news FOR SELECT
USING (published = true);

-- 🔒 لا أحد يقدر يضيف أو يعدّل أخبار عبر الـ anon key
-- (فقط من لوحة التحكم)


-- ============================================================
-- ===== جدول الزيارات =====
-- ============================================================

-- ✅ أي زائر يقدر يسجّل زيارته
CREATE POLICY "public can insert visits"
ON visits FOR INSERT
WITH CHECK (true);

-- ✅ أي زائر يقدر يقرأ عدد الزيارات (للعداد)
CREATE POLICY "public can read visits"
ON visits FOR SELECT
USING (true);

-- 🔒 لا أحد يقدر يحذف أو يعدّل الزيارات


-- ============================================================
-- ===== حماية إضافية — Rate Limiting بسيط =====
-- ============================================================
-- هذا يمنع أي شخص من إرسال أكثر من 10 تعليقات
-- من نفس الاسم خلال آخر ساعة

CREATE OR REPLACE FUNCTION check_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM comments
    WHERE name = NEW.name
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 10 THEN
    RAISE EXCEPTION 'Too many comments. Please wait before commenting again.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS comment_rate_limit ON comments;
CREATE TRIGGER comment_rate_limit
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_comment_rate_limit();


-- ============================================================
-- ===== حماية إضافية — منع سبام التسجيل =====
-- ============================================================
-- يمنع أكثر من 3 طلبات من نفس رقم الهاتف خلال 24 ساعة

CREATE OR REPLACE FUNCTION check_registration_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM registrations
    WHERE phone = NEW.phone
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 3 THEN
    RAISE EXCEPTION 'Too many registrations from this phone number.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS registration_rate_limit ON registrations;
CREATE TRIGGER registration_rate_limit
  BEFORE INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION check_registration_rate_limit();


-- ============================================================
-- ✅ تم! الآن مشروعك محمي من:
-- 🛡️ قراءة البيانات السرية (طلبات التسجيل)
-- 🛡️ إضافة تعليقات معتمدة مباشرة
-- 🛡️ تعديل أو حذف أي بيانات عبر الـ anon key
-- 🛡️ سبام التعليقات (حد 10 تعليقات في الساعة)
-- 🛡️ سبام التسجيل (حد 3 طلبات في 24 ساعة)
-- ============================================================
