// ============================================================
// supabase.js — الجسر بين الموقع وقاعدة البيانات
// ============================================================
// هذا الملف يحتوي على مفاتيح الاتصال بـ Supabase
// كل الملفات الأخرى ستستخدم الـ supabase object من هنا
// ============================================================

const SUPABASE_URL = "https://fmhwlgmnovpwqoljbftj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaHdsZ21ub3Zwd3FvbGpiZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTE1MDcsImV4cCI6MjA4NzYyNzUwN30.u0aF0J05qwdiu-eYhkr5VaqD7ed0To7FNwfKjPSoGCo";

// إنشاء الاتصال — هذا السطر يفتح القناة بين موقعك وقاعدة البيانات
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// تصدير الـ db حتى تستخدمه باقي الملفات
// مثال: في comments.js نكتب → db.from('comments').select()
