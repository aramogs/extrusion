let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo_confirm = document.getElementById("alerta_prefijo_confirm")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let submitSerial = document.getElementById("submitSerial")
let currentST = document.getElementById("currentST")

//let btn_transferFG = document.getElementById("btn_transferFG")
let contadorWarning = document.getElementById("contadorWarning")
let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let btnCerrar_Success = document.getElementById("btnCerrar_Success")
let btnCerrar_Error = document.getElementById("btnCerrar_Error")
let cantidadErrores = document.getElementById("cantidadErrores")
let errorText = document.getElementById("errorText")
let errorTextField = document.getElementById("errorTextField")
let tabla_consulta_container = document.getElementById("tabla_consulta_container")
let submitArray_form = document.getElementById("submitArray_form")
let confirmSerial_form = document.getElementById("confirmSerial_form")
let serialsArray = []
let numero_parte = ""
let modalStorage = document.getElementById("modalStorage")
let meplan = document.getElementById("meplan")
let mesap = document.getElementById("mesap")
let mecantidad = document.getElementById("mecantidad")
let mefecha = document.getElementById("mefecha")
let return_cantidad = document.getElementById("return_cantidad")

let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let confirmSerial = document.getElementById("confirmSerial")
let btnModalTerminar = document.getElementById("btnModalTerminar")
let user_id = document.getElementById("user_id")

let maSAP = document.getElementById("maSAP")
let maDesc = document.getElementById("maDesc")
let maMand = document.getElementById("maMand")
let maFam = document.getElementById("maFam")
let return_cantidadM = document.getElementById("return_cantidadM")
let submitMaterial_form = document.getElementById("submitMaterial_form")

serial_num.focus()
btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

submitSerial.addEventListener("submit", listAdd)

//btn_transferFG.addEventListener("click", () => { $('#modalCantidad').modal({ backdrop: 'static', keyboard: false }) })

submitArray_form.addEventListener("submit", submitSerials)

confirmSerial_form.addEventListener("submit", confirmSerialFunc)

btnCerrar_Success.addEventListener("click", cleanInput())

btnCerrar_Error.addEventListener("click", cleanInput())


return_cantidad.addEventListener("keyup", checkCantidad)

submitMaterial_form.addEventListener("submit", submitMaterial)


function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    confirmSerial.value = ""
    return_cantidad.value = ""
    return_cantidadM.value = ""
    serialsArray = []
    numero_parte = ""
    serial_num.focus()

}

function listAdd(e) {
    e.preventDefault()

    serial = serial_num.value;
    const regex = /.*[a-zA-Z].*/;

    if (serial.charAt(0) === "P" || serial.charAt(0) === "p" && (serial.substring(1)).length > 11) {
        soundOk()
        material = (serial_num.value).substring(1)
        consultarMaterial();
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

function submitSerials(e) {

    e.preventDefault()


    $('#modalEditar').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()

    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    let data = {
        "serial_num": `${(serial_num.value).substring(1)}`,"plan_id": `${meplan.innerHTML}`, "cantidad": `${return_cantidad.value}`,
        "no_sap": `${mesap.innerHTML}`, "contenedor": `manual`, "capacidad": `${return_cantidad.value}`, "linea": `200`, "tipo": `EXT_RE`, "impresoType": `Impreso_re`
        , "etiquetas": `1`
    };
    axios({
        method: 'post',
        url: "/impresionEtiquetaRetorno",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {
            
            response = JSON.parse(result.data)
            if (response.error !== "N/A") {
                
                tabla_consulta.innerHTML = ""

                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                let row = `
                                <tr class="bg-danger">
                                    <td>N/A</td>
                                    <td>${response.error}</td>
                                </tr>
                                `
                newRow.innerHTML = row
                newRow.classList.add("bg-danger", "text-white")

                cantidadErrores.innerHTML = "1"

                $('#modalSpinner').modal('hide')
                setTimeout(function () {
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                }, 500);

            }else{
                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                }, 1000);
                setTimeout(function () {
                    $('#modalSerialSuccess').modal({ backdrop: 'static', keyboard: false })
                    tituloSuccess.innerHTML = `<h2><span class="badge badge-info"><pan class="fas fa-barcode"></span></span> Confirmar Serial:</h2>`
                    cantidadSuccess.innerHTML = `${response.serial}`
                    setTimeout(function() { confirmSerial.focus() }, 500);
                    
                }, 500);
    
                return_cantidad.value = ""
            }
            
        })
        .catch((err) => {
            console.error(err);
        })
}

function submitMaterial(e) {

    e.preventDefault()


    $('#modalMaterial').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()

    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    let data = {
        "plan_id": "0", "cantidad": `${return_cantidadM.value}`,
        "no_sap": `${maSAP.innerHTML}`, "contenedor": `manual`, "capacidad": `${return_cantidadM.value}`, "linea": `200`, "tipo": `EXT_RE`, "impresoType": `Impreso_re`
        , "etiquetas": `1`
    };
    axios({
        method: 'post',
        url: "/impresionEtiquetaRetorno",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {

            response = result.data
            
            if (response.key) {
                tabla_consulta.innerHTML = ""
                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                let row = `
                                <tr class="bg-danger">
                                    <td>N/A</td>
                                    <td>${response.key}</td>
                                </tr>
                                `
                newRow.innerHTML = row
                newRow.classList.add("bg-danger", "text-white")
                cantidadErrores.innerHTML = "1"
                
                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                }, 500);

            }else{
                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                }, 1000);
                setTimeout(function () {
                    $('#modalSerialSuccess').modal({ backdrop: 'static', keyboard: false })
                    tituloSuccess.innerHTML = `<h2><span class="badge badge-info"><pan class="fas fa-barcode"></span></span> Confirmar Serial:</h2>`
                    cantidadSuccess.innerHTML = `${parseInt(response.NLENR)}`
                    confirmSerial.focus()
                }, 1200);
    
                return_cantidad.value = ""
            }



        })
        .catch((err) => {
            console.error(err);
        })
}

function consultarMaterial() {

    let data = { "material": `${material}` };
    axios({
        method: 'post',
        url: "/getAllInfoMaterial",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {
            response = result.data
            if (response.length !== 0) {

                $('#modalMaterial').modal({ backdrop: 'static', keyboard: false })
                maSAP.innerHTML = response[0].no_sap
                maDesc.innerHTML = response[0].description
                maMand.innerHTML = response[0].cust_part
                maFam.innerHTML = response[0].family

            } else {
                //errorMessage(response.error)
                tabla_consulta.innerHTML = ""

                let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);

                let row = `
                                <tr class="bg-danger">
                                    <td>N/A</td>
                                    <td>Material no encontrado</td>
                                </tr>
                                `
                newRow.innerHTML = row
                newRow.classList.add("bg-danger", "text-white")

                cantidadErrores.innerHTML = "1"

                $('#modalSpinner').modal('hide')
                setTimeout(function () {
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                }, 500);

            }
            materialArray = []

        })
        .catch((err) => {
            console.error(err);
        })
}

function errorMessage(message) {

    soundWrong()
    alerta_prefijo.innerHTML = "Error: " + message
    alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
    alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
    serial_num.value = ""

    setTimeout(() => {
        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
    }, 2000);

}

function checkCantidad() {

    let cantBefore = parseInt(mecantidad.innerHTML)
    let cantNew = parseInt(return_cantidad.value)

    if (cantNew <= cantBefore) {
        btnCancel_e.disabled = false
    } else {
        btnCancel_e.disabled = true
    }


}

function confirmSerialFunc(e) {

    e.preventDefault()

    if (confirmSerial.value.substring(1) == cantidadSuccess.innerHTML) {
        soundOk()

        $('#modalSerialSuccess').modal('hide')
        setTimeout(function () {
            $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
        }, 500);

        let data = { "serial": `${confirmSerial.value.substring(1)}`, "user": `${user_id.innerHTML}`, "serial_obsoleto": `${serial_num.value}` };
        axios({
            method: 'post',
            url: "/confirmacionPR",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                cleanInput()
                setTimeout(function () {
                    $('#modalSpinner').modal('hide')
                }, 1000);

            })
            .catch((err) => {
                console.error(err);
            })

    } else {
        soundWrong()
        alerta_prefijo_confirm.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo_confirm.classList.add("animate__flipInX", "animate__animated")


        setTimeout(() => {
            alerta_prefijo_confirm.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo_confirm.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
        confirmSerial.value = ""

    }

}

function cancelSerial() {

    let data = { "seriales": `${cantidadSuccess.innerHTML}`, "motivo": `Retorno Cancelado`, "tipo": `retorno`, "user": `${user_id.innerHTML}` };
    axios({
        method: 'post',
        url: "/transferenciaRP",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {

            cleanInput()

        })
        .catch((err) => {
            console.error(err);
        })
}


