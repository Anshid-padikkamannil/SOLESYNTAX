document.addEventListener('DOMContentLoaded', function() {

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const globalError = document.getElementById('globalError');

  // ---- Helper to show field error ----
  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
      errorEl.textContent = message;
    }
    if (field) {
      field.closest('.field').classList.toggle('error', !!message);
    }
  }

  // ---- Clear all errors ----
  function clearErrors() {
    ['email', 'password'].forEach(id => {
      setFieldError(id, '');
    });
    globalError.style.display = 'none';
    globalError.innerHTML = '';
  }

  // ---- Validate form ----
  function validateForm() {
    let isValid = true;
    clearErrors();

    // Email
    const email = emailInput.value.trim();
    if (!email) {
      setFieldError('email', 'Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Password
    const password = passwordInput.value;
    if (!password) {
      setFieldError('password', 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setFieldError('password', 'Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  }

  // ---- Form submission ----
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Show loading state
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Success – redirect
      const redirectUrl = window.redirectAfterLogin || '/';
      window.location.href = redirectUrl;

    } catch (err) {
      // Display server error
      globalError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${err.message}`;
      globalError.style.display = 'flex';
      // Re-enable button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // ---- Toggle password visibility ----
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.closest('.input-wrapper').querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      // Optional: toggle icon (eye ↔ eye-slash)
      const svg = this.querySelector('svg');
      // You could replace the SVG path here if you have a eye-slash version
    });
  });

  // ---- Clear field error on input ----
  ['email', 'password'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', function() {
        setFieldError(id, '');
        globalError.style.display = 'none';
      });
    }
  });
});