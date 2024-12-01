import { Request, Response } from "express";
import { getOfficeWorkerByEmail, getAll, getOfficeWorkerById } from "../officeWorker/officeWorker.model";
import { officeWorker } from "../officeWorker/officeWorker.type";
import { ObjectId } from "mongodb";
import { getWorkingHoursByWorkerId } from "../collectionWorkingHours/collectionWorkingHours.db";
import { getClientByIdFromDb, getClients } from "../clients/client.db";
import { getOfficeWorkerByIdFromDb } from "../officeWorker/officeWorker.db";
import { getClientById } from "../officeWorker/officeWorker.controller";
import { Client } from "../clients/client.type";
import { getClientByEmail } from "../clients/client.model";
import { decryptPassword } from "../officeWorker/utils/utils";

// טוען את דף "אודות"
export async function loadAboutPage(req: Request, res: Response) {
  res.render('./pages/about');
}

// טוען את דף ההתחברות לעובד משרד
export async function loadWorkerLoginPage(req: Request, res: Response) {
  res.render('./pages/workerLogin');
}

// טוען את דף "צור קשר"
export async function loadContactUs(req: Request, res: Response) {
  res.render('./pages/contactUs');
}

// טוען את דף ההתחברות ללקוח
export async function loadClientLoginPage(req: Request, res: Response) {
  res.render('./pages/clientLogin');
}

// טוען את דף הוספת לקוח
export async function loadAddClientPage(req: Request, res: Response) {
  res.render('./pages/addClient');
}

// מציג את דף ניהול הלקוחות עבור עובד משרד
export async function manageClients(req: Request, res: Response) {
  try {
    const worker_id = req.query.worker_id as string;
    const objectId = new ObjectId(worker_id); // המרת המזהה ל-ObjectId
    const officeWorker: officeWorker | null = await getOfficeWorkerByIdFromDb(objectId);

    if (!officeWorker) {
      return res.status(404).json({ message: 'Office worker not found' });
    }

    const workingHours = await getWorkingHoursByWorkerId(objectId);
    const clientIds = [...new Set(workingHours.map(entry => entry.client_id))];
    const clients = await getClients({ _id: { $in: clientIds } });

    res.render('pages/manageClients', { officeWorker, clients, clientsCount: clients.length });
  } catch (error) {
    console.error('Error managing clients:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

// פונקציית התחברות לעובד משרד
export async function workerLogin(req: Request, res: Response) {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.redirect('/workerLogin?error=Email and password must be provided');
      }

      const officeWorker: officeWorker | null = await getOfficeWorkerByEmail(email);

      if (officeWorker && officeWorker.password === password) {
          const workingHours = await getWorkingHoursByWorkerId(officeWorker._id);
          const clientIds = [...new Set(workingHours.map(entry => entry.client_id))];
          const clients = await getClients({ _id: { $in: clientIds } });

          return res.render('pages/manageClients', { officeWorker, clients, clientsCount: clients.length });
      } else {
          return res.redirect('/workerLogin?error=Invalid Email or password');
      }
  } catch (error) {
      console.error('Error during worker login process:', error);
      return res.redirect('/workerLogin?error=An unexpected error occurred. Please try again later.');
  }
}



// טוען את דף אזור הלקוח
export async function clientArea(req: Request, res: Response) {
  try {
    res.render('pages/clientArea');
  } catch (error) {
    console.error('Error managing clients:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

// פונקציית התחברות ללקוח, מבצעת אימות משתמש ומציגה את דף אזור הלקוח אם ההתחברות מוצלחת
export async function clientLogin(req: Request, res: Response) {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.redirect('/clientLogin?error=Email and password must be provided');
      }

      const client: Client | null = await getClientByEmail(email);

      if (client && decryptPassword(password, client.password)) {
          return res.render('pages/clientArea', { client });
      } else {
          return res.redirect('/clientLogin?error=Invalid Email or password');
      }
  } catch (error) {
      console.error('Error during client login process:', error);
      return res.redirect('/clientLogin?error=An unexpected error occurred. Please try again later.');
  }
}
