const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const multer = require('multer')
const upload = multer()
const jwt = require('jsonwebtoken');

//Routes

router.get('/', routesController.index_GET);
router.get('/login/', routesController.login);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/mainMenu',verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/backflushEx',verifyToken, routesController.backflushEx_GET);
router.get('/consultaEx',verifyToken, routesController.consultaEx_GET);
router.get('/cargaProgramacion', routesController.cargaProgramacion_GET);
router.get('/getTurnos',routesController.getTurnos_GET);
router.post('/verificarSAP/:id_carga', upload.single("excelFile"), routesController.verificarSAP_POST);
router.post('/getProgramacion',routesController.getProgramacion_POST);



function verifyToken(req, res, next) {
    if (!req.headers.cookie) {
        res.render('login.ejs')
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

                    res.locals.authData = authData
                    next()
                }
            })
        }
        else {
            res.render('login.ejs')
        }
    }

}

module.exports = router;