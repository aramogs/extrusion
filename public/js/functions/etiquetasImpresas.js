// $('#myModal').on('shown.bs.modal', function () {
//     $('#myInput').trigger('focus')
// })



let btnCerrar = document.querySelectorAll(".btnCerrar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let cardExcel = document.getElementById("cardExcel")
let table = $('#myTable').DataTable();
let midplan = document.getElementById("midplan")
let formEditar = document.getElementById("formEditar")
let formMotivo = document.getElementById("formMotivo")
let formMotivoPlan = document.getElementById("formMotivoPlan")
let selectFecha = document.getElementById("selectFecha")
let myDateString
let motivo = document.getElementById("motivo")
let motivoPlan = document.getElementById("motivoPlan")
let msap = document.getElementById("msap")
let mcantidad = document.getElementById("mcantidad")
let mfecha = document.getElementById("mfecha")
let midplane = document.getElementById("midplane")
let mesap = document.getElementById("mesap")
let mecantidad = document.getElementById("mecantidad")
let mefecha = document.getElementById("mefecha")
let edit_linea = document.getElementById("edit_linea")
let edit_cantidad = document.getElementById("edit_cantidad")
let add_sap = document.getElementById("add_sap")
let add_cantidad = document.getElementById("add_cantidad")
let add_linea = document.getElementById("add_linea")
let select_idPlan = document.getElementById("select_idPlan")
let msg_add_sap = document.getElementById("msg_add_sap")
let btn_save_agregar = document.getElementById("btn_save_agregar")
let btnCancelFull = document.getElementById("btnCancelFull")
let btnCancelarSeriales = document.getElementById("btnCancelarSeriales")
let checkInputsAll = document.querySelectorAll(".form-check-input")






btnCerrar.forEach(element => {
  element.addEventListener('click', clearAll)
});



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
    if (mm <= 9) mm = '0' + mm;
    myDateString = yy + '-' + mm + '-' + dd;
    input.value = myDateString

    btnCancelFull.disabled = false;
    btnCancelarSeriales.disabled = false;

    //btnCancelFull.disabled = true;
    table.clear().draw();
    fillTable();
  }
})



function fillTable() {

  let data = { "fecha": `${myDateString}` }
  axios({
    method: 'post',
    url: `/tablaSeriales`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  }).then((result) => {

    for (let y = 0; y < result.data.length; y++) {
      let cancelar
      if (result.data[y].status == "Impreso") {

        cancelar = `
                      <div class="form-check">
                      <input class="form-check-input" type="checkbox" value="${result.data[y].serial}" id="flexCheckDefault">
                      </div>
                      `
        acreditado = `<span class="icoSidebar fas fa-print text-info"></span>`

      } else if (result.data[y].status == "Cancelado") {
        cancelar = `<span class="icoSidebar fas fa-ban text-secondary"></span>`
        acreditado = `<span class="icoSidebar fas fa-ban text-secondary"></span>`
      } else if (result.data[y].status == "Acreditado") {

        cancelar = `<span class="icoSidebar fas fa-ban text-secondary"></span>`
        acreditado = `<span class="icoSidebar fas fa-check text-success"></span>`

      }

      table.row.add([
        cancelar,
        result.data[y].serial,
        result.data[y].plan_id,
        result.data[y].numero_parte,
        result.data[y].emp_num,
        result.data[y].cantidad,
        result.data[y].datetime,
        acreditado + " " + result.data[y].status,
        result.data[y].motivo_cancel,
      ]).draw(false);

    }



  })
    .catch((err) => { console.error(err) })
}


function cancel(clicked_id) {
  $('#modalMotivo').modal({ backdrop: 'static', keyboard: false })
  let id = clicked_id.split('-');
  let idp = id[id.length - 1];
  midplan.value = idp;

  infoId(idp, "cancel")

}

function edit(clicked_id) {
  $('#modalEditar').modal({ backdrop: 'static', keyboard: false })
  let id = clicked_id.split('-');
  let idp = id[id.length - 1];
  midplane.value = idp;

  infoId(idp, "edit")

}




function reload(tipo) {

  if(tipo=="selected"){
    motivo.value = "";
    $('#modalMotivo').modal('hide');
    table.clear().draw();
  
    setTimeout(function () { fillTable(); }, 100);

  }else{
    motivoPlan.value = "";

    for (i = select_idPlan.options.length-1; i >= 0; i--) {
      select_idPlan.options[i] = null;
    }

    $('#modalCancelFullId').modal('hide');
    table.clear().draw();
    setTimeout(function () { fillTable(); }, 100);
    

  }
 


}


function infoId(idp, modal) {

  let data = { "id": `${idp}` }
  axios({
    method: 'post',
    url: `/idplanInfo`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      if (modal == "cancel") {

        msap.innerHTML = result.data[0].numero_sap
        mcantidad.innerHTML = result.data[0].cantidad
        mfecha.innerHTML = result.data[0].fecha
      } else if (modal == "edit") {
        mesap.innerHTML = result.data[0].numero_sap
        mecantidad.innerHTML = result.data[0].cantidad
        mefecha.innerHTML = result.data[0].fecha
        edit_cantidad.value = result.data[0].cantidad
        edit_linea.value = result.data[0].linea

      }



    })
    .catch((err) => { console.error(err) })

}


formEditar.addEventListener("submit", (e) => {
  e.preventDefault();

  let data = { "id": `${midplane.value}`, "cantidad": `${edit_cantidad.value}`, "linea": `${edit_linea.value}` }

  axios({
    method: 'post',
    url: `/editarIdPlan`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      reload()

    })
    .catch((err) => { console.error(err) })

})

function modalMotivo() {

  let checkInputs = document.querySelectorAll(".form-check-input:checked")
  // checkInputs.forEach(input =>{console.log(input.value)})
  let myArray = Array.from(checkInputs)
  console.log(myArray);

  $('#modalMotivo').modal({ backdrop: 'static', keyboard: false })


}


function motivoIdPlan() {

  // checkInputs.forEach(input =>{console.log(input.value)})
  // let myArray = Array.from(checkInputs)
  // console.log(myArray);

  $('#modalCancelFullId').modal({ backdrop: 'static', keyboard: false })
  enableIdPlan()


}


formMotivo.addEventListener("submit", (e) => {
  e.preventDefault();

  let serialesInputs = document.querySelectorAll(".form-check-input:checked")
  let seriales = []
  serialesInputs.forEach(input => { seriales.push(input.value) })


  let data = { "seriales": `${seriales}`, "motivo": `${motivo.value}` }
  axios({
    method: 'post',
    url: `/cancelarSeriales`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      reload("selected")

    })
    .catch((err) => { console.error(err) })

})

function checkSap() {

  let data = { "sap": `${add_sap.value}` }

  axios({
    method: 'post',
    url: `/checkSap`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      if (result.data.length == 0) {

        msg_add_sap.innerHTML = ' Incorrecto';
        msg_add_sap.classList.remove('text-success');
        msg_add_sap.classList.add('text-danger');
        btn_save_agregar.disabled = true;

      } else {
        msg_add_sap.innerHTML = ' Correcto';
        msg_add_sap.classList.remove('text-danger');
        msg_add_sap.classList.add('text-success');
        btn_save_agregar.disabled = false;

      }


    })
    .catch((err) => { console.error(err) })

}


function enableIdPlan() {
  select_idPlan.disabled = false
  let data = { "fecha": `${myDateString}` }

  axios({
    method: 'post',
    url: `/getIdPlans`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  }).then((response) => {

    plans = response.data.ids

    option = document.createElement('option')
    option.text = "Seleccionar"
    select_idPlan.add(option)
    plans.forEach(element => {
      turno = element.plan_id
      option = document.createElement('option')
      option.text = turno
      select_idPlan.add(option)
    });
  })
}


formMotivoPlan.addEventListener("submit", (e) => {
  e.preventDefault();


  let data = { "id": `${select_idPlan.value}`, "motivo": `${motivoPlan.value}` }
  console.log(data)
  axios({
    method: 'post',
    url: `/cancelarSerialesPlan`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      reload("all")

    })
    .catch((err) => { console.error(err) })

})


function clearAll() {

  motivo.value=""
  motivoPlan.value=""

  for (i = select_idPlan.options.length-1; i >= 0; i--) {
    select_idPlan.options[i] = null;
  }



    
}