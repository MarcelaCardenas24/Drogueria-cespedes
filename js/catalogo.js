
document.addEventListener("DOMContentLoaded", () => {

    // 1. Obtener los elementos del catálogo
    const productos = Array.from(
        document.querySelectorAll(".catalog-product-card")
    );

    const listaProductos = document.getElementById("lista-productos");
    const categorias = document.querySelectorAll(".category-filter");

    const buscadorPrincipal = document.getElementById("buscar");
    const buscadorCatalogo = document.getElementById("buscar-catalogo");
    const formularioBusqueda = document.querySelector(".search-form");

    const contador = document.getElementById("cantidad-productos");
    const selectorOrden = document.getElementById("ordenar-productos");
    const paginacion = document.querySelector(".catalog-pagination");

    // 2. Variables de control
    const productosOriginales = [...productos];
    const productosPorPagina = 8;

    let categoriaSeleccionada = "todas";
    let terminoBusqueda = "";
    let criterioOrden = "relevantes";
    let paginaActual = 1;

    // 3. Normalizar texto para facilitar las búsquedas
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // 4. Configurar consultas individuales por WhatsApp
    const numeroWhatsApp = "573184676729";

    productos.forEach((producto) => {

        const botonWhatsApp = producto.querySelector(".button-whatsapp");

        const nombreProducto =
            producto.dataset.name ||
            producto.querySelector("h3")?.textContent.trim() ||
            "un producto";

        const mensaje =
            `Hola, quisiera consultar la disponibilidad de ${nombreProducto}. ¿Me pueden brindar información?`;

        if (botonWhatsApp) {
            botonWhatsApp.href =
                `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

            botonWhatsApp.target = "_blank";
            botonWhatsApp.rel = "noopener noreferrer";
        }
    });

    // 5. Obtener productos según la búsqueda y categoría
    function obtenerProductosFiltrados() {

        return productos.filter((producto) => {

            const nombre = normalizarTexto(
                producto.dataset.name || ""
            );

            const descripcion = normalizarTexto(
                producto.textContent
            );

            const categoria = producto.dataset.category;

            const coincideCategoria =
                categoriaSeleccionada === "todas" ||
                categoria === categoriaSeleccionada;

            const coincideBusqueda =
                nombre.includes(terminoBusqueda) ||
                descripcion.includes(terminoBusqueda);

            return coincideCategoria && coincideBusqueda;
        });
    }

    // 6. Ordenar los productos
    function ordenarProductos(lista) {

        const productosOrdenados = [...lista];

        if (criterioOrden === "nombre-asc") {

            productosOrdenados.sort((a, b) => {
                return (a.dataset.name || "").localeCompare(
                    b.dataset.name || "",
                    "es",
                    { sensitivity: "base" }
                );
            });

        } else if (criterioOrden === "nombre-desc") {

            productosOrdenados.sort((a, b) => {
                return (b.dataset.name || "").localeCompare(
                    a.dataset.name || "",
                    "es",
                    { sensitivity: "base" }
                );
            });

        } else {

            // Recuperar el orden original
            productosOrdenados.sort((a, b) => {
                return productosOriginales.indexOf(a) -
                    productosOriginales.indexOf(b);
            });
        }

        return productosOrdenados;
    }

    // 7. Crear los botones de paginación
    function actualizarPaginacion(totalPaginas) {

        if (!paginacion) return;

        paginacion.innerHTML = "";

        // Botón página anterior
        const anterior = document.createElement("a");

        anterior.href = "#lista-productos";
        anterior.setAttribute("aria-label", "Página anterior");
        anterior.innerHTML = '<i class="bi bi-chevron-left"></i>';

        if (paginaActual === 1) {
            anterior.setAttribute("aria-disabled", "true");
        } else {
            anterior.dataset.page = paginaActual - 1;
        }

        paginacion.appendChild(anterior);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {

            const boton = document.createElement("a");

            boton.href = "#lista-productos";
            boton.textContent = i;
            boton.dataset.page = i;

            if (i === paginaActual) {
                boton.classList.add("active");
                boton.setAttribute("aria-current", "page");
            }

            paginacion.appendChild(boton);
        }

        // Botón página siguiente
        const siguiente = document.createElement("a");

        siguiente.href = "#lista-productos";
        siguiente.setAttribute("aria-label", "Página siguiente");
        siguiente.innerHTML = '<i class="bi bi-chevron-right"></i>';

        if (paginaActual === totalPaginas) {
            siguiente.setAttribute("aria-disabled", "true");
        } else {
            siguiente.dataset.page = paginaActual + 1;
        }

        paginacion.appendChild(siguiente);
    }

    // 8. Mostrar los productos de la página seleccionada
    function aplicarFiltros() {

        const productosFiltrados = obtenerProductosFiltrados();

        const productosOrdenados = ordenarProductos(
            productosFiltrados
        );

        const totalProductos = productosOrdenados.length;

        const totalPaginas = Math.ceil(
            totalProductos / productosPorPagina
        );

        // Evitar que la página actual quede fuera del rango
        if (totalPaginas === 0) {
            paginaActual = 1;
        } else if (paginaActual > totalPaginas) {
            paginaActual = totalPaginas;
        }

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;

        const productosVisibles = productosOrdenados.slice(
            inicio,
            fin
        );

        // Ocultar todos los productos inicialmente
        productos.forEach((producto) => {
            producto.hidden = true;
        });

        // Mostrar únicamente los productos que corresponden
        // a la categoría, búsqueda y página seleccionadas
        productosVisibles.forEach((producto) => {
            listaProductos.appendChild(producto);
            producto.hidden = false;
        });

        // Actualizar contador
        if (contador) {

            if (totalProductos === 0) {
                contador.textContent = "Mostrando 0 productos";
            } else {
                contador.textContent =
                    `Mostrando ${inicio + 1}-${Math.min(fin, totalProductos)} de ${totalProductos} productos`;
            }
        }

        // Mostrar mensaje si no existen resultados
        let mensaje = document.getElementById("sin-resultados");

        if (totalProductos === 0) {

            if (!mensaje) {
                mensaje = document.createElement("p");
                mensaje.id = "sin-resultados";
                mensaje.textContent =
                    "No se encontraron productos con los filtros seleccionados.";

                listaProductos.appendChild(mensaje);
            }

        } else if (mensaje) {
            mensaje.remove();
        }

        // Actualizar paginación
        actualizarPaginacion(totalPaginas);

        // Ocultar paginación si solo hay una página
        if (paginacion) {
            paginacion.hidden = totalPaginas <= 1;
        }
    }

    // 9. Seleccionar una categoría
    categorias.forEach((boton) => {

        boton.addEventListener("click", (evento) => {

            evento.preventDefault();

            categoriaSeleccionada = boton.dataset.category;

            categorias.forEach((item) => {
                item.classList.remove("active");
            });

            boton.classList.add("active");

            paginaActual = 1;
            aplicarFiltros();
        });
    });

    // 10. Sincronizar los buscadores
    function sincronizarBusqueda(valor) {

        terminoBusqueda = normalizarTexto(valor);

        if (buscadorPrincipal) {
            buscadorPrincipal.value = valor;
        }

        if (buscadorCatalogo) {
            buscadorCatalogo.value = valor;
        }

        paginaActual = 1;
        aplicarFiltros();
    }

    // Buscador principal
    if (buscadorPrincipal) {

        buscadorPrincipal.addEventListener("input", () => {
            sincronizarBusqueda(buscadorPrincipal.value);
        });
    }

    // Buscador lateral
    if (buscadorCatalogo) {

        buscadorCatalogo.addEventListener("input", () => {
            sincronizarBusqueda(buscadorCatalogo.value);
        });
    }

    // Evitar recargar la página al enviar el formulario
    if (formularioBusqueda) {

        formularioBusqueda.addEventListener("submit", (evento) => {

            evento.preventDefault();

            sincronizarBusqueda(
                buscadorPrincipal ? buscadorPrincipal.value : ""
            );
        });
    }

    // 11. Configurar el ordenamiento
    if (selectorOrden) {

        selectorOrden.addEventListener("change", () => {

            criterioOrden = selectorOrden.value;

            paginaActual = 1;
            aplicarFiltros();
        });
    }

    // 12. Detectar clics en los botones de paginación
    if (paginacion) {

        paginacion.addEventListener("click", (evento) => {

            const boton = evento.target.closest("a");

            if (!boton || !boton.dataset.page) {
                evento.preventDefault();
                return;
            }

            evento.preventDefault();

            paginaActual = Number(boton.dataset.page);

            aplicarFiltros();

            // Volver a la sección del catálogo
            document.getElementById("productos").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    // 13. Leer búsqueda y categoría desde la URL
const parametros = new URLSearchParams(window.location.search);

const consultaInicial = parametros.get("q");
const categoriaInicial = parametros.get("categoria");

if (categoriaInicial) {
    const categoriaExiste = Array.from(categorias).some(
        boton => boton.dataset.category === categoriaInicial
    );

    if (categoriaExiste) {
        categoriaSeleccionada = categoriaInicial;

        categorias.forEach(boton => {
            boton.classList.toggle(
                "active",
                boton.dataset.category === categoriaInicial
            );
        });
    }
}

if (consultaInicial) {
    sincronizarBusqueda(consultaInicial);
} else {
    aplicarFiltros();
}

});

