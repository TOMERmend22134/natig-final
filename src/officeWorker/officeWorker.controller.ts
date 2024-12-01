import { Request, Response } from 'express';
import { createMailingList, deleteClientFromDb, findByEmailAndPassword, getAll, getByEmail, getById, getCapitalDocumentsByFileNameFromModel, getCapitalDocumentsCountsFromModel, getClientCapitalDocumentsFromModel, getClientDocumentsFromModel, getClientsByIds, getClientsByTypeFromModel, getClientsByWorkerId, getDocumentsByFileNameFromModel, getTaxDocumentsCountsFromModel, getWorkerById, insertClient, insertWorker, updateClientInDb, updateDocStatus } from './officeWorker.model';
import { findAll } from './officeWorker.db';
import { insertHours } from '../collectionWorkingHours/collectionWorkingHours.model';
import { officeWorker } from './officeWorker.type';
import { ObjectId, WithId } from 'mongodb';
import { Client, ClientAddress } from '../clients/client.type';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import { getClients } from '../clients/client.db';
import { getWorkingHoursByWorkerId } from '../collectionWorkingHours/collectionWorkingHours.db';
import { encryptPassword } from './utils/utils';

//מחזירה את כל הלקוחות
export async function getAllClients(req: Request, res: Response) {
    try {
        let clients = await getAll();
        res.status(200).json({ clients });
    } catch (error) {
        res.status(500).json({ error });
    }
}
export async function getClientById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // בדוק אם המזהה הוא בפורמט תקין של ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid client ID format' });
        }

        const client = await getById(id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        } else {
            return res.status(200).json({ client });
        }
    } catch (error) {
        console.error('Error fetching client:', error);
        return res.status(500).json({ error: 'Failed to fetch client details' });
    }
}


//מחזירה עובד משרד לפי מזהה ID
export async function getOfficeWorkerById(req: Request, res: Response) {
    try {
        let { id } = req.params;

        if (id.length != 24)
            return res.status(403).json({ message: 'invalid id' });

        let worker_id = await getWorkerById(id);

        if (!worker_id)
            res.status(404).json({ message: 'worker not found' });
        else
            res.status(200).json({ worker_id });
    } catch (error) {
        res.status(500).json({ error });
    }
}
//הוספת לקוח חדש
export async function addClient(req: Request, res: Response) {

    try {

        let { client_name, client_type, city, street, number, zip_code, mobile_number, income_tax_file, vat_file_number, email, password, home_number, ClientDocument, worker_id, day_of_work, start_hour, end_hour } = req.body;
        password = encryptPassword(password);

        const address: ClientAddress = {
            city: city || null,
            street: street || null,
            number: number ? parseInt(number, 10) : null,
            zip_code: zip_code || null
        };

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // בדיקה אם הלקוח קיים לפי אימייל
        const existingClient = await getByEmail(email);
        if (existingClient) {
            return res.send(`<script>alert('Client with this email already exists'); window.location.href='/manageClients?worker_id=${worker_id}';</script>`);
        }

        // הוספת לקוח חדש
        const result = await insertClient(client_name, client_type, address, mobile_number, income_tax_file, vat_file_number, email, password, home_number, ClientDocument);

        if (!result.acknowledged) {
            return res.status(500).json({ message: 'Internal server error. Please try again' });
        }

        // כאן אנחנו לוקחים את התאריכים והשעות כפי שהוזנו בטופס
        const newHours = {
            worker_id: new ObjectId(worker_id),
            client_id: result.insertedId,
            day_of_work: day_of_work,
            start_hour: start_hour,
            end_hour: end_hour
        };
        await insertHours(newHours);

        res.send(`<script>alert('הלקוח נוסף בהצלחה'); window.location.href='/manageClients?worker_id=${worker_id}';</script>`);
    } catch (error) {
        console.error('Error adding client:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
    }
}
// עדכון פרטי לקוח במערכת
export async function updateClient(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // בדוק אם המזהה תקין
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid client ID format' });
        }

        // השג את הנתונים המעודכנים מהבקשה
        const updatedClientData = req.body;

        // בדיקה אם הלקוח קיים לפי מזהה
        const existingClient = await getById(id);
        if (!existingClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // עדכון פרטי הלקוח
        const updatedClient = {
            ...existingClient,
            client_name: updatedClientData.client_name || existingClient.client_name,
            client_type: updatedClientData.client_type || existingClient.client_type,
            address: updatedClientData.address || existingClient.address,
            mobile_number: updatedClientData.mobile_number || existingClient.mobile_number,
            income_tax_file: updatedClientData.income_tax_file || existingClient.income_tax_file,
            vat_file_number: updatedClientData.vat_file_number || existingClient.vat_file_number,
            email: updatedClientData.email || existingClient.email,
            home_number: updatedClientData.home_number || existingClient.home_number,
            ClientDocument: updatedClientData.ClientDocument || existingClient.ClientDocument,
            password: existingClient.password // שמירת הסיסמה כמו שהיא
        };

        const result = await updateClientInDb(new ObjectId(id), updatedClient);

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No changes detected, client not updated' });
        } else {
            return res.status(200).json({ success: true, message: 'Client updated successfully', client: updatedClient });
        }
    } catch (error) {
        console.error('Error updating client:', error);
        return res.status(500).json({ error: 'Failed to update client details' });
    }
}

//מחיקת לקוח ממערכת המשרד
export async function deleteClient(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { worker_id } = req.query;

        // בדיקה אם worker_id הוא undefined או אם id אינו תקין
        if (!worker_id || typeof worker_id !== 'string' || !ObjectId.isValid(id)) {
            return res.status(403).json({ message: 'Invalid client or worker ID' });
        }


        const workerObjectId = new ObjectId(worker_id);

        // מחיקת הלקוח מהדטה בייס
        const result = await deleteClientFromDb(new ObjectId(id));

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }


        const workingHours = await getWorkingHoursByWorkerId(workerObjectId);
        const clientIds = [...new Set(workingHours.map(entry => entry.client_id))];
        const clients = await getClients({ _id: { $in: clientIds } });


        return res.json({ success: true, clientsCount: clients.length });
    } catch (error) {

        return res.status(500).json({ message: 'Error deleting client', error });
    }
}
//התחברות עובד משרד לפי אימייל וסיסמה
export async function login(req: Request, res: Response) {
    try {

        const { email, password } = req.body;

        console.log(`${JSON.stringify(req.body)}`);


        if (!email || !password) {
            res.status(400).json({ message: 'Email and password must be provided' });
            return;
        }



        const officeWorker: officeWorker = await findByEmailAndPassword(email, password);

        if (officeWorker) {
            res.status(200).json({ msg: 'Office worker found!', officeWorker });
        } else {
            res.status(400).json({ msg: 'Invalid Email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}


//הוספת עובד משרד חדש
export async function addWorker(req: Request, res: Response) {
    try {
        let { full_name, address, phone, home_phone, position, personal_id, start_date, email, password } = req.body;

        if (!email)
            return res.status(400).json({ message: 'email is required' });


        let existingWorker = await getByEmail(email);
        if (existingWorker) {
            return res.status(400).json({ message: 'Worker with this email already exists' });
        }

        // הוספת עובד חדש
        let result = await insertWorker(full_name, address, phone, home_phone, position, personal_id, start_date, email, password);

        if (!result.acknowledged)
            res.status(500).json({ message: 'internal server error. please try again' });
        else
            res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error });
    }
}
//יצירת רשימת דיוור לפי סוג לקוח
export async function CreateMailingList(req: Request, res: Response) {
    try {
        const { clientType } = req.body;
        const criteria = { clientType };

        // יצירת רשימת דיוור דרך המודל
        const result = await createMailingList(criteria);
        return res.status(200).json({ message: "Mailing List Created Successfully", result });
    } catch (error) {
        return res.status(500).json({ error: "Failed to create mailing list" });
    }
}

//מחזירה לקוחות לפי סוג לקוח
export async function getClientsByType(clientType: string) {
    const clients = await getClientsByTypeFromModel(clientType);
    return clients;
}

//שליחת אימיילים ללקוחות על פי מזהים
export async function sendEmailsToClients(req: Request, res: Response) {
    try {
        const { clientIds, message } = req.body;

        if (!clientIds || clientIds.length === 0) {
            return res.status(400).json({ message: 'No clients selected.' });
        }

        const clients = await getClientsByIds(clientIds);

        if (!clients || clients.length === 0) {
            return res.status(404).json({ message: 'No clients found for the selected IDs.' });
        }

        const emailPromises = clients.map(client => {
            return sendEmail(client.email, message);
        });

        await Promise.all(emailPromises);

        return res.status(200).json({ success: true, message: 'Emails sent successfully!' });
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ success: false, message: 'Failed to send emails.' });
    }
}

//שליחת אימייל ללקוח
function sendEmail(email: string, message: string) {
    return emailjs.send("service_xsw4gtb", "template_zns3ipr", {
        message: message,
        email: email,
    });
}
// שליפת מסמכים רגילים של לקוח
export async function getClientDocuments(req: Request, res: Response) {
    try {
        const clientId = req.params.id;
        const documents = await getClientDocumentsFromModel(clientId);
        console.log("documents", documents);
        if (documents && documents.length > 0) {
            res.status(200).json({ documents });
        } else {
            res.status(404).json({ message: 'No documents found for this client' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// שליפת מסמכי הון של לקוח
export async function getClientCapitalDocuments(req: Request, res: Response) {
    try {
        const clientId = req.params.id;
        const documents = await getClientCapitalDocumentsFromModel(clientId);

        if (documents && documents.length > 0) {
            res.status(200).json({ documents });
        } else {
            res.status(404).json({ message: 'No capital documents found for this client' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// שליפת כל המסמכים לפי שם קובץ (fileName) משני המערכים
export async function getAllDocumentsByFileName(req: Request, res: Response) {
    try {
        const { fileName, client_id } = req.body;
        console.log('FileName:', fileName); // בדיקה שהשם מגיע כראוי

        // שליפת מסמכים רגילים
        const regularDocuments = await getDocumentsByFileNameFromModel(fileName, client_id);
        console.log("regularDocuments", regularDocuments);
        // שליפת מסמכי הון
        const capitalDocuments = await getCapitalDocumentsByFileNameFromModel(fileName, client_id);

        // איחוד של שני המערכים למסמכים
        const allDocuments = [...regularDocuments, ...capitalDocuments];

        if (allDocuments.length === 0) {
            console.log('No documents found for this fileName');
            return res.status(404).json({ message: 'No documents found for this fileName' });
        }

        console.log('Documents found:', allDocuments);
        return res.status(200).json({ documents: allDocuments });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

//
export async function setDocAsTreated(req: Request, res: Response) {
    try {
        const { client_id,array,Document_url, isTreated } = req.body;

        let updated = await updateDocStatus(client_id,array,Document_url, isTreated)

        return res.status(200).json({ updated });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}
// Get counts of treated and untreated tax documents
export async function getTaxDocumentsCounts(req: Request, res: Response) {
    try {
      const clientId = req.params.id;
      const counts = await getTaxDocumentsCountsFromModel(clientId);
      res.status(200).json(counts);
    } catch (error) {
      console.error('Error fetching tax documents counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
  
  // Get counts of treated and untreated capital documents
  export async function getCapitalDocumentsCounts(req: Request, res: Response) {
    try {
      const clientId = req.params.id;
      const counts = await getCapitalDocumentsCountsFromModel(clientId);
      res.status(200).json(counts);
    } catch (error) {
      console.error('Error fetching capital documents counts:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }