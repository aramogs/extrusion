let btn_logoff = document.getElementById("btn_logoff")
let currentFecha = document.getElementById("currentFecha")
let currentTurno = document.getElementById("currentTurno")
let clock = document.getElementById("clock")

let myDateString
btn_logoff.addEventListener("click",()=>{ document.cookie = "accessToken" + '=; Max-Age=0', location.reload()})




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
    currentTurno.value= "T2"
     t = setTimeout(function(){ currentTime() }, 1000) 
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
  