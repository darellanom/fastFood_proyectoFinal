// declaracion de todos los contenedores a traves de los Id
const encabezadoContainer = document.getElementById('encabezado')
const totalIva = document.getElementById('iva')
const totalElemento = document.getElementById('total')
const productosContainer = document.getElementById('cajaMostrarProductos')
const mostrarProductosSeleccion = document.getElementById('cajaMostrarProductosSeleccion')
const productosSeleccionadosContainer = document.getElementById('productosSeleccionados')
const botonContinuar = document.getElementById('continuar')
const botonCarrito = document.getElementById('iconoCarrito')

// Inicializacion variables
let iva = 0
let totalMasIva = 0
let total = 0

// funcion para mostrar productos disponibles
async function mostrarProductos (){ 
    try{
       productosContainer.innerHTML = ""
        const productosJSON = await fetch("./productos.json")
        const productosParseados = await productosJSON.json()
        productosParseados.forEach((producto) => {
            const productosHTML = `
                <div class="producto card">
                    <div class="row">
                        <div class="col">
                            <img src="./media/${producto.nombre+producto.id}.png" class="imgCard" alt="${producto.nombre}">
                        </div>
                    <div class="col">
                        <h2 class="nombreMostrar">${producto.nombre}</h2>
                    </div>
                    <div class="row pt-2">
                        <div class="col d-flex align-items-center">
                            <p>Precio: AR$<span class="precio">${producto.precio}</span></p>
                        </div>
                            <div class=" col">
                            <div class=" cajaBoton">
                                <button class="d-flex align-items-center menosUno">-</button>
                                <p class="d-flex align-items-center counter">0</p>
                                <button class="d-flex align-items-center masUno">+</button>
                            </div>
                            </div>
                    </div>
                    </div>
                </div>
            `
            productosContainer.innerHTML += productosHTML;
            })
            
    // Declaracion de todos los botones de masUno, menosUno, contador y precios
    let botonMasUno = document.querySelectorAll('.masUno')
    let botonMenosUno = document.querySelectorAll('.menosUno')
    let counters = document.querySelectorAll('.counter')
    let precios = document.querySelectorAll('.precio')

    // Event listener para cada botón de incremento
    botonMasUno.forEach((button, index) => {
    button.addEventListener('click', function() {
        let count = parseInt(counters[index].textContent)
        count++
        counters[index].textContent = count  // Actualizo el contador correspondiente
        actTolales()  // Actualizo subtotales, productos seleccionados y total
        })
    })

    // Event listener para cada botón de decremento
    botonMenosUno.forEach((button, index) => {
        button.addEventListener('click', function() {
            let count = parseInt(counters[index].textContent)
                if (count > 0) {
                    count--
                    counters[index].textContent = count  // Actualizo el contador correspondiente
                actTolales()  // Actualizo subtotales, productos seleccionados y total
                }
        })
    })

    // Función para previsualizar la selección y actualizar el subtotal y total a pagar
    function actTolales(iva, totalMasIva, total) {
    total = 0  // Reinicio el total
    productosSeleccionadosContainer.innerHTML = '' // Limpio productos seleccionados

       counters.forEach ((counter, index) => {
        const count = parseInt(counter.textContent)
        const precio = parseInt(precios[index].textContent)
        const productoSubtotal = count * precio

        if (count > 0) {
            // funcion para mostrar los productos seleccionados 
            const nombreProducto = document.querySelectorAll('.producto h2')[index].textContent
            const SeleccionProductoHTML = `
                <div class="seleccion">
                <p class="me-2 subtotal" id="cantidadLista">X ${count}</p>
                <p class="me-2" id="nombreLista">${nombreProducto}</p>
                <p  class="subtotal">: $${productoSubtotal}</p>
                </div>
            `
            productosSeleccionadosContainer.innerHTML += SeleccionProductoHTML
        }
        total += productoSubtotal
        iva = total * 0.21
        totalMasIva = iva + total
    })
    
    totalIva.textContent = iva
    totalElemento.textContent = totalMasIva
    localStorage.setItem ("cobrar", totalMasIva)
    }
    }catch(err){
        encabezadoContainer.innerText = `Error al leer el archivo`
    }finally{
        
    }
}
mostrarProductos()

//funcion para construir lista de productos para llevar al storage

function obtenerListaSeleccion(){
    const seleccionElementos = document.querySelectorAll('.seleccion')
    const listaSeleccion = []

    seleccionElementos.forEach(elemento => {
        const nombreProductoSeleccionado = elemento.querySelector('#nombreLista').textContent;
        const cantidadSeleccionada = parseInt(elemento.querySelector('#cantidadLista').textContent.replace('X ', ''));
    
        const productoLista = {
            nombre: nombreProductoSeleccionado,
            cantidad: cantidadSeleccionada 
        }
        listaSeleccion.push(productoLista)
    })
    
  return listaSeleccion
}


// funcion para guardar en local storage
function guardarProductos() {
    const listaSeleccion = obtenerListaSeleccion();
    const listaSeleccionJSON = JSON.stringify(listaSeleccion);

    localStorage.setItem('productosSeleccionados', listaSeleccionJSON);
    
}

// funcion para llamar al storage
function llamarDesdeLocalStorage() {

    const listaSeleccionJSON = localStorage.getItem('productosSeleccionados');

    if (listaSeleccionJSON) {
        const listaSeleccion = JSON.parse(listaSeleccionJSON);
        return listaSeleccion;
    }
    // Si no hay datos, retornar un arreglo vacío
    return [];
}

//funcion para llamar al formulario de pago

async function payForm(){
    const { value: formValues } = await Swal.fire({
        title: "Formulario de pago TDC",
        customClass: {
          title: 'miCustomTitles'
        },

        width:'500px',
        height:'200px',
        
        html: `
           <label class="d-flex align-items-center" > Numero de tarjeta: <input id="swal-input1" class="swal2-input" placeholder="0123 4567 8910 1112"/></label><br />
           <label class="d-flex align-items-center"> Nombre de la tarjeta:<input id="swal-input2" class="swal2-input" placeholder="Nombre y Apellido"/></label><br />
           <label class="d-flex align-items-center"> Fecha de expiración: <input id="swal-input3" class="swal2-input" placeholder="MM/AA"/></label><br />
           <label class="d-flex align-items-center"> Codigo de validación: <input id="swal-input4" class="swal2-input" placeholder="CVC"/></label><br />
           <label class="d-flex align-items-center"> Total a debitar: AR$ ${localStorage.getItem('cobrar')}</label>
           `,
        focusConfirm: false,
        showCancelButton: true,
        cancelButtonText: "volver",
       
        preConfirm: () => {
            const input1 = document.getElementById("swal-input1").value
            const input2 =document.getElementById("swal-input2").value
            const input3 =document.getElementById("swal-input3").value
            const input4 =document.getElementById("swal-input4").value
        
            if (!input1 || !input2|| !input3 || !input4) {
                Swal.showValidationMessage('¡algunos campos vacíos!')
                return null; // Esto evitará que la alerta se cierre
              }
        }
        })
        if (formValues) {
            Swal.fire({
                icon: "success",
                title: "Pago realizado con éxito",
                showConfirmButton: false,
                timer: 3000,
                width:'auto',
            }).then(() => {
                // Después de que el SweetAlert se cierra, reca la página
                window.location.reload();
                localStorage.clear();  // Limpia el localStorage
            });
        }
}

//funcion para crear los event listener
function manejarClickCarrito() {
    carrito = obtenerListaSeleccion();
    if (carrito.length > 0) {
        // Alerta que muestra los productos seleccionados en el carrito
        const totalAlert = localStorage.getItem('cobrar');
        let alertCarrito = carrito.map(producto => 
            `<div class="alertCarrito">X ${producto.cantidad} - ${producto.nombre}</div>`
        ).join('<br>');
    
        alertCarrito = alertCarrito + `<br> <div class="alertTotalCarrito"> Total a pagar: $AR ${totalAlert} </div>`;
        Swal.fire({
            title: "Tu pedido:",
            html: alertCarrito,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Ir a pagar",
            cancelButtonText: "volver",
            denyButtonText: "vaciar carrito",
            customClass: {
            title: 'miCustomTitles'  
              },
            width:'400px',
            height:'200px',
        }).then((result) => {
            if (result.isConfirmed) {
                // Llama a payForm
                payForm();
            } else if (result.isDenied) {
                // Reinicia la página
                window.location.reload();
                localStorage.clear();
            }
        });
    } else {
        Swal.fire({
            title: "Carrito vacío",
            text: "Selecciona por lo menos un producto",
            icon: "info",
            width:'auto',
             
        });
    }
    guardarProductos();
    iva = 0;
    totalMasIva = 0;
}

//event listener para icono de carrito y continuar
botonContinuar.addEventListener('click', manejarClickCarrito);
botonCarrito.addEventListener('click', manejarClickCarrito);