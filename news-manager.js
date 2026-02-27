// ============================================================
// news-manager.js — إدارة الأخبار
// ============================================================
// الأدمن يضيف أخبار جديدة من لوحة التحكم
// وتظهر تلقائياً في الصفحة الرئيسية
// ============================================================

// ===== تحميل الأخبار في لوحة التحكم =====
async function loadAdminNews() {
  const container = document.getElementById('newsTable');
  if (!container) return;

  container.innerHTML = '<p class="loading-text">جارٍ التحميل...</p>';

  const { data, error } = await db
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    container.innerHTML = '<p class="loading-text">لا توجد أخبار بعد. أضف أول خبر! 📰</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr><th>العنوان</th><th>التصنيف</th><th>التاريخ</th><th>الحالة</th><th>إجراء</th></tr>
      </thead>
      <tbody>
        ${data.map(n => `
          <tr>
            <td>${escHtml(n.title)}</td>
            <td><span class="status-badge status-new">${escHtml(n.category)}</span></td>
            <td>${new Date(n.created_at).toLocaleDateString('ar-SA')}</td>
            <td>
              <span class="status-badge ${n.published ? 'status-contacted' : 'status-reviewed'}">
                ${n.published ? 'منشور ✅' : 'مسودة 📝'}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn-sm btn-update" onclick="togglePublishNews('${n.id}', ${n.published})">
                  ${n.published ? '📥 إلغاء نشر' : '📤 نشر'}
                </button>
                <button class="btn-sm btn-delete" onclick="deleteNews('${n.id}')">🗑️ حذف</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ===== إظهار / إخفاء نموذج إضافة خبر =====
function toggleAddNewsForm() {
  const form = document.getElementById('addNewsForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// ===== حفظ خبر جديد =====
async function saveNews() {
  const title    = document.getElementById('newsTitle')?.value.trim();
  const category = document.getElementById('newsCategory')?.value;
  const content  = document.getElementById('newsContent')?.value.trim();
  const image    = document.getElementById('newsImage')?.value.trim();

  if (!title || !content) {
    showNotification('يرجى ملء العنوان والمحتوى', 'error');
    return;
  }

  const { error } = await db.from('news').insert([{
    title,
    category,
    content,
    image: image || null,
    published: true   // ينشر مباشرة
  }]);

  if (error) {
    showNotification('حدث خطأ في الحفظ', 'error');
    return;
  }

  showNotification('تم نشر الخبر بنجاح 🎉', 'success');
  toggleAddNewsForm();

  // تنظيف الحقول
  document.getElementById('newsTitle').value = '';
  document.getElementById('newsContent').value = '';
  document.getElementById('newsImage').value = '';

  loadAdminNews();
}

// ===== تبديل حالة النشر =====
async function togglePublishNews(id, currentState) {
  const { error } = await db.from('news').update({ published: !currentState }).eq('id', id);
  if (!error) {
    showNotification(currentState ? 'تم إلغاء النشر' : 'تم النشر ✅', 'success');
    loadAdminNews();
  }
}

// ===== حذف خبر =====
async function deleteNews(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
  const { error } = await db.from('news').delete().eq('id', id);
  if (!error) { showNotification('تم الحذف', 'success'); loadAdminNews(); }
  else showNotification('حدث خطأ في الحذف', 'error');
}

// ============================================================
// ===== تحميل الأخبار في الصفحة الرئيسية =====
// ============================================================
// هذا الجزء يشتغل في index.html — يجيب الأخبار من قاعدة
// البيانات ويعرضها مكان الأخبار الثابتة
// ============================================================
async function loadNewsOnHomepage() {
  const newsGrid = document.getElementById('dynamicNewsGrid');
  if (!newsGrid) return; // مش في الصفحة الرئيسية

  const { data, error } = await db
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data?.length) return; // يبقى الديزاين الأصلي

  newsGrid.innerHTML = data.map(n => `
    <div class="news-card fade-in">
      ${n.image ? `<div class="news-image"><img src="${n.image}" alt="${n.title}" loading="lazy"></div>` : ''}
      <div class="news-content">
        <div class="news-category">${n.category}</div>
        <h3>${n.title}</h3>
        <p>${n.content.substring(0, 120)}...</p>
        <div class="news-meta">
          <span>${new Date(n.created_at).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// تشغيل تحميل الأخبار في الصفحة الرئيسية عند تحميلها
document.addEventListener('DOMContentLoaded', loadNewsOnHomepage);
