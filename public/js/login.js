const loginForm = document.getElementById('loginForm');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', loginUser)

async function loginUser(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    
    const response = await fetch('/users/login', {
      method: 'POST',
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })

    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert(data.message);

    window.location.href = redirectAfterLogin || "/";

  } catch (err) {

    alert(err.message);
    
  }
}

