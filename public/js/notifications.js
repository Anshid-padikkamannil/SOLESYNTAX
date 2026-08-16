// ============================================================
// 1. Toast System (Bootstrap 5)
// ============================================================
function showToast(message, type = 'success', title = '') {
  // Create container if not exists
  let container = document.querySelector('.toast-container.position-fixed');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-success' :
                  type === 'danger' ? 'bg-danger' :
                  type === 'warning' ? 'bg-warning text-dark' :
                  type === 'info' ? 'bg-info text-dark' :
                  'bg-secondary';
  toastEl.className = `toast align-items-center ${bgClass} border-0`;
  toastEl.role = 'alert';
  toastEl.ariaLive = 'assertive';
  toastEl.ariaAtomic = 'true';
  toastEl.style.borderRadius = '12px';
  toastEl.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold" style="font-size:15px;">
        ${title ? `<span class="me-1">${title}</span>` : ''} ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toastEl);

  const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', function() {
    toastEl.remove();
  });
}

// ============================================================
// 2. SweetAlert2 Helpers (optional, for convenience)
// ============================================================

// ---- Simple modal ----
function showSwal(icon, title, text, timer = null) {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
    confirmButtonColor: '#88c8bc',
    confirmButtonText: 'OK',
    timer: timer,
    showConfirmButton: !timer
  });
}

// ---- Confirm modal ----
function confirmAction(message, callback) {
  Swal.fire({
    icon: 'question',
    title: 'Are you sure?',
    text: message || 'This action cannot be undone.',
    showCancelButton: true,
    confirmButtonColor: '#88c8bc',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, proceed!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed && typeof callback === 'function') {
      callback();
    }
  });
}