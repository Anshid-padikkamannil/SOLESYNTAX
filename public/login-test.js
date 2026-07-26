const loginBtn = document.getElementById("loginBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const message = document.getElementById("message");

loginBtn.addEventListener("click", login);

async function login() {
  try {
    
    message.textContent = "Logging in...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {

      message.textContent = "Email and password are required.";

      return;
    }

    const response = await fetch("/api/users/login", {
      method: "POST",

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

    message.style.color = "green";
    message.textContent = "Login successful!";

    setTimeout(() => {

      window.location.href = "/payment-test.html";

    }, 1000);

  } catch (error) {
    
    message.textContent = "Something went wrong.";

    console.error(error);

  }
  
}