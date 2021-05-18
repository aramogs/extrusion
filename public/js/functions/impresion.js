let btn_logoff = document.getElementById("btn_logoff")
let currentFecha = document.getElementById("currentFecha")
let currentTurno = document.getElementById("currentTurno")
let clock = document.getElementById("clock")
let selectedLinea = document.getElementById("selectedLinea")
let myDateString
let table = $('#myTable').DataTable();
let modalImpresion = document.getElementById("modalImpresion")
let msap = document.querySelectorAll(".msap")
let mcantidad = document.querySelectorAll(".mcantidad")
let mfecha = document.querySelectorAll(".mfecha")
let midplan = document.querySelectorAll(".midplan")
let mimpreso = document.querySelectorAll(".mimpreso")
let cotenedorSection = document.getElementById("cotenedorSection")
let btnCerrar = document.getElementsByClassName("btnCerrar")
let regex1 = /\-(.*)/
let regex2 = /^(.*?)\-/
let tituloSuccess = document.getElementById("tituloSuccess")
let cantidadSuccess = document.getElementById("cantidadSuccess")
let btnModalTerminar = document.getElementById("btnModalTerminar")
let cantidadManual = document.getElementById("cantidadManual")
let btnImprimirManual = document.getElementById("btnImprimirManual")
let etiquetas_impresas = 0
let piezas_totales = 0
let etiquetas_requeridas = 0

btn_logoff.addEventListener("click", () => { document.cookie = "accessToken" + '=; Max-Age=0', window.location.replace(window.location.origin + "/login/Impresion") })
selectedLinea.addEventListener("change", () => { getSelectedTurno() })
btnCerrar[0].addEventListener("click", () => { clear() })
btnModalTerminar.addEventListener("click", () => { refreshTable() })
cantidadManual.addEventListener("keyup", () => { verifyCant() })
btnImprimirManual.addEventListener("click", (e) => { impresion(e), e.preventDefault() })


function currentTime() {

  date = new Date();
  let mm = date.getMonth() + 1;
  let dd = date.getDate()
  let yy = date.getFullYear()
  myDateString = yy + '-' + mm + '-' + dd

  hour = date.getHours()
  min = date.getMinutes()
  sec = date.getSeconds()
  hour = updateTime(hour)
  min = updateTime(min)
  sec = updateTime(sec)
  clock.value = hour + " : " + min + " : " + sec
  currentFecha.value = myDateString
  // currentTurno.value="T2"
  t = setTimeout(function () { currentTime() }, 1000)
}

function updateTime(k) {
  if (k < 10) {
    return "0" + k
  }
  else {
    return k
  }
}

currentTime()


function getSelectedTurno() {
  reload()
  let data = { "linea": `${selectedLinea.value}`, "fecha": `${myDateString}`, "turno": `${currentTurno.value}` }
  axios({
    method: 'post',
    url: `/getCurrentProgramacion`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      for (let y = 0; y < result.data.length; y++) {
        let iteracion = result.data[y]
        let condicion = iteracion.cantidad - iteracion.impreso


        let imprimir
        if (result.data[y].status !== "Cancelado") {

          if (condicion >= iteracion.std_pack && iteracion.std_pack > 0 || condicion >= iteracion.std_pack_b && iteracion.std_pack_b > 0 || condicion >= iteracion.std_pack_c && iteracion.std_pack_c > 0 || condicion >= iteracion.std_pack_d && iteracion.std_pack_d > 0 || condicion >= iteracion.std_pack_e && iteracion.std_pack_e > 0) {
            imprimir =
              `
                <button type="submit"  class="btn btn-info btn-block  rounded-pill" name="btnPrint" id="${result.data[y].plan_id}" onClick="ImprimirModal(this.id)" ><span class="fas fa-print"><span hidden>${result.data[y].plan_id}</span></span>
                `

          } else {
            imprimir =
              `
            <button type="button" class="btn btn-info  rounded-pill " disabled><span class="fas fa-check-square" disabled><span hidden>${result.data[y].plan_id}</span></span>
            <button type="button" class="btn btn-warning  rounded-pill "  id="${result.data[y].plan_id}" onClick="ImprimirManual(this.id)" ><span class="fas fa-print" disabled><span hidden>${result.data[y].plan_id}</span></span>
            ` }



        } else if (result.data[y].status == "Cancelado") {
          imprimir =
            `
            <button type="button" class="btn btn-secondary  rounded-pill btn-block" disabled><span class="fas fa-print" disabled><span hidden>${result.data[y].plan_id}</span></span>
            `
        } else {
          imprimir =
            `
            <button type="button" class="btn btn-info  rounded-pill " disabled><span class="fas fa-check-square" disabled><span hidden>${result.data[y].plan_id}</span></span>
            <button type="button" class="btn btn-warning  rounded-pill "  id="${result.data[y].plan_id}" onClick="ImprimirManual(this.id)" ><span class="fas fa-print" disabled><span hidden>${result.data[y].plan_id}</span></span>
            ` }



        table.row.add([
          imprimir,
          result.data[y].no_sap,
          result.data[y].description,
          result.data[y].cust_part,
          result.data[y].family,
          result.data[y].length,
          result.data[y].cantidad,
          result.data[y].impreso === null ? '0' : result.data[y].impreso,
          Math.sign(result.data[y].cantidad - result.data[y].impreso) == -1 ? `+${Math.abs(result.data[y].cantidad - result.data[y].impreso)}` : result.data[y].cantidad - result.data[y].impreso,
          result.data[y].sup_name,
          result.data[y].status

        ]).draw(false);

      }
    })

}


function reload() {
  table.clear().draw();

}

function ImprimirModal(idp) {

  cantidadManual.value = ""
  let data = { "id": `${idp}` }
  axios({
    method: 'post',
    url: `/idplanImpresion`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      let currentInfo = result.data[0]
      etiquetas_impresas = 0
      etiquetas_impresas = result.data[1][0].impreso
      if (etiquetas_impresas == null) etiquetas_impresas = 0
      currentInfo.forEach((obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key.includes("std_pack") && value > 0) {

            addCard(key, value, currentInfo[0].cantidad)
          }

        });
      });



      $('#modalImpresion').modal({ backdrop: 'static', keyboard: false })
      msap.forEach(element => { element.innerHTML = currentInfo[0].numero_sap })
      mcantidad.forEach(element => { element.innerHTML = currentInfo[0].cantidad })
      mfecha.forEach(element => { element.innerHTML = currentInfo[0].fecha })
      midplan.forEach(element => { element.innerHTML = idp })
      mimpreso.forEach(element =>{element.innerHTML = etiquetas_impresas})
      let btnImprimir = document.querySelectorAll(".btnImprimir")
      let inputImprimir = document.querySelectorAll(".inputImprimir")

      btnImprimir.forEach(btn => {

        btn.addEventListener("click", (e) => {
          e.preventDefault()
          impresion(e)
        })
      })

      inputImprimir.forEach(input => {
        // input.addEventListener("click",(e)=>{PiezasTotales(e)})
        input.addEventListener("keyup", (e) => { PiezasTotales(e) })

        function PiezasTotales(e) {

          e.preventDefault()
          if (parseInt(e.target.value) > 0) {
            e.target.nextElementSibling.disabled = false
            e.target.nextElementSibling.classList.remove('animate__flipOutX');
            e.target.nextElementSibling.classList.add('animate__flipInX');

            let capacidad_contenedor = parseInt((e.target.parentNode.parentNode.firstElementChild.innerHTML).replace("Capacidad:", ""))
            etiquetas_requeridas = parseInt(e.target.value)
            piezas_totales = capacidad_contenedor * etiquetas_requeridas

            if (piezas_totales + etiquetas_impresas > parseInt(mcantidad[0].innerHTML)) {
              e.target.nextElementSibling.disabled = true
              // e.target.value= piezas_totales
            }

            e.target.nextElementSibling.innerHTML = `Piezas: ${piezas_totales}`
          }else{
            e.target.nextElementSibling.disabled = true
            e.target.nextElementSibling.classList.add('animate__flipOutX');
            e.target.nextElementSibling.classList.remove('animate__flipInX');
          }

        }
      });

    })

    .catch((err) => { console.error(err) })

}

function ImprimirManual(idp) {
  cantidadManual.value = ""
  let data = { "id": `${idp}` }
  axios({
    method: 'post',
    url: `/idplanImpresion`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {
      let currentInfo = result.data[0]
      etiquetas_impresas = 0
      etiquetas_impresas = result.data[1][0].impreso
      if (etiquetas_impresas == null) etiquetas_impresas = 0


      $('#modalImpresionManual').modal({ backdrop: 'static', keyboard: false })
      msap.forEach(element => { element.innerHTML = currentInfo[0].numero_sap })
      mcantidad.forEach(element => { element.innerHTML = currentInfo[0].cantidad })
      mfecha.forEach(element => { element.innerHTML = currentInfo[0].fecha })
      midplan.forEach(element => { element.innerHTML = idp })
      mimpreso.forEach(element =>{element.innerHTML = etiquetas_impresas})
      let btnImprimir = document.querySelectorAll(".btnImprimir")
      btnImprimir.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault()
          impresion(e)
        })
      })


    })

    .catch((err) => { console.error(err) })

}

addCard = function (key, value, cantidadProgramada) {
  let ul = document.getElementById("cotenedorSection")
  let li = document.createElement("li")
  let etiquetas = Math.floor(cantidadProgramada / value)
  let card =
    `
  <div class="card text-center" style="width: 12rem;">
  <img class="card-img-top mx-auto" src="/img/contenedores/${key}.jpg" alt="Card image cap">
  <div class="card-body">
    <p>Capacidad: ${value}</p>
    <hr>
    <div class="form-group">
      <small id="helpId" class="form-number"><span class="fas fa-hashtag"></span> Etiquetas requeridas:</small>
      <input type="number" class="form-control inputImprimir mb-4" name="" id="${key}-${value}"  autocomplete="off"  min="0">
      <button class="btn btn-info rounded-pill btnImprimir animate__flipOutX animate__animated" type="submit" value="${key}-${value}"  disabled></button>
    </div>
    
        
  </div>
</div>
  `
  ul.classList.add("list-inline", "mx-auto", "justify-content-center")
  li.classList.add("list-inline-item")

  li.setAttribute("id", `${key}`)
  if (etiquetas != 0) {
    li.innerHTML = card
    ul.appendChild(li)
  }

}

function clear() {
  let ul = document.getElementById("cotenedorSection")
  ul.innerHTML = ""
}



function impresion(e) {

  let etiquetas_requeridas_ = parseInt(e.target.previousElementSibling.value)
  if (e.target.id === "btnImprimirManual") etiquetas_requeridas_ = 1
  $('#modalImpresion').modal('hide')
  $('#modalImpresionManual').modal('hide')
  $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
  clear()
  let plan_id = midplan[0].innerHTML
  let no_sap = msap[0].innerHTML
  let cantidad = mcantidad[0].innerHTML
  let contenedor = (e.target.value).replace(regex1, "")
  let capacidad = (e.target.value).replace(regex2, "")
  let linea = selectedLinea.options[selectedLinea.selectedIndex].text


  if (parseInt(cantidadManual.value) > 0) { cantidad = parseInt(cantidadManual.value), capacidad = parseInt(cantidadManual.value), contenedor = "manual" }

  let data = { "plan_id": `${plan_id}`, "no_sap": `${no_sap}`, "cantidad": cantidad, "contenedor": `${contenedor}`, "capacidad": capacidad, "linea": `${linea}`, "tipo": `EXT`, "impresoType": `Impreso`, "etiquetas": `${etiquetas_requeridas_}` }

  axios({
    method: 'post',
    url: `/impresionEtiqueta`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {

      let last_id = result.data.last_id
      let first_id = last_id - etiquetas_requeridas_ +1

      setTimeout(() => {
        $('#modalSpinner').modal('hide')

      }, 500);

      $('#modalSuccess').modal({ backdrop: 'static', keyboard: false })
      tituloSuccess.innerHTML = `<h2><span class="badge badge-info"><pan class="fas fa-barcode"></span></span> Seriales impresos:</h2>`
      cantidadSuccess.innerHTML = `${first_id} - ${last_id}`


    })
    .catch((err) => { console.error(err) })
}

function refreshTable() {
  table.clear().draw();
  getSelectedTurno()
}

function verifyCant() {

  if (parseInt(cantidadManual.value) > 0) {
    btnImprimirManual.disabled = false
  } else {
    btnImprimirManual.disabled = true
  }
}