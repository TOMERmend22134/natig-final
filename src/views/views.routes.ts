import { Router } from "express";
import { loadAboutPage, loadClientLoginPage, loadWorkerLoginPage, workerLogin, loadAddClientPage, manageClients, clientArea, clientLogin, loadContactUs } from "./views.controller";


const viewRouter = Router();

viewRouter
  .get('/', (req, res) => res.render('./pages/home'))
  .get('/about', loadAboutPage)
  .get('/workerLogin', loadWorkerLoginPage)  
  .get('/clientLogin', loadClientLoginPage)  
  .post('/workerLogin', workerLogin)
  .post('/clientLogin', clientLogin)
  .get('/addClient', loadAddClientPage)
  .get('/manageClients', manageClients)
  .get('/clientArea', clientArea)
  .get('/contactUs',loadContactUs)
export default viewRouter;
