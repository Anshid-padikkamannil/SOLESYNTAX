document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const passwordInput = document.getElementById('password');
    const termsCheck = document.getElementById('termsCheck');
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
        ['email', 'name', 'password', 'terms'].forEach(id => {
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

        // Name
        const name = nameInput.value.trim();
        if (!name) {
            setFieldError('name', 'Username is required');
            isValid = false;
        } else if (name.length < 2) {
            setFieldError('name', 'Username must be at least 2 characters');
            isValid = false;
        }

        // Password
        const password = passwordInput.value;
        if (!password) {
            setFieldError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            setFieldError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Terms
        if (!termsCheck.checked) {
            setFieldError('terms', 'You must agree to the Terms of Use');
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
        const name = nameInput.value.trim();
        const password = passwordInput.value;

        // Show loading state (optional)
        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/users/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Server error: show in global alert
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            // Success – redirect to verification notice page
            window.location.href = '/users/verify-notice';

        } catch (err) {
            // Display server error
            globalError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${err.message}`;
            globalError.style.display = 'flex';
            // Re-enable button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // ---- Toggle password visibility (unchanged) ----
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.field').querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            const icon = this.querySelector('svg');
            // Optional: change icon to eye-slash
        });
    });

    // ---- Clear field error on input ----
    ['email', 'name', 'password'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                setFieldError(id, '');
                globalError.style.display = 'none';
            });
        }
    });
    termsCheck.addEventListener('change', function() {
        setFieldError('terms', '');
        globalError.style.display = 'none';
    });
});