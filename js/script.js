document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link a");
  const sections = document.querySelectorAll(".content-section");

  links.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // 1. Quitar clase active de todos los links y secciones
      links.forEach((l) => l.parentElement.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // 2. Agregar active al link presionado
      link.parentElement.classList.add("active");

      // 3. Mostrar la sección correspondiente
      // Podemos usar el index o un atributo data-target
      // Ejemplo rápido usando el ID basado en el orden:
      const targets = ["inicio", "sp", "queries", "casos", "manual"];
      const targetId = targets[index];
      document.getElementById(targetId).classList.add("active");
    });
  });
});
