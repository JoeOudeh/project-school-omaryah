// ============================================================
// admin.js — منطق لوحة تحكم المدارس العمرية
// ============================================================
// هذا الملف يتحكم في كل شي في لوحة التحكم:
// - تسجيل الدخول بكلمة مرور
// - عرض طلبات التسجيل
// - الموافقة على التعليقات أو حذفها
// - عرض إحصائيات الزيارات
// ============================================================

// ===== كلمة مرور لوحة التحكم =====
// غيّرها لكلمة مرور قوية قبل المسابقة!
const ADMIN_PASSWORD = "Omareyah@Admin2025";

// ===== تسجيل الدخول =====
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;

  if (password === ADMIN_PASSWORD) {
    // كلمة المرور صحيحة
    sessionStorage.setItem('adminLoggedIn', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    initDashboard();
  } else {
    // كلمة المرور خاطئة
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
});

// ===== تحقق من تسجيل الدخول عند تحميل الصفحة =====
window.addEventListener('load', () => {
  if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    initDashboard();
  }
  // عرض التاريخ الحالي
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

// ===== تسجيل الخروج =====
function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  location.reload();
}

// ===== تهيئة لوحة التحكم =====
function initDashboard() {
  loadOverview();
  loadRegistrations();
  loadAdminComments();
  loadAdminNews();
  loadVisitStats();
}

// ===== التنقل بين التبويبات =====
function showTab(tabName) {
  // إخفاء كل التبويبات
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // إظهار التبويب المطلوب
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // تمييز زر التبويب النشط
  event.currentTarget.classList.add('active');
}

// ============================================================
// ===== نظرة عامة =====
// ============================================================
async function loadOverview() {
  // عدد كل طلبات التسجيل
  const { count: totalRegs } = await db.from('registrations').select('*', { count: 'exact', head: true });
  document.getElementById('totalRegs').textContent = totalRegs || 0;

  // عدد الطلبات الجديدة
  const { count: newRegs } = await db.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'جديد');
  document.getElementById('newRegs').textContent = newRegs || 0;

  // تعليقات بانتظار الموافقة
  const { count: pending } = await db.from('comments').select('*', { count: 'exact', head: true }).eq('approved', false);
  document.getElementById('pendingComments').textContent = pending || 0;

  // الشارة الحمراء في القائمة
  if (pending > 0) {
    document.getElementById('commentBadge').textContent = pending;
    document.getElementById('commentBadge').classList.add('show');
  }

  if (newRegs > 0) {
    document.getElementById('regBadge').textContent = newRegs;
    document.getElementById('regBadge').classList.add('show');
  }

  // إجمالي الزيارات
  const { count: visits } = await db.from('visits').select('*', { count: 'exact', head: true });
  document.getElementById('totalVisits').textContent = visits?.toLocaleString('ar-SA') || 0;

  // آخر 5 طلبات
  const { data: recentRegs } = await db.from('registrations').select('*').order('created_at', { ascending: false }).limit(5);
  renderRecentRegistrations(recentRegs || []);
}

function renderRecentRegistrations(regs) {
  const container = document.getElementById('recentRegistrations');
  if (!regs.length) {
    container.innerHTML = '<p class="loading-text">لا توجد طلبات بعد</p>';
    return;
  }
  container.innerHTML = `
    <table>
      <thead><tr><th>اسم ولي الأمر</th><th>الهاتف</th><th>الفرع</th><th>التاريخ</th><th>الحالة</th></tr></thead>
      <tbody>
        ${regs.map(r => `
          <tr>
            <td>${escHtml(r.parent_name)}</td>
            <td dir="ltr">${escHtml(r.phone)}</td>
            <td>${escHtml(r.branch || '-')}</td>
            <td>${new Date(r.created_at).toLocaleDateString('ar-SA')}</td>
            <td><span class="status-badge ${getStatusClass(r.status)}">${escHtml(r.status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ============================================================
// ===== طلبات التسجيل =====
// ============================================================
async function loadRegistrations() {
  const statusFilter = document.getElementById('statusFilter')?.value;
  const branchFilter = document.getElementById('branchFilter')?.value;

  let query = db.from('registrations').select('*').order('created_at', { ascending: false });
  if (statusFilter) query = query.eq('status', statusFilter);
  if (branchFilter) query = query.eq('branch', branchFilter);

  const { data, error } = await query;
  const container = document.getElementById('registrationsTable');

  if (error || !data?.length) {
    container.innerHTML = '<p class="loading-text">لا توجد طلبات</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th><th>ولي الأمر</th><th>الهاتف</th><th>الطالب</th>
          <th>المرحلة</th><th>الفرع</th><th>التاريخ</th><th>الحالة</th><th>إجراء</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escHtml(r.parent_name)}</td>
            <td dir="ltr">${escHtml(r.phone)}</td>
            <td>${escHtml(r.student_name || '-')}</td>
            <td>${escHtml(r.grade || '-')}</td>
            <td>${escHtml(r.branch || '-')}</td>
            <td>${new Date(r.created_at).toLocaleDateString('ar-SA')}</td>
            <td>
              <select class="filter-bar select" onchange="updateRegStatus('${r.id}', this.value)" style="padding:0.3rem 0.5rem;font-size:0.8rem;background:var(--bg);border:1px solid var(--border);border-radius:0.4rem;color:var(--text);font-family:Tajawal,sans-serif">
                <option ${r.status==='جديد'?'selected':''}>جديد</option>
                <option ${r.status==='تمت المراجعة'?'selected':''}>تمت المراجعة</option>
                <option ${r.status==='تم التواصل'?'selected':''}>تم التواصل</option>
              </select>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn-sm btn-delete" onclick="deleteRegistration('${r.id}')">🗑️ حذف</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateRegStatus(id, status) {
  const { error } = await db.from('registrations').update({ status }).eq('id', id);
  if (!error) showNotification('تم تحديث الحالة ✅', 'success');
  else showNotification('حدث خطأ في التحديث', 'error');
}

async function deleteRegistration(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
  const { error } = await db.from('registrations').delete().eq('id', id);
  if (!error) { showNotification('تم الحذف ✅', 'success'); loadRegistrations(); loadOverview(); }
  else showNotification('حدث خطأ في الحذف', 'error');
}

// تصدير كـ CSV
function exportRegistrations() {
  db.from('registrations').select('*').order('created_at', { ascending: false }).then(({ data }) => {
    if (!data?.length) { showNotification('لا توجد بيانات للتصدير', 'info'); return; }
    const headers = ['اسم ولي الأمر', 'الهاتف', 'اسم الطالب', 'المرحلة', 'الفرع', 'الرسالة', 'الحالة', 'التاريخ'];
    const rows = data.map(r => [r.parent_name, r.phone, r.student_name||'', r.grade||'', r.branch||'', r.message||'', r.status, new Date(r.created_at).toLocaleDateString('ar-SA')]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'registrations.csv'; a.click();
    showNotification('تم التصدير بنجاح 📥', 'success');
  });
}

// ============================================================
// ===== التعليقات =====
// ============================================================
async function loadAdminComments() {
  const filter = document.getElementById('commentFilter')?.value;
  const container = document.getElementById('commentsContainer');
  container.innerHTML = '<p class="loading-text">جارٍ التحميل...</p>';

  let query = db.from('comments').select('*').order('created_at', { ascending: false });
  if (filter === 'true')  query = query.eq('approved', true);
  if (filter === 'false') query = query.eq('approved', false);

  const { data, error } = await query;

  if (error || !data?.length) {
    container.innerHTML = '<p class="loading-text" style="grid-column:1/-1">لا توجد تعليقات</p>';
    return;
  }

  container.innerHTML = data.map(c => `
    <div class="admin-comment-card">
      <div class="comment-header">
        <div class="comment-avatar-sm">${(c.name||'?').charAt(0)}</div>
        <div class="comment-info">
          <h4>${escHtml(c.name)} <small style="color:var(--text-muted);font-weight:400">${escHtml(c.role||'')}</small></h4>
          <span>${new Date(c.created_at).toLocaleDateString('ar-SA')}</span>
        </div>
        <span class="status-badge" style="margin-right:auto;${c.approved?'background:rgba(34,197,94,0.15);color:#4ade80':'background:rgba(245,158,11,0.15);color:#fbbf24'}">
          ${c.approved ? 'معتمد ✅' : 'بانتظار الموافقة ⏳'}
        </span>
      </div>
      <div class="comment-body-text">${escHtml(c.text)}</div>
      <div class="action-btns">
        ${!c.approved ? `<button class="btn-sm btn-approve" onclick="approveComment('${c.id}')">✅ موافقة</button>` : ''}
        <button class="btn-sm btn-delete" onclick="deleteComment('${c.id}')">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

async function approveComment(id) {
  const { error } = await db.from('comments').update({ approved: true }).eq('id', id);
  if (!error) { showNotification('تم اعتماد التعليق ✅', 'success'); loadAdminComments(); loadOverview(); }
  else showNotification('حدث خطأ', 'error');
}

async function deleteComment(id) {
  if (!confirm('حذف هذا التعليق؟')) return;
  const { error } = await db.from('comments').delete().eq('id', id);
  if (!error) { showNotification('تم حذف التعليق', 'success'); loadAdminComments(); loadOverview(); }
  else showNotification('حدث خطأ في الحذف', 'error');
}

// ============================================================
// ===== إحصائيات الزيارات =====
// ============================================================
async function loadVisitStats() {
  // إجمالي
  const { count: all } = await db.from('visits').select('*', { count: 'exact', head: true });
  document.getElementById('allVisits').textContent = (all||0).toLocaleString('ar-SA');
  document.getElementById('totalVisits').textContent = (all||0).toLocaleString('ar-SA');

  // زيارات اليوم
  const today = new Date(); today.setHours(0,0,0,0);
  const { count: todayCount } = await db.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', today.toISOString());
  document.getElementById('todayVisits').textContent = todayCount || 0;

  // زيارات الشهر
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { count: monthCount } = await db.from('visits').select('*', { count: 'exact', head: true }).gte('visited_at', firstOfMonth.toISOString());
  document.getElementById('monthVisits').textContent = monthCount || 0;

  // آخر 10 زيارات
  const { data: recent } = await db.from('visits').select('*').order('visited_at', { ascending: false }).limit(10);
  const visitsTable = document.getElementById('recentVisits');
  if (recent?.length) {
    visitsTable.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>وقت الزيارة</th></tr></thead>
        <tbody>
          ${recent.map((v,i) => `
            <tr>
              <td>${i+1}</td>
              <td>${new Date(v.visited_at).toLocaleString('ar-SA')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

// ============================================================
// ===== أدوات مساعدة =====
// ============================================================
function escHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getStatusClass(status) {
  if (status === 'جديد') return 'status-new';
  if (status === 'تمت المراجعة') return 'status-reviewed';
  if (status === 'تم التواصل') return 'status-contacted';
  return 'status-new';
}

// تحديث تلقائي كل دقيقة
setInterval(() => {
  if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    loadOverview();
  }
}, 60000);
