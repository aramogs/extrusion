let btn_pt_1 = document.getElementById("btn_pt_1")
let btn_pt_2 = document.getElementById("btn_pt_2")
let btn_pt_3 = document.getElementById("btn_pt_3")
let btn_pt_4 = document.getElementById("btn_pt_4")

let btn_logoff = document.getElementById("btn_logoff")

btn_pt_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/backflushEx")
})

btn_pt_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/consultaEx")
})

btn_pt_3.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transferRP")
})

btn_pt_4.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transferPR")
})

btn_logoff.addEventListener("click",()=>{ document.cookie = "accessToken" + '=; Max-Age=0', location.reload()})
