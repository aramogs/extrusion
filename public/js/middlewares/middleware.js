const jwt = require('jsonwebtoken');
const nodeSSPI = require('node-sspi');
const middleware = {};

const macfromip = require('macfromip');
const regex = /::ffff:/gm;

middleware.verifyToken = (req, res, next) => {
    if (!req.headers.cookie) {
        res.redirect("/login/Acreditacion")
    } else {

        let cookies = (req.headers.cookie).split(";")
        let token_name
        let token_jwt

        cookies.forEach(cookie => {
            let Ttoken = (cookie.split("=")[0]).trim()
            let Tjwt = (cookie.split("=")[1]).trim()
            if (Ttoken == "accessToken") {
                token_name = Ttoken
                token_jwt = Tjwt
            }
        })

        if (token_name == "accessToken") {
            jwt.verify(token_jwt, 'tristone', (err, authData) => {
                if (err) {
                    res.render('login.ejs')

                } else {
                    res.clearCookie("accessToken");
                    res.cookie("accessToken", token_jwt, {
                        maxAge: 900000 /*10 Minutos*/,
                        httpOnly: false,
                        secure: process.env.NODE_ENV === 'production' ? true : false
                    })
                    res.locals.authData = authData ; next()
                }
            })
        }
        else {
            res.render('login.ejs'); next()
        }
    }
}

middleware.loginVerify = (req, res, next) => {
    let ubicacion = req.params.id

    if (!req.headers.cookie) {
        res.render('login.ejs');
    } else {

        let cookies = (req.headers.cookie).split(";")
        let token_name
        let token_jwt


        cookies.forEach(cookie => {
            let Ttoken = (cookie.split("=")[0]).trim()
            let Tjwt = (cookie.split("=")[1]).trim()
            if (Ttoken == "accessToken") {
                token_name = Ttoken
                token_jwt = Tjwt
            }
        })


        if (token_name == "accessToken") {
            jwt.verify(token_jwt, 'tristone', (err, authData) => {
                if (ubicacion === "Acreditacion") res.redirect("/mainMenu")
                if (ubicacion === "Impresion") res.redirect("/impresion")

            })
        } else {
            res.render('login.ejs')
        }

    }
}

middleware.sspi = (req, res, next) => {
    let nodeSSPIObj = new nodeSSPI({retrieveGroups: true});
    nodeSSPIObj.authenticate(req, res, function (err) {
        res.finished || next()
    });
}

function validMac(mac) {
    return /^[0-9a-f]{1,2}([.:-])[0-9a-f]{1,2}(?:\1[0-9a-f]{1,2}){4}$/.test(mac)
}

middleware.macFromIP = (req, res, next) => {
    const regex = /::ffff:/gm;
    let ip = (req.ip).replace(regex, "")
    let localIp = (req.hostname).replace(regex, "")

    if (ip === "::1" || ip === localIp) {
        res.locals.macIP = { "mac": "00-00-00-00-00-00", "ip": "10.56.99.21" }; next()
    } else {
        macfromip.getMac(ip, (err, mac) => {

            if (err == "The IP address cannot be self") {/* DO NOTHING*/ }

            if (!validMac(mac)) {
                res.render('mac_invalida.ejs', { mac })
            } else {
                res.locals.macIP = { "mac": mac, "ip": ip }; next()
            }
        });
    }
}


module.exports = middleware;