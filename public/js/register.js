const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", registerUser);

async function registerUser(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;

  try {
    
    const response = await fetch("/users/register", {
      method: "POST",
       credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        name,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);

    }

    alert(data.message);

    // User is already logged in because the cookie is set
    window.location.href = "/"

  } catch (err) {

    alert(err.message);
    
  }
}