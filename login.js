import { authenticate } from "./auth.js";

// Prevent back navigation to login page after successful login
window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", () => {
  if (localStorage.getItem("authToken")) {
    window.location.replace("main.html");
  } else {
    window.history.pushState(null, "", window.location.href);
  }
});

const feedbackEl = document.getElementById("feedback");

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = e.target.querySelector("#username").value.trim();
  const password = e.target.querySelector("#password").value;

  feedbackEl.textContent = "";
  feedbackEl.classList.remove("text-red-400", "text-green-400");

  try {
    await authenticate(username, password);
    showFeedback("Login successful!", "success");
    setTimeout(() => window.location.replace("main.html"), 700);
  } catch (err) {
    showFeedback("Invalid username or password.", "error");
  }
});

function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.classList.add(
    type === "success" ? "text-green-400" : "text-red-400",
  );
}
