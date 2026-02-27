// ============================================================
// visit-counter.js — عداد الزيارات الحي
// ============================================================
// هذا الملف يعد كم شخص زار الموقع
// يحفظ الرقم في Supabase في جدول اسمه "visits"
// ويعرض العداد في قسم الإحصائيات على الصفحة
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

  // نتحقق إذا الزائر زار الموقع خلال آخر ساعة (حتى لا يُحسب أكثر من مرة)
  const lastVisit = localStorage.getItem('omareyah_last_visit');
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!lastVisit || (now - parseInt(lastVisit)) > oneHour) {
    // زيارة جديدة — نضيف سجل في Supabase
    await db.from('visits').insert([{ visited_at: new Date().toISOString() }]);
    localStorage.setItem('omareyah_last_visit', now.toString());
  }

  // نجيب العدد الكلي للزيارات
  const { count, error } = await db
    .from('visits')
    .select('*', { count: 'exact', head: true });

  if (!error && count !== null) {
    // نعرض العداد في أي عنصر عنده data-visits="true"
    const visitorElements = document.querySelectorAll('[data-visitors]');
    visitorElements.forEach(el => {
      el.textContent = count.toLocaleString('ar-SA');
    });

    // إذا في stat-number خاص بالزوار، نحدّثه
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
      if (el.getAttribute('data-target') === 'visitors') {
        el.textContent = count.toLocaleString('ar-SA');
      }
    });
  }

});
