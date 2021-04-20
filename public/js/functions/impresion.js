let btn_logoff = document.getElementById("btn_logoff")
let currentFecha = document.getElementById("currentFecha")
let currentTurno = document.getElementById("currentTurno")
let clock = document.getElementById("clock")
let selectedLinea = document.getElementById("selectedLinea")
let myDateString
let table = $('#myTable').DataTable();
let modalImpresion = document.getElementById("modalImpresion")
let msap = document.getElementById("msap")
let mcantidad = document.getElementById("mcantidad")
let mfecha = document.getElementById("mfecha")
let cotenedorSection = document.getElementById("cotenedorSection")
let btnCerrar = document.getElementsByClassName("btnCerrar")
let regex1 = /\-(.*)/
let regex2 = /^(.*?)\-/

btn_logoff.addEventListener("click", () => { document.cookie = "accessToken" + '=; Max-Age=0', location.reload() })
selectedLinea.addEventListener("change", () => { getSelectedTurno() })
btnCerrar[0].addEventListener("click", () => { clear() })



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
      console.log(result.data);
      for (let y = 0; y < result.data.length; y++) {
        let imprimir
        if (result.data[y].status == "Pendiente") {

          imprimir =
            `
            <input type="text" name="idPlan" id="idPlan${result.data[y].plan_id}" value=${result.data[y].plan_id} hidden>
            <button type="submit"  class="btn btn-info  rounded-pill" name="btnPrint" id="${result.data[y].plan_id}" onClick="ImprimirModal(this.id)" ><span class="fas fa-print"></span>
            `

        } else { imprimir = `<button type="button" class="btn btn-success  rounded-pill " disabled><span class="fas fa-check-square" disabled></span>` }

        table.row.add([
          imprimir,
          result.data[y].no_sap,
          result.data[y].description,
          result.data[y].cust_part,
          result.data[y].family,
          result.data[y].length,
          result.data[y].cantidad,
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


  let data = { "id": `${idp}` }
  axios({
    method: 'post',
    url: `/idplanImpresion`,
    data: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  })
    .then((result) => {
      let currentInfo = result.data

      currentInfo.forEach((obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (key.includes("std_pack") && value > 0) {

            // console.log(`${key} ${value}`);
            addCard(key, value, currentInfo[0].cantidad)
          }

        });
      });

      $('#modalImpresion').modal({ backdrop: 'static', keyboard: false })
      msap.innerHTML = currentInfo[0].numero_sap
      mcantidad.innerHTML = currentInfo[0].cantidad
      mfecha.innerHTML = currentInfo[0].fecha

      let btnImprimir = document.querySelectorAll(".btnImprimir")
      btnImprimir.forEach(btn => {
        btn.addEventListener("click", (e)=>{
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
  let card =
    `
  <div class="card text-center" style="width: 12rem;">
  <img class="card-img-top mx-auto" src="/img/contenedores/${key}.jpg" alt="Card image cap">
  <div class="card-body">
    <p>Capacidad: ${value}</p>

      <button class="btn btn-info btnImprimir" type="submit" value="${key}-${value}">Etiquetas: ${Math.floor(cantidadProgramada / value)}</button>

  </div>
</div>
  `
  ul.classList.add("list-inline", "mx-auto", "justify-content-center")
  li.classList.add("list-inline-item")

  li.setAttribute("id", `${key}`)
  // li.appendChild(document.createTextNode(`Value`  + value));
  li.innerHTML = card
  ul.appendChild(li)
}

function clear() {
  let ul = document.getElementById("cotenedorSection")
  ul.innerHTML = ""
}



function impresion(e) {
  let no_sap = msap.innerHTML
  let cantidad = mcantidad.innerHTML
  let contenedor = (e.target.value).replace(regex1,"")
  let capacidad = (e.target.value).replace(regex2,"")
  
  
  console.log(no_sap, cantidad,contenedor,capacidad);
  // let data = { "id": `${idp}` }
  // axios({
  //   method: 'post',
  //   url: `/idplanImpresion`,
  //   data: JSON.stringify(data),
  //   headers: { 'content-type': 'application/json' }
  // })
  //   .then((result) => { console.log(result) })
  //   .catch((err) => { console.log(err) })
}

