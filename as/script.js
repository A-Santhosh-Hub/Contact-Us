// Initialize EmailJS
emailjs.init("I7vgSe0Ewz4PAcOrS"); // Replace with your EmailJS public key

// Theme Toggle Logic
const toggleBtn = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");

// Load theme preference
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeIcon.textContent = "☀️";
  }

  // Trigger scroll animation once on load
  revealOnScroll();
});

// Theme Toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Scroll Reveal
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
}
window.addEventListener("scroll", revealOnScroll);

// Form Submission
const form = document.getElementById("contactForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("service_atbbdfm", "template_rszrquf", this)
    .then(() => {
      showToast("✅ Message sent successfully!");
      form.reset();
    }, (error) => {
      showToast("❌ Failed to send message.");
      console.error("EmailJS Error:", error);
    });
});
