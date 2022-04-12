
let part_num = document.getElementById("part_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let alerta_prefijo2 = document.getElementById("alerta_prefijo2")
let material = ""
let btnCerrar = document.querySelectorAll(".btnCerrar")
let verifySerial = document.getElementById("verifySerial")
let submit_Serial = document.getElementById("submit_Serial")
let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];
let line


$(document).ready(function () {
    part_num.focus()
});

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)


});


submitPartNumber.addEventListener("submit", (e) => {
    e.preventDefault()

    let material= part_num.value

    let lineaIndex=material.lastIndexOf("L")
    let linea = material.substring(lineaIndex + 1);
    line= linea

        if ((material.charAt(0) === "P" || material.charAt(0) === "p") && lineaIndex > -1) {
            if ((material.substring(1)).length > `5`) {
                soundOk()
         
                $('#modalSerial').modal({ backdrop: 'static', keyboard: false })
    
                setTimeout(() => {
                    verifySerial.focus()
                }, 500);
            }
            else{
                part_num.value=""
                alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
                alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
                setTimeout(() => {
                    alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
                    alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
                }, 2000);
            }
        } else {
            part_num.value=""
            value = true

            alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
            setTimeout(() => {
                alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
                alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
            }, 2000);
    
        }

})

function cleanInput() {
    part_num.disabled = false
    part_num.value = ""
    value = false
    verifySerial.value=""

    setTimeout(() => {
        part_num.focus()
    }, 500);
}

submit_Serial.addEventListener("submit", (e) => {
    e.preventDefault()
    let serial= verifySerial.value

    if (serial.charAt(0) === "S" || serial.charAt(0) === "s") {
        consultarMaterial()
    }else{
        verifySerial.value=""
        alerta_prefijo2.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo2.classList.add("animate__flipInX", "animate__animated")
        setTimeout(() => {
            alerta_prefijo2.classList.remove("animate__flipInX", "animate__animated")
            alerta_prefijo2.classList.add("animate__flipOutX", "animate__animated")
        }, 2000);
    }


})

function consultarMaterial() {

    setTimeout(() => { $('#modalSerial').modal('hide') }, 500);
    $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
    part_num.disabled = true
    let material_ = part_num.value.substring(1, part_num.value.lastIndexOf('L'));
    let serial_= verifySerial.value.substring(1)

    let data = { "process": "verify_rubber", "material": `${material_}`, "serial": `${serial_}`,"linea": `${line}` };
    axios({
        method: 'post',
        url: "/verificarHule",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    })
        .then((result) => {


            response = JSON.parse(result.data)
            soundOk()

            let errors = 0
            let arregloResultados=[]
            if (response.error != "N/A") {
                arregloResultados.push(response.error)
                errors++
            }

            if (errors != 0) {
                tabla_consulta.innerHTML = ""
                arregloResultados.forEach(element => {
                    let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                    if (element.error != "N/A") {
                        let row = `
                                <tr class="bg-danger">
                                    <td>${element}</td>
                                </tr>
                                `
                        newRow.classList.add("bg-danger", "text-white")
                        return newRow.innerHTML = row;
                    }


                })
              
                setTimeout(function () { 

                    $('#modalSpinner').modal('hide')
                    $('#modalError').modal({ backdrop: 'static', keyboard: false })
                 }, 500);
              
            } else {

                $('#modalSpinner').modal('hide')
                transferSuccess.innerHTML="Transfer Order Created: "+response.result
                $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
            }

        })
        .catch((err) => { console.error(err) })



}





