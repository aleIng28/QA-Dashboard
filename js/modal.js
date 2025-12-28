// Datos de los SP
const infoSPs = {
  sp_elimina: {
    titulo: "Explicación: SP_OC_ELIMINA_LINEAORDEN",
    descripcion: "Soluciona el error donde productos regulares conservaban descuentos especiales después de eliminar el artículo que activaba la promoción, automatizando el recalculo de importes reales.",
    imagen: "img/1.png",
    archivo: "https://drive.google.com/file/d/1uStCoZINZYAUNoGLO3KZjyrCRoTkvoaP/view?usp=drive_link", // Reemplaza con tu link de Drive
  },
  sp_reporte: {
    titulo: "Explicación: SP_REPORTE_IPRMONTOSPERIODO",
    descripcion: "Genera un reporte detallado de montos por periodo, facilitando el análisis financiero y la toma de decisiones estratégicas.",
    imagen: "img/2.png",
    archivo: "https://drive.google.com/file/d/12DB20S18lHzeYX1VkE4fxGTyL5UgLhQV/view?usp=drive_link", // Reemplaza con tu link de Drive
  },
};

const modal = document.getElementById("modalExplicacion");
const closeBtn = document.querySelector(".close-btn");

function abrirDetalle(id) {
  const data = infoSPs[id];
  if (data) {
    document.getElementById("modalTitle").innerText = data.titulo;
    document.getElementById("modalDescription").innerHTML = `<p>${data.descripcion}</p>`;
    document.getElementById("modalImage").src = data.imagen;

    // Configuración del botón para Drive
    const btnDescarga = document.getElementById("downloadBtn");
    btnDescarga.href = data.archivo;
    btnDescarga.target = "_blank"; // Abre en pestaña nueva
    btnDescarga.removeAttribute("download"); // Elimina la función de descarga local

    modal.style.display = "block";
  }
}

// Cerrar al dar clic en la X
closeBtn.onclick = () => (modal.style.display = "none");

// Cerrar al dar clic fuera del cuadro blanco
window.onclick = (event) => {
  if (event.target == modal) modal.style.display = "none";
};