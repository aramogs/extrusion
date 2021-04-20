// $('#myModal').on('shown.bs.modal', function () {
//     $('#myInput').trigger('focus')
// })



let btnCancelar = document.querySelectorAll(".btnCancelar")
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let cargasAnteriores = document.getElementById("cargasAnteriores")
let btnGuardar = document.getElementById("btnGuardar")
let cardExcel = document.getElementById("cardExcel")
let table = $('#myTable').DataTable();
let midplan = document.getElementById("midplan")
let formMotivo = document.getElementById("formMotivo")
let formEditar = document.getElementById("formEditar")
let formAgregar = document.getElementById("formAgregar")
let selectFecha= document.getElementById("selectFecha")
let myDateString
let motivo= document.getElementById("motivo")
let msap= document.getElementById("msap")
let mcantidad= document.getElementById("mcantidad")
let mfecha= document.getElementById("mfecha")
let midplane = document.getElementById("midplane")
let mesap= document.getElementById("mesap")
let mecantidad= document.getElementById("mecantidad")
let mefecha= document.getElementById("mefecha")
let edit_linea= document.getElementById("edit_linea")
let edit_cantidad= document.getElementById("edit_cantidad")
let add_sap= document.getElementById("add_sap")
let add_cantidad= document.getElementById("add_cantidad")
let add_linea= document.getElementById("add_linea")
let add_turno= document.getElementById("add_turno")
let btnAgregar= document.getElementById("btnAgregar")



btnCancelar.forEach(element => {
    element.addEventListener('click', deleteFile)
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
        myDateString = yy + '-' + mm + '-' + dd;
        input.value = myDateString

        btnAgregar.disabled=false;
        table.clear().draw();
        fillTable();
    }
})



function fillTable() {
   
    let data = {"fecha":`${myDateString}`}
    axios({
        method: 'post',
        url: `/tablaProgramacion`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    }).then((result)=>{ 
            
           
                for (let y = 0; y < result.data.length; y++) {
                    let cancelar
                    if (result.data[y].status=="Pendiente") {

                        cancelar= `<input type="text" name="idPlan" id="idPlan${result.data[y].plan_id}" value=${result.data[y].plan_id} hidden><button type="submit" formaction="/cancelar"
                        class="btn btn-danger  rounded-pill" name="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="cancel(this.id)" ><span class="fas fa-times"></span>
                        <button type="submit" formaction="/actualizar" class="btn btn-info  rounded-pill"
                                        nname="btnCancel" id="btnCancel-${result.data[y].plan_id}" onClick="edit(this.id)"><span class="fas fa-pencil-alt">` 

                    }else{cancelar=""}
                   

                    table.row.add( [
                        cancelar,
                        result.data[y].plan_id,
                        result.data[y].numero_sap,
                        result.data[y].cantidad,
                        result.data[y].linea,
                        result.data[y].sup_name,
                        result.data[y].fecha,
                        result.data[y].turno,
                        result.data[y].status,
                        result.data[y].description,
                    ] ).draw( false );

            }
        })
        .catch((err) => { console.error(err) })
}


function cancel(clicked_id)
  {
    $('#modalMotivo').modal({ keyboard: false })
    let id = clicked_id.split('-');
    let idp = id[id.length - 1];
    midplan.value=idp;

    infoId(idp, "cancel")
    
  }

  function edit(clicked_id)
  {
    $('#modalEditar').modal({ keyboard: false })
    let id = clicked_id.split('-');
    let idp = id[id.length - 1];
    midplane.value=idp;

    infoId(idp, "edit")
    
  }

  formMotivo.addEventListener("submit", (e)=>{
      e.preventDefault();

      let data = {"id":`${midplan.value}`, "motivo":`${motivo.value}`}

      axios({
        method: 'post',
        url: `/cancelarIdPlan`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

      reload("cancel")
        
    })
    .catch((err) => { console.error(err) })

  })


  function reload(modal){
    if(modal=="cancel"){
      motivo.value="";
      $('#modalMotivo').modal('hide');
      table.clear().draw();
      fillTable();
    }else if(modal=="edit"){
      edit_cantidad.value="";
      edit_linea.value="";
      $('#modalEditar').modal('hide');
      table.clear().draw();
      fillTable();

    }else if(modal=="add"){
      $('#modalAgregar').modal('hide');
      table.clear().draw();
      fillTable();
    }
    

  }


  function infoId(idp, modal){

    let data = {"id":`${idp}`}
    axios({
        method: 'post',
        url: `/idplanInfo`,
        data: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then((result) => {

      if(modal=="cancel"){

        msap.innerHTML=result.data[0].numero_sap
        mcantidad.innerHTML=result.data[0].cantidad
        mfecha.innerHTML=result.data[0].fecha
      } else if(modal=="edit"){
        mesap.innerHTML=result.data[0].numero_sap
        mecantidad.innerHTML=result.data[0].cantidad
        mefecha.innerHTML=result.data[0].fecha
        edit_cantidad.value=result.data[0].cantidad
        edit_linea.value=result.data[0].linea

      }

        
        
    })
    .catch((err) => { console.error(err) })

  }


  formEditar.addEventListener("submit", (e)=>{
    e.preventDefault();

    let data = {"id":`${midplane.value}`, "cantidad":`${edit_cantidad.value}`, "linea":`${edit_linea.value}`}

    axios({
      method: 'post',
      url: `/editarIdPlan`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
  })
  .then((result) => {

    reload("edit")
      
  })
  .catch((err) => { console.error(err) })

})

function agregar()
  {
    $('#modalAgregar').modal({ keyboard: false })
    
  }


  formAgregar.addEventListener("submit", (e)=>{
    e.preventDefault();

    let data = {"sap":`${add_sap.value}`, "cantidad":`${add_cantidad.value}`, "linea":`${add_linea.value}`, "fecha":`${selectFecha.value}`, "turno":`${add_turno.value}`}

    axios({
      method: 'post',
      url: `/agregarIdPlan`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
  })
  .then((result) => {

    reload("add")
      
  })
  .catch((err) => { console.error(err) })

})

function checkSap()
  {

    let data = {"sap":`${add_sap.value}`}

    axios({
      method: 'post',
      url: `/checkSap`,
      data: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
  })
  .then((result) => {

    console.log(result);
      
  })
  .catch((err) => { console.error(err) })
    
  }

