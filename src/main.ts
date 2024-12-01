import 'dotenv/config'; 
import express from 'express';
import clientsRouter from './clients/client.routes';
import officeWorkersRouter from './officeWorker/officeWorker.routes';
import workingHoursRouter from './collectionWorkingHours/collectionWorkingHours.routes';
import { engine } from 'express-handlebars';
import path from 'path';
import viewRouter from './views/views.routes';


//הגדרת מספר הפורט עליו השרת ירוץ
const PORT = process.env.PORT || 7468; 

//יצירת שרת Express
const server = express();

//הגדרת תמיכה בקבצי JSON 
server.use(express.json());

// Middleware לפענוח נתונים המתקבלים כטפסים
server.use(express.urlencoded({ extended: true }));

//הגדרת מנוע תבניות Handlebars להצגת דפים
server.engine('.hbs', engine({ extname: '.hbs' }));
server.set('view engine', '.hbs');
server.set('views', path.join(__dirname, 'views/'));

//קבצים סטטיים כמו CSS ו-JS
server.use('/static', express.static(path.join(__dirname, 'static/')));

//שימוש ברוטים (נתיבים) של המערכת
server.use('/', viewRouter);
server.use('/api/clients', clientsRouter);
server.use('/api/officeWorkers', officeWorkersRouter);
server.use('/api/workingHours', workingHoursRouter);



//הפעלת השרת
server.listen(PORT, () => console.log(`[Server] http://localhost:${PORT}`));
