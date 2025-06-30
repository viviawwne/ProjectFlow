// toggle-password.js - Funcionalidade para mostrar/ocultar senha

document.addEventListener("DOMContentLoaded", function () {
  const togglePasswordButton = document.getElementById("togglePassword");
  
  if (togglePasswordButton) {
    togglePasswordButton.addEventListener("click", function () {
      const passwordInput = document.getElementById("passwordInput");
      const toggleBtnIcon = this.querySelector("i");

      if (passwordInput && toggleBtnIcon) {
        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          toggleBtnIcon.classList.remove("fa-eye-slash");
          toggleBtnIcon.classList.add("fa-eye");
        } else {
          passwordInput.type = "password";
          toggleBtnIcon.classList.remove("fa-eye");
          toggleBtnIcon.classList.add("fa-eye-slash");
        }
      }
    });
  }
});
