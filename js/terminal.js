const sqlQueries = [
  {
    // QUERY 1: CONSULTAR FAMILIA
    query: `SELECT P.Id_Producto, P.Codigo, P.Descripcion, LP.Id_ListaPreciosProducto, LP.Precio, F.Familia\nFROM SYS_Productos AS P \nJOIN OC_ListaPreciosProductos AS LP ON P.Id_Producto = LP.Id_Producto\nJOIN CAT_Familias AS F ON F.Id_Familia = LP.Id_Familia\nWHERE P.Codigo IN ('81199', '81198', '71447', '37433');`,
    result: `
            <table class="sql-result">
                <tr><th>Id_Producto</th><th>Codigo</th><th>Descripcion</th><th>Id_ListaPreciosProducto</th><th>Precio</th><th>Familia</th></tr>
                <tr><td>1520</td><td>81199</td><td>Suplemento Multivitamínico</td><td>502</td><td>$450.00</td><td>Nutrición</td></tr>
                <tr><td>1521</td><td>81198</td><td>Shampoo Extractos Naturales</td><td>503</td><td>$125.50</td><td>Cuidado Personal</td></tr>
                <tr><td>1640</td><td>71447</td><td>Crema Hidratante Facial</td><td>610</td><td>$320.00</td><td>Belleza</td></tr>
            </table>`,
  },
  {
    // QUERY 2: ESTATUS DE MOVIMIENTO
    query: `SELECT O.Id_OrdenCompra, O.Id_Cuenta, O.Id_Sucursal, O.NumeroPiezas, O.Importe, O.Id_EstatusMovimiento, E.EstatusMovimiento\nFROM OC_OrdenesCompra AS O \nJOIN CAT_EstatusMovimientos AS E ON O.Id_EstatusMovimiento = E.Id_EstatusMovimiento\nWHERE Id_Sucursal = 200 AND Id_OrdenCompra = 100;`,
    result: `
            <table class="sql-result">
                <tr><th>Id_OrdenCompra</th><th>Id_Cuenta</th><th>Id_Sucursal</th><th>NumeroPiezas</th><th>Importe</th><th>Id_EstatusMovimiento</th><th>EstatusMovimiento</th></tr>
                <tr><td>100</td><td>10542</td><td>200</td><td>12</td><td>$2,450.00</td><td>3</td><td>FINALIZADA</td></tr>
            </table>`,
  },
  {
    // QUERY 3: INSERTS ESTRUCTURA REPORTE
    query: `INSERT INTO SYS_EstructuraReporte (Id_Estructura, Id_Reporte, Campo, Titulo, Id_TipoDato, Orden, Ancho, Activo)\nVALUES \n(964, 217, 'Id_OrdenCompra', 'ID Orden Compra', 1, 1, 130, 1),\n(965, 217, 'Id_Empresa', 'ID Empresa', 1, 2, 120, 1),\n(966, 217, 'Empresa', 'Empresa', 4, 3, 110, 1); -- (+35 líneas más...)`,
    result: `<p style='color: #2ecc71; font-weight: bold;'><i class='bx bx-check-double'></i> (38) Filas insertadas correctamente en SYS_EstructuraReporte.</p><p style='color: #666; font-size: 0.8rem;'>Query ejecutado en: 0.0042s</p>`,
  },
  {
    // QUERY 4: RANGOS E IMPORTES (CON FUNCION ESCALAR)
    query: `SELECT C.Id_Cliente, C.Nombre, C.ApellidoPaterno, MC.MontoComisionable, D.Descripcion, D.RangoInicial, D.RangoFinal, \ndbo.FN_CONSULTA_IMPORTEA_PERIODO(C.Id_Cliente, MC.Id_Periodo) AS ImporteA\nFROM SYS_MontosComisionables AS MC\nJOIN SYS_Clientes AS C ON MC.Id_Cliente = C.Id_Cliente\nJOIN CAT_Descuentos AS D ON D.Id_Descuento = C.Id_Descuento\nWHERE MC.Id_Periodo = 133 AND D.Id_Descuento = 6;`,
    result: `
            <table class="sql-result">
                <tr><th>Id_Cliente</th><th>Nombre</th><th>ApellidoPaterno</th><th>MontoComisionable</th><th>Descripcion</th><th>RangoInicial</th><th>RangoFinal</th><th>ImporteA</th></tr>
                <tr><td>885</td><td>ALEJANDRO</td><td>GARCIA</td><td>$7,500.00</td><td>DIAMANTE</td><td>5000.00</td><td>9999.00</td><td>$1,500.00</td></tr>
                <tr><td>1024</td><td>BEATRIZ</td><td>LUNA</td><td>$6,200.00</td><td>DIAMANTE</td><td>5000.00</td><td>9999.00</td><td>$0.00</td></tr>
            </table>`,
  },
];

let querySeleccionada = 0;

function cargarQuery(index) {
  querySeleccionada = index;
  const editor = document.getElementById("sqlEditor");
  editor.value = sqlQueries[index].query;

  // Actualizar botones del carrusel
  const btns = document.querySelectorAll(".q-btn");
  btns.forEach((b) => b.classList.remove("active"));
  btns[index].classList.add("active");

  // Limpiar pantalla de resultados
  document.getElementById("resultTable").innerHTML =
    '<p class="placeholder-text">Esperando ejecución...</p>';
}

function ejecutarSimulacion() {
  const tableDiv = document.getElementById("resultTable");
  tableDiv.innerHTML = `
        <div class="loading-spinner">
            <i class='bx bx-loader-alt bx-spin'></i> Ejecutando consulta en la base de datos...
        </div>`;

  // Simulamos el delay del servidor de BD
  setTimeout(() => {
    tableDiv.innerHTML = sqlQueries[querySeleccionada].result;
  }, 800);
}

function copiarSQL() {
  const editor = document.getElementById("sqlEditor");

  // Seleccionamos el contenido del textarea
  editor.select();
  editor.setSelectionRange(0, 99999); // Para dispositivos móviles

  try {
    // Intentamos copiar
    navigator.clipboard.writeText(editor.value).then(() => {
      // Cambiamos el diseño del botón temporalmente para dar feedback
      const btn = document.querySelector(".copy-btn");
      const originalHTML = btn.innerHTML;

      btn.innerHTML = "<i class='bx bx-check'></i> ¡Copiado!";
      btn.style.backgroundColor = "#2ecc71";
      btn.style.color = "white";

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.backgroundColor = ""; // Regresa al estilo CSS
        btn.style.color = "";
      }, 2000);
    });
  } catch (err) {
    console.error("Error al copiar: ", err);
  }
}

// Inicializar con el primer query al cargar la sección
document.addEventListener("DOMContentLoaded", () => {
  cargarQuery(0);
});
