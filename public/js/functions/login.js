let inputPassword = document.getElementById("inputPassword")
let submitPassword = document.getElementById("submitPassword")
let sectionSpan = document.getElementById("sectionSpan")
let section = (window.location.pathname).replace("/login/","")
sectionSpan.innerHTML = section
inputPassword.focus()

submitPassword.addEventListener("submit", (e) => {
    e.preventDefault()


    let inputPass = inputPassword.value
    if (inputPass.length > 6) {
        pass = inputPass.charAt(2) == 0 ? pass = inputPass.substring(3,8) : pass = inputPass.substring(2, 8)
    } else {
        pass = inputPass
    }

    axios.post("/userAccess", {
        user: pass,
        section: section.innerText
    })
        .then((result) => {
            let response = result.data
            if (response != "unathorized") {
                soundOk()
                setTimeout(() => {
                    if (section === "Acreditacion") {
                        window.location.replace(window.location.origin + "/mainMenu")
                    }else if (section === "Impresion") {
                        window.location.replace(window.location.origin + "/impresion")
                    }
                    
                }, 200);
                
            } else {
                soundWrong()
                inputPassword.value=""
                alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
                alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
                setTimeout(() => {
                    alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
                    alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
                }, 2000);
            }
        })
        .catch((err) => { console.error(err) })
})
