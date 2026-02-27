// ============================================================
// comments.js — نظام التعليقات الحقيقية
// ============================================================
// بدل ما التعليقات تُحفظ في المتصفح فقط (localStorage)،
// هلق تُحفظ في Supabase ويشوفها كل الزوار من كل مكان!
//
// كيف يشتغل:
// 1. الزائر يكتب تعليق → نرسله لـ Supabase
// 2. Supabase يحفظه في جدول اسمه "comments"
// 3. كل ما تفتح الصفحة، نجيب كل التعليقات من Supabase ونعرضها
// ============================================================

// ننتظر تحميل الصفحة بالكامل قبل ما نشغّل الكود
document.addEventListener('DOMContentLoaded', () => {

  const commentForm = document.getElementById('commentForm');
  const userCommentsContainer = document.getElementById('userComments');

  if (!commentForm || !userCommentsContainer) return;

  // ===== تحميل التعليقات من Supabase عند فتح الصفحة =====
  async function loadComments() {
    userCommentsContainer.innerHTML = `
      <h4>آراء الزوار</h4>
      <div style="text-align:center;padding:2rem;color:var(--foreground-muted)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display:inline-block">
          <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <p style="margin-top:0.5rem">جارٍ تحميل التعليقات...</p>
      </div>
    `;

    // نجيب التعليقات من Supabase — مرتبة من الأحدث للأقدم
    const { data, error } = await db
      .from('comments')
      .select('*')
      .eq('approved', true)   // فقط التعليقات الموافق عليها
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('خطأ في تحميل التعليقات:', error);
      userCommentsContainer.innerHTML = `<h4>آراء الزوار</h4><p style="text-align:center;color:var(--foreground-muted)">كن أول من يشاركنا رأيه!</p>`;
      return;
    }

    renderComments(data || []);
  }

  // ===== عرض التعليقات على الصفحة =====
  function renderComments(comments) {
    if (comments.length === 0) {
      userCommentsContainer.innerHTML = `
        <h4>آراء الزوار</h4>
        <p style="text-align:center;color:var(--foreground-muted);padding:2rem 0">كن أول من يشاركنا رأيه! 🌟</p>
      `;
      return;
    }

    const commentsHTML = comments.map(c => {
      // نأخذ أول حرف من الاسم للصورة الرمزية
      const initial = c.name ? c.name.charAt(0) : '؟';
      // تنسيق التاريخ بالعربي
      const date = new Date(c.created_at).toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      return `
        <div class="comment-card" style="animation: fadeInUp 0.4s ease">
          <div class="comment-header">
            <div class="comment-avatar">${initial}</div>
            <div class="comment-meta">
              <h5>${escapeHtml(c.name)} <span class="comment-role">${escapeHtml(c.role || '')}</span></h5>
              <span>${date}</span>
            </div>
          </div>
          <div class="comment-body">${escapeHtml(c.text)}</div>
        </div>
      `;
    }).join('');

    userCommentsContainer.innerHTML = `<h4>آراء الزوار (${comments.length})</h4>` + commentsHTML;
  }

  // ===== إرسال تعليق جديد =====
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('commenterName').value.trim();
    const role = document.getElementById('commenterRole').value;
    const text = document.getElementById('commentText').value.trim();

    if (!name || !text) return;

    // تغيير زر الإرسال أثناء الانتظار
    const btn = commentForm.querySelector('.btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'جارٍ الإرسال...';
    btn.disabled = true;

    // إرسال التعليق لـ Supabase
    const { error } = await db.from('comments').insert([{
      name,
      role,
      text,
      approved: false   // التعليق ينتظر موافقة الأدمن قبل ما يظهر
    }]);

    btn.disabled = false;
    btn.innerHTML = originalHTML;

    if (error) {
      console.error('خطأ في إرسال التعليق:', error);
      showNotification('حدث خطأ، حاول مرة أخرى', 'error');
      return;
    }

    commentForm.reset();
    showNotification('شكراً! سيظهر تعليقك بعد المراجعة ✅', 'success');
  });

  // ===== حماية من XSS — لا نعرض HTML من المستخدم مباشرة =====
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // تحميل التعليقات عند بدء الصفحة
  loadComments();

});
