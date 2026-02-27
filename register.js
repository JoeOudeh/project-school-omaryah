// ============================================================
// register.js — نظام التسجيل والتواصل
// ============================================================
// هذا الملف يأخذ بيانات نموذج التسجيل في الصفحة الرئيسية
// ويحفظها في Supabase في جدول اسمه "registrations"
// بعدها الأدمن يشوفها في لوحة التحكم
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // جمع البيانات من النموذج
    const parentName = document.getElementById('parentName')?.value.trim();
    const phone      = document.getElementById('phone')?.value.trim();
    const studentName = document.getElementById('studentName')?.value.trim();
    const grade      = document.getElementById('grade')?.value;
    const branch     = document.getElementById('branch')?.value;
    const message    = document.getElementById('message')?.value.trim();

    // التحقق من الحقول الإلزامية
    if (!parentName || !phone) {
      showNotification('يرجى ملء اسم ولي الأمر ورقم الهاتف', 'error');
      return;
    }

    // تغيير حالة الزر أثناء الإرسال
    const btn = contactForm.querySelector('.btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `جارٍ الإرسال... <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
    btn.disabled = true;

    // إرسال البيانات لـ Supabase
    const { error } = await db.from('registrations').insert([{
      parent_name: parentName,
      phone,
      student_name: studentName || null,
      grade: grade || null,
      branch: branch || null,
      message: message || null,
      status: 'جديد'   // الحالة الافتراضية — الأدمن يغيرها لاحقاً
    }]);

    btn.disabled = false;
    btn.innerHTML = originalHTML;

    if (error) {
      console.error('خطأ في التسجيل:', error);
      showNotification('حدث خطأ في الإرسال، حاول مرة أخرى', 'error');
      return;
    }

    contactForm.reset();
    showNotification('تم استلام طلبك! سنتواصل معك قريباً 🎉', 'success');
  });

});

// ===== CSS لتحريك أيقونة التحميل الدائرية =====
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(spinStyle);
