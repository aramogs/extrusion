$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})

let excelFile = document.getElementById("excelFile")
let btnBorrarContinuar = document.getElementById("btnBorrarContinuar")
let btnCancelar = document.querySelectorAll(".btnCancelar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let formData = new FormData()
let selectTurno = document.getElementById("selectTurno")
let cardExcel = document.getElementById("cardExcel")


btnCancelar.forEach(element => {
    element.addEventListener('click', deleteFile)
});



document.getElementById("excelFile").addEventListener("change", () => {
    if (document.getElementById("excelFile").files.length == 0) {
        document.getElementById("btn_excel").disabled = true;
        document.getElementById("btn_excel").classList.remove("animate__flipInX")
        document.getElementById("btn_excel").classList.add("animate__flipOutX")
    } else {
        document.getElementById("btn_excel").disabled = false;
        document.getElementById("btn_excel").classList.remove("animate__flipOutX")
        document.getElementById("btn_excel").classList.add("animate__flipInX")
    }
});

selectTurno.addEventListener("change", ()=>{
    cardExcel.hidden = false
    cardExcel.classList.add("animate__animated","animate__backInUp")

})


const picker = datepicker('#selectFecha', {
    customDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    overlayPlaceholder: 'Seleccionar Mes',
    customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    disabled: true,
    minDate: new Date(2020, 0, 1),
    formatter: (input, date, instance) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yy = date.getFullYear();
        let myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString
        enableTurno()
    }
})

function enableTurno(){
    selectTurno.disabled = false
    axios({
        method: 'get',
        url: `/getTurnos`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    }).then((response)=>{
        
        turnos = response.data
        selectTurno.innerHTML = ""
        option = document.createElement('option')
        option.text = "Seleccionar"
        selectTurno.add(option)
        turnos.forEach(element => {
            turno = element.turno_descripcion
            option = document.createElement('option')
            option.text = turno
            selectTurno.add(option)
        });
    })
}

function sendData() {
    $('#myModal3').modal({ backdrop: 'static', keyboard: false })
    formData.delete('excelFile')
    formData.append('excelFile', excelFile.files[0])
    axios({
        method: 'post',
        url: `/verificarSAP/${excelFile.files[0].name}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((response) => {
            console.log(response);

        })
        .catch((err) => { console.error(err) });
}

function deleteInsert_Excel(file_name) {
    $('#myModal3').modal({ backdrop: 'static', keyboard: false })
    $('#myModal').modal('hide');
    axios({
        method: 'post',
        url: `/deleteInsert_excel/${file_name}/${excelFile.files[0].name}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((result) => {
            if (result.data.affectedRows) {
                setTimeout(() => { $('#myModal3').modal('hide') }, 500);
                $('#myModal2').modal('show');
                tituloSuccess.innerHTML = `Programacion reemplazada con existo `
                cantidadSuccess.innerHTML = `Se afectaron <span class="text-warning" style="font">${result.data.affectedRows}</span> filas`
            } else {
                setTimeout(() => { $('#myModal3').modal('hide') }, 500);
                $('#myModal2').modal('show');
                tituloSuccess.innerHTML = `<h2><span class=""></span>Atencion problema al cargar</h2> `
                cantidadSuccess.innerHTML = `<span class="text-danger fas fa-exclamation-triangle" style="font">Error: ${result.data.sqlMessage}</span><br><span class="text-dark">Este proceso elimina la programacion seleccionada, verificar los archivos cargados con anterioridad</span>`
            }

        })
        .catch((err) => { console.error(err) })
}

function insert_Excel() {
    $('#myModal3').modal({ backdrop: 'static', keyboard: false })
    axios({
        method: 'post',
        url: `/insertar_excel/${excelFile.files[0].name}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json', }
    })
        .then((result) => {
            setTimeout(() => { $('#myModal3').modal('hide') }, 500);
            $('#myModal').modal('hide');
            $('#myModal2').modal('show');
            tituloSuccess.innerHTML = `Programacion Cargada con existo se insertaron <span class="text-success">${result.data.affectedRows}</span> filas`
        })
        .catch((err) => { console.error(err) })
}

function deleteFile() {
    excelFile.value = ""
    document.getElementById("btn_excel").disabled = true;
    document.getElementById("btn_excel").classList.remove("animate__flipInX")
    document.getElementById("btn_excel").classList.add("animate__flipOutX")
}