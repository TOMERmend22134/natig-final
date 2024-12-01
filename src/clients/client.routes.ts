import { Router } from 'express';
import { getDocuments, login, updateClient, uploadDocument, wealthDocuments } from './client.controller';

const clientsRouter = Router();

clientsRouter
.post('/login', login)
.post('/:id/documents', uploadDocument) 
.get('/:id/documents', getDocuments) 
.put('/:id', updateClient) 
.post('/:id/wealth-documents', wealthDocuments) 
    export default clientsRouter