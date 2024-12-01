import { Router } from 'express';
import { addClient, getAllClients, getClientById, login, updateClient, deleteClient, addWorker, CreateMailingList, getClientsByType, sendEmailsToClients, getClientDocuments, getClientCapitalDocuments, getAllDocumentsByFileName, setDocAsTreated, getTaxDocumentsCounts, getCapitalDocumentsCounts } from './officeWorker.controller';

const officeWorkersRouter = Router();

officeWorkersRouter
    .get('/', getAllClients) 
    .get('/clients/:id', getClientById)
    .post('/addClient', addClient)
    .put('/:id', updateClient) 
    .delete('/deleteClient/:id', deleteClient)
    .post('/login', login) 
    .post('/addWorker', addWorker) 
    .post('/CreateMailingList', CreateMailingList) 
    .post('/getClientsByType', getClientsByType)
    .post('/sendEmailsToClients', sendEmailsToClients)
    .get('/clients/:id/taxDocuments', getClientDocuments) 
    .get('/clients/:id/capitalDocuments', getClientCapitalDocuments) 
    .post('/clients/documents/all', getAllDocumentsByFileName)
    .put('/clients/documents/treated',setDocAsTreated)
    .get('/clients/:id/taxDocuments/counts', getTaxDocumentsCounts)
  .get('/clients/:id/capitalDocuments/counts', getCapitalDocumentsCounts);
    export default officeWorkersRouter
