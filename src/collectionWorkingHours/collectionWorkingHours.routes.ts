import { Router } from 'express';
import {addHours,changeHours, getClientHours, getWorkerHours, getWorkingHours  } from './collectionWorkingHours.controller';

const  workingHoursRouter = Router();

workingHoursRouter
.post('/add', addHours)
.post('/change', changeHours)
.get('/client/:client_id', getClientHours)
.get('/worker/:worker_id', getWorkerHours)
.get('/client/:client_id/worker/:worker_id', getWorkingHours)

export default  workingHoursRouter