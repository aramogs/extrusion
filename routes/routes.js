const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')
const multer = require('multer')
const upload = multer()


//Routes

router.get('/', routesController.index_GET);
router.get('/login/:id', routesController.login);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/mainMenu',middleware.verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/backflushEx',middleware.verifyToken, routesController.backflushEx_GET);
router.get('/consultaEx',middleware.verifyToken, routesController.consultaEx_GET);
router.get('/cargaProgramacion', routesController.cargaProgramacion_GET);
router.get('/getTurnos',routesController.getTurnos_GET);
router.post('/verificarSAP/:id_carga', upload.single("excelFile"), routesController.verificarSAP_POST);
router.get('/editarProgramacion/:fecha?', routesController.editarProgramacion_GET);
router.post('/tablaProgramacion', routesController.tablaProgramacion_POST);
router.post('/getProgramacion',routesController.getProgramacion_POST);
router.post('/cancelarIdPlan',routesController.cancelarIdPlan_POST);
router.post('/idplanInfo',routesController.idplanInfo_POST);
router.post('/editarIdPlan',routesController.editarIdPlan_POST);
router.post('/agregarIdPlan',routesController.agregarIdPlan_POST);
router.post('/getCurrentProgramacion',routesController.getCurrentProgramacion_POST);
router.post('/idplanImpresion',routesController.idplanImpresion_POST);
router.post('/checkSap',routesController.checkSap_POST);
router.get('/etiquetasImpresas',routesController.etiquetasImpresas_GET);
router.post('/tablaSeriales',routesController.tablaSeriales_POST);
router.post('/cancelarSeriales',routesController.cancelarSeriales_POST);
router.post('/impresion', middleware.verifyToken,routesController.impresion_POST);
router.get('/impresion/', middleware.verifyToken, routesController.impresion_GET);

router.post('/getProgramacion',routesController.getProgramacion_POST);





module.exports = router;