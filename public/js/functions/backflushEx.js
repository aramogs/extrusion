let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let submitSerial = document.getElementById("submitSerial")
let currentST = document.getElementById("currentST")
let submitArray = document.getElementById("submitArray")
let btn_transferFG = document.getElementById("btn_transferFG")
let contadorSeriales = document.getElementById("contadorSeriales")
let contadorWarning = document.getElementById("contadorWarning")
let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let btnCerrar_Success = document.getElementById("btnCerrar_Success")
let btnCerrar_Error = document.getElementById("btnCerrar_Error")
let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
let errorTextField = document.getElementById("errorTextField")
let tabla_consulta_container = document.getElementById("tabla_consulta_container")
let btn_verificar_cantidad = document.getElementById("btn_verificar_cantidad")
let div_btn_procesar_seriales = document.getElementById("div_btn_procesar_seriales")
let submitArray_form = document.getElementById("submitArray_form")
let serialsArray = []
let modalStorage = document.getElementById("modalStorage")
let beginOF = document.getElementById("beginOF")
let endOF = document.getElementById("endOF")



serial_num.focus()
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

submitSerial.addEventListener("submit", listAdd)

btn_transferFG.addEventListener("click", () => { $('#modalCantidad').modal({ backdrop: 'static', keyboard: false }) })

submitArray_form.addEventListener("submit", submitSerials)


btnCerrar_Success.addEventListener("click", cleanInput())

btnCerrar_Error.addEventListener("click", cleanInput())

btn_verificar_cantidad.addEventListener("click", verifyQuantity)



function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    submitArray.value = ""
    currentST.innerHTML = ""
    serialsArray = []
    contadorSeriales.value = 0
    div_btn_procesar_seriales.classList.remove("animate__flipInX", "animate__animated")
    div_btn_procesar_seriales.classList.add("animate__flipOutX", "animate__animated")
}


function listAdd(e) {
    e.preventDefault()

    serial = serial_num.value;
    const regex = /.*[a-zA-Z].*/;
    if (serial.charAt(0) !== "S" && serial.charAt(0) !== "s" || (serial.substring(1)).length < 9 || regex.exec(serial.substring(1)) !== null) {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

        setTimeout(() => {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);


    } else if (serialsArray.indexOf((serial_num.value).substring(1)) === -1 && serialsArray.indexOf(`0${(serial_num.value).substring(1)}`) === -1) {
        soundOk()
        if ((serial_num.value).substring(1).length < 10) {
            serialsArray.push(`0${(serial_num.value).substring(1)}`)
        } else {
            serialsArray.push((serial_num.value).substring(1))
        }

        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")

        let serial = `<small style="display:inline; "><span class="badge badge-light text-dark"> ${(serial_num.value).substring(1)} </span></small> `
        let append = document.createElement("span")
        append.innerHTML = serial
        currentST.appendChild(append)
        serial_num.value = ""

        btn_transferFG.disabled = false
        btn_transferFG.classList.remove("btn-secondary")
        btn_transferFG.classList.add("btn-warning")


    } else {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""

        setTimeout(() => {
            alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
    }
}



function increaseValue() {
    let value = parseInt(contadorSeriales.value, 10);
    value = isNaN(value) ? 0 : value;
    value++;
    contadorSeriales.value = value;
}

function decreaseValue() {
    let value = parseInt(contadorSeriales.value, 10);
    value = isNaN(value) ? 0 : value;
    value < 1 ? value = 1 : '';
    value--;
    contadorSeriales.value = value;
}


function verifyQuantity() {
    if (contadorSeriales.value != serialsArray.length) {
        soundWrong()
        setTimeout(() => {
            contadorWarning.classList.remove("animate__flipInX", "animate__animated")
            contadorWarning.classList.add("animate__flipOutX", "animate__animated")

        }, 1000);

        div_btn_procesar_seriales.classList.remove("animate__flipInX", "animate__animated")
        div_btn_procesar_seriales.classList.add("animate__flipOutX", "animate__animated")
        contadorWarning.classList.remove("animate__flipOutX", "animate__animated")
        contadorWarning.classList.add("animate__flipInX", "animate__animated")
    } else {
        soundOk()
        submitArray.focus()
        div_btn_procesar_seriales.classList.remove("animate__flipOutX", "animate__animated")
        div_btn_procesar_seriales.classList.add("animate__flipInX", "animate__animated")
    }
}




function submitSerials(e) {
    beginOF.innerHTML = 0
    endOF.innerHTML = serialsArray.length
    e.preventDefault()

    $('#modalStorage').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()

    $('#modalCantidad').modal('hide')
    $('#modalCountDown').modal({ backdrop: 'static', keyboard: false })

    let data = { "seriales": `${serialsArray}` };
    let interval = setInterval(verifyProcessBEx, 1000);
    axios({
        method: 'post',
        url: "/procesarSeriales",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {


            response = JSON.parse(result.data)

            if (response.error != "N/A") {
                tabla_consulta.innerHTML = ""
                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
            
                        let row = `
                                <tr class="bg-danger">
                                    <td>N/A</td>
                                    <td>${response.error}</td>
                                </tr>
                                `
                        newRow.classList.add("bg-danger", "text-white")
                        newRow.innerHTML = row;
                

                cantidadErrores.innerHTML = 1

                setTimeout(function () {
                    clearInterval(interval);
                    $('#modalCountDown').modal('hide')
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                }, 500);

            } else {
                soundOk()
                errorText.hidden = true
                tabla_consulta_container.hidden = false
                let arregloResultados = response.result
                let errors = 0

                arregloResultados.forEach(element => {
                    if (element.error != "N/A") {
                        errors++
                    }
                });

                if (errors != 0) {
                    tabla_consulta.innerHTML = ""
                    arregloResultados.forEach(element => {
                        let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                        if (element.error != "N/A") {
                            let row = `
                                <tr class="bg-danger">
                                    <td>${element.serial_num}</td>
                                    <td>${element.error}</td>
                                </tr>
                                `
                            newRow.classList.add("bg-danger", "text-white")
                            return newRow.innerHTML = row;
                        }


                    })
                    cantidadErrores.innerHTML = errors

                    setTimeout(function () {
                        clearInterval(interval);
                        $('#modalCountDown').modal('hide')
                        $('#modalError').modal({ backdrop: 'static', keyboard: false })
                    }, 500);

                } else {
                    clearInterval(interval);
                    $('#modalCountDown').modal('hide')
                    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
                }
            }
        })
        .catch((err) => {
            console.error(err);
        })
}


function verifyProcessBEx() {

    let data = { "seriales": `${serialsArray}` };
    axios({
        method: 'post',
        url: "/verifyProcessBEx",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then(result => {
            beginOF.innerHTML = result.data.COUNT
            endOF.innerHTML = serialsArray.length

        })
        .catch(err => {

            console.error(err);
        })
}