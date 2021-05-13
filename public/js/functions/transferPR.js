

let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo_confirm = document.getElementById("alerta_prefijo_confirm")
let btnCerrar = document.querySelectorAll(".btnCerrar")
let submitSerial = document.getElementById("submitSerial")
let currentST = document.getElementById("currentST")
let submitArray = document.getElementById("submitArray")
//let btn_transferFG = document.getElementById("btn_transferFG")
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
let confirmSerial_form = document.getElementById("confirmSerial_form")
let serialsArray = []
let modalStorage = document.getElementById("modalStorage")
let meplan= document.getElementById("meplan")
let mesap= document.getElementById("mesap")
let mecantidad= document.getElementById("mecantidad")
let mefecha= document.getElementById("mefecha")
let return_cantidad= document.getElementById("return_cantidad")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let confirmSerial = document.getElementById("confirmSerial")
let btnModalTerminar = document.getElementById("btnModalTerminar")
let user_id = document.getElementById("user_id")


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

btn_verificar_cantidad.addEventListener("click", verifyQuantity)

return_cantidad.addEventListener("keyup", checkCantidad)




function cleanInput() {
    // $('#modalError').modal('hide')
    // $('#modalSuccess').modal('hide')
    serial_num.disabled = false
    serial_num.value = ""
    submitArray.value = ""
    confirmSerial.value= ""
    return_cantidad.value=""
    

    //currentST.innerHTML = ""
    serialsArray = []
    contadorSeriales.value = 0
    div_btn_procesar_seriales.classList.remove("animate__flipInX", "animate__animated")
    div_btn_procesar_seriales.classList.add("animate__flipOutX", "animate__animated")
    //btn_transferFG.disabled = true
    //btn_transferFG.classList.remove("btn-warning")
    //btn_transferFG.classList.add("btn-secondary")

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

        consultarSerial();


        // alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        // alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")

        // let serial = `<small style="display:inline; "><span class="badge badge-light text-dark"> ${(serial_num.value).substring(1)} </span></small> `
        // let append = document.createElement("span")
        // append.innerHTML = serial
        // currentST.appendChild(append)
        // serial_num.value = ""

        // //btn_transferFG.disabled = false
        // //btn_transferFG.classList.remove("btn-secondary")
        // //btn_transferFG.classList.add("btn-warning")


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

    e.preventDefault()


    $('#modalEditar').modal('hide')
    setTimeout(() => {
        soundOk()
    }, 150);
    soundOk()

    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })

    let data = { "plan_id": `${meplan.innerHTML}`,"cantidad": `${return_cantidad.value}`,
    "no_sap": `${mesap.innerHTML}`,"contenedor": `manual`,"capacidad": `${return_cantidad.value}`,"linea": `200`,"tipo": `EXT_RE`  };
    axios({
        method: 'post',
        url: "/impresionEtiqueta",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {

            response= result.data
            setTimeout(function () { 
                $('#modalSpinner').modal('hide')
            }, 1000);
            setTimeout(function () { 
            $('#modalSerialSuccess').modal({ backdrop: 'static', keyboard: false })
            tituloSuccess.innerHTML = `<h2><span class="badge badge-info"><pan class="fas fa-barcode"></span></span> Confirmar Serial:</h2>`
            cantidadSuccess.innerHTML = `${response.last_id}`
            confirmSerial.focus()
            }, 1200);
            
            return_cantidad.value=""


        })
        .catch((err) => {
            console.error(err);
        })
}



function consultarSerial() {

    let data = { "serial": `${serialsArray}` };
    axios({
        method: 'post',
        url: "/getAllInfoSerial",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then((result) => {

            response=result.data[0]
            console.log(response);
            if (response.error == undefined) {

             
                    $('#modalEditar').modal({ backdrop: 'static', keyboard: false })
                    meplan.innerHTML=response.plan_id
                    mesap.innerHTML=response.numero_parte
                    mecantidad.innerHTML=response.cantidad
                    mefecha.innerHTML=response.datetime

                
            } else {
                errorMessage(response.error)
            }
            serialsArray = []
            //serial_num.value=""

        })
        .catch((err) => {
            console.error(err);
        })
}


function errorMessage(message){

    soundWrong()
    alerta_prefijo.innerHTML="Error: "+message
    alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
    alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
    serial_num.value = ""

    setTimeout(() => {
        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
    }, 2000);

}

function checkCantidad() {

    let cantBefore= parseInt(mecantidad.innerHTML)
    let cantNew= parseInt(return_cantidad.value)

    if(cantNew<cantBefore){
        btnCancel_e.disabled=false
    }else{
        btnCancel_e.disabled=true
    }

    
}


function confirmSerialFunc(e) {

    e.preventDefault()

    if(confirmSerial.value.substring(1)==cantidadSuccess.innerHTML){
        $('#modalSerialSuccess').hide()
        soundOk()
    
        $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    
        let data = { "serial": `${confirmSerial.value.substring(1)}`, "user": `${user_id.innerHTML}`, "serial_obsoleto": `${serial_num.value.substring(1)}` };
        axios({
            method: 'post',
            url: "/transferenciaPR",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
    
        })
            .then((result) => {
    
                response = JSON.parse(result.data)
    
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
                                        <td>${element.serial}</td>
                                        <td>${element.error}</td>
                                    </tr>
                                    `
                            newRow.classList.add("bg-danger", "text-white")
                            return newRow.innerHTML = row;
                        }
    
    
                    })
                    cantidadErrores.innerHTML = errors

                        $('#modalSpinner').modal('hide')
                        $('#modalError').modal({ backdrop: 'static', keyboard: false })

                     
                  
                } else {
                    $('#modalSpinner').modal('hide')
                    $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
                }

            })
            .catch((err) => {
                console.error(err);
            })

    }else{
        soundWrong()
        alerta_prefijo_confirm.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo_confirm.classList.add("animate__flipInX", "animate__animated")


        setTimeout(() => {
            alerta_prefijo_confirm.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo_confirm.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
        confirmSerial.value=""

    }

}

function cancelSerial() {

    let data = { "seriales": `${cantidadSuccess.innerHTML}`,"motivo": `Retorno Cancelado`,"tipo": `retorno`,"user": `${user_id.innerHTML}` };
    axios({
        method: 'post',
        url: "/cancelarSeriales",
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


