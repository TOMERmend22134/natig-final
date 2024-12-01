import { Request, Response } from 'express';
import { Client, ClientCapitalDocument, ClientDocument } from './client.type';
import { addCapitalDocumentToClient, addDocumentToClient, findByEmailAndPassword, getByEmail, getClientDocuments, updateClientInDb } from './client.model';
import { decryptPassword } from '../officeWorker/utils/utils';
import { ObjectId } from 'mongodb';



// פונקציה שמטפלת בתהליך ההתחברות של לקוח, מאמתת אימייל וסיסמה
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;


    if (!email || !password) {
        res.status(400).json({ message: 'Email or password must be provided' });
        return;
    }
    try {

        let client: Client = await getByEmail(email);


        if (!client) {
            res.status(404).json({ msg: 'Client not found' });
        } else if (decryptPassword(password, client.password)) {
            res.status(200).json({ client });
        } else {
            res.status(400).json({ msg: 'Invalid Email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// פונקציה שמעלה מסמך רגיל ללקוח לפי מזהה הלקוח
export async function uploadDocument(req: Request, res: Response) {
    try {
        const clientId = req.params.id;
        const { Document_name, Document_url, fileName } = req.body;

        if (!Document_name || !Document_url || !fileName) {
            return res.status(400).json({ message: 'Document name, file name and URL must be provided' });
        }

        const document: ClientDocument = {
            Document_name,
            Document_url,
            fileName,
            dateUploaded: new Date(),
            isTreated: false
        };

        const result = await addDocumentToClient(clientId, document);

        if (result) {
            return res.status(200).json({ msg: 'Document uploaded successfully', document });
        } else {
            return res.status(400).json({ msg: 'Failed to upload document' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

// פונקציה שמעלה מסמך הון ללקוח לפי מזהה הלקוח
export async function wealthDocuments(req: Request, res: Response) {
    try {
        const clientId = req.params.id;
        const { Document_name, Document_url, fileName } = req.body;

        if (!Document_name || !Document_url || !fileName) {
            return res.status(400).json({ message: 'Document name, file name and URL must be provided' });
        }

        const document: ClientCapitalDocument = {
            Document_name,
            Document_url,
            fileName,
            dateUploaded: new Date(),
            isTreated: false
        };

        const result = await addCapitalDocumentToClient(clientId, document);

        if (result) {
            return res.status(200).json({ msg: 'Capital document uploaded successfully', document });
        } else {
            return res.status(400).json({ msg: 'Failed to upload capital document' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}
// פונקציה שמחזירה את כל המסמכים של לקוח לפי מזהה הלקוח
export async function getDocuments(req: Request, res: Response) {
    try {
        const clientId = req.params.id;


        const documents = await getClientDocuments(clientId);

        if (documents && documents.length > 0) {
            res.status(200).json({ msg: 'Documents fetched successfully', documents });
        } else {
            res.status(400).json({ msg: 'No documents found for this client' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
// פונקציה לעדכון פרטי לקוח
export async function updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedClientData = req.body;
  
      // בדיקה אם המזהה תקין
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'מזהה לקוח לא תקין' });
      }
  
      const result = await updateClientInDb(new ObjectId(id), updatedClientData);
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'לא בוצעו שינויים בלקוח' });
      } else {
        return res.status(200).json({ success: true, message: 'פרטי הלקוח עודכנו בהצלחה' });
      }
    } catch (error) {
      console.error('שגיאה בעדכון פרטי הלקוח:', error);
      res.status(500).json({ message: 'שגיאה בעדכון פרטי הלקוח' });
    }
  }
