// ============================================================
// notifications.js — نظام الإشعارات الجميلة
// ============================================================
// هذا الملف يعرض رسائل نجاح أو خطأ في أسفل الشاشة
// مثال: لما يرسل شخص تعليق، تظهر رسالة "تم الإرسال بنجاح ✅"
// تُستخدم من كل الملفات الأخرى بكتابة: showNotification('رسالة', 'success')
// ============================================================

function showNotification(message, type = 'success') {
  // إذا في إشعار قديم، احذفه أولاً
  const existing = document.getElementById('omareyah-notification');
  if (existing) existing.remove();

  // إنشاء عنصر الإشعار
  const notification = document.createElement('div');
  notification.id = 'omareyah-notification';
  
  // الأيقونات حسب النوع
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
  };

  // الألوان حسب النوع
  const colors = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#0ea5e9'
  };

  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: ${colors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Tajawal', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 99999;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    direction: rtl;
    min-width: 280px;
    max-width: 90vw;
    justify-content: center;
  `;

  notification.innerHTML = `${icons[type]}<span>${message}</span>`;
  document.body.appendChild(notification);

  // تحريك الإشعار للأعلى
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // إخفاء الإشعار بعد 3.5 ثانية
  setTimeout(() => {
    notification.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => notification.remove(), 400);
  }, 3500);
}
