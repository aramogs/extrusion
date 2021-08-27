const express = require('express');
const router = express.Router();
const routesController = require('./routesController')
const middleware = require('../public/js/middlewares/middleware')
const multer = require('multer')
const upload = multer()


//Routes

router.get('/', routesController.index_GET);
router.get('/login/:id', middleware.loginVerify, routesController.login);
router.get('/acceso_denegado',routesController.accesoDenegado_GET);
router.get('/mainMenu',middleware.verifyToken,routesController.mainMenu_GET);
router.post('/userAccess', routesController.userAccess_POST);
router.get('/backflushEx',middleware.verifyToken, routesController.backflushEx_GET);
router.get('/consultaEx',middleware.verifyToken, routesController.consultaEx_GET);
router.get('/cargaProgramacion', middleware.sspi, routesController.cargaProgramacion_GET);
router.post('/getTurnos',routesController.getTurnos_POST);
router.post('/verificarSAP/:id_carga', middleware.sspi, upload.single("excelFile"), routesController.verificarSAP_POST);
router.get('/editarProgramacion/:fecha?', middleware.sspi, routesController.editarProgramacion_GET);
router.post('/tablaProgramacion', routesController.tablaProgramacion_POST);
router.post('/getProgramacion',routesController.getProgramacion_POST);
router.post('/cancelarIdPlan',routesController.cancelarIdPlan_POST);
router.post('/idplanInfo',routesController.idplanInfo_POST);
router.post('/editarIdPlan',routesController.editarIdPlan_POST);
router.post('/agregarIdPlan',middleware.sspi, routesController.agregarIdPlan_POST);
router.post('/getCurrentProgramacion',routesController.getCurrentProgramacion_POST);
router.post('/idplanImpresion',routesController.idplanImpresion_POST);
router.post('/checkSap',routesController.checkSap_POST);
router.get('/etiquetasImpresas', middleware.sspi, routesController.etiquetasImpresas_GET);
router.post('/tablaSeriales',routesController.tablaSeriales_POST);
router.post('/tablaSerialesFechasMultiples',routesController.tablaSerialesFechasMultiples_POST);
router.post('/tablaPlanFechasMultiples',routesController.tablaPlanFechasMultiples_POST);
router.post('/cancelarSeriales',middleware.sspi,routesController.cancelarSeriales_POST);
router.post('/impresionEtiqueta', middleware.verifyToken,routesController.impresion_POST);
router.post('/getIdPlans',routesController.getIdPlans_POST);
router.post('/cancelarSerialesPlan',middleware.sspi, routesController.cancelarSerialesPlan_POST);
router.get('/impresion/', middleware.verifyToken, routesController.impresion_GET);
router.post('/getProgramacion',routesController.getProgramacion_POST);
router.post('/procesarSeriales/',  middleware.verifyToken,routesController.procesarSeriales_POST);
router.post('/consultarSeriales/', routesController.consultarSeriales_POST);
router.get('/reportes/', routesController.reportes_GET);
router.post('/reporteGrafico/', routesController.reporteGrafico_POST);
router.get('/transferRP',middleware.verifyToken, routesController.transferRP_GET);
router.get('/transferPR',middleware.verifyToken, routesController.transferPR_GET);
router.post('/transferenciaRP/', middleware.verifyToken, routesController.transferenciaRP_POST);
router.post('/getAllInfoSerial', routesController.getAllInfoSerial_POST);
router.post('/transferenciaPR/', routesController.transferenciaPR_POST);

router.get('/inventario', middleware.sspi, routesController.inventario_GET);
router.post('/getInventario/', routesController.getInventario_POST);

module.exports = router;