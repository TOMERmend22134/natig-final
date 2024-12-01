import { Collection, Db, MongoClient, ObjectId, WithId, Document } from "mongodb";
import { officeWorker } from "./officeWorker.type";
import { Client, ClientCapitalDocument, ClientDocument } from "../clients/client.type";
import { getClientsByType } from "./officeWorker.model";

const DB_INFO = {
    host: process.env.CONNECTION_STRING as string,
    db: process.env.DB_NAME as string,
    office_worker_collection: 'office_workers',
    clients_collection: 'clients',
    working_hours_collection: 'working_hours',
    mailing_list_collection: 'mailing_lists'
};
type ClientCapitalDocumentContainer = {
    CapitalDeclarationDocuments: ClientCapitalDocument[];
};
type ClientDocumentContainer = {
    documents: ClientDocument[];
};

// מחזירה את כל המידע על עובדים ממסד הנתונים בהתאם לשאילתה
export async function findAll(query = {}, projection = {}): Promise<any> {
    let mongo = new MongoClient(DB_INFO.host); // Use the correct connection string
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.office_worker_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה את העובד לפי אימייל וסיסמה
export async function findByEmailAndPassword(email: string, password: string): Promise<officeWorker | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.office_worker_collection);

        const worker = await collection.findOne({ email, password });

        return worker as officeWorker | null;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה עובד לפי מזהה ID
export async function getOfficeWorkerByIdFromDb(worker_id: ObjectId): Promise<officeWorker | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.office_worker_collection);
        const worker = await collection.findOne({ _id: worker_id });
        return worker as officeWorker | null;
    } catch (error) {
        console.error('Error fetching office worker:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// מוסיפה לקוח חדש למסד הנתונים
export async function insertClientToDatabase(newClient: Client) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);
        return await collection.insertOne(newClient);
    } catch (error) {
        console.error('Error inserting client:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה את העובד לפי אימייל
export async function getOfficeWorkerByEmailFromDb(email: string): Promise<officeWorker | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.office_worker_collection);
        const worker = await collection.findOne({ email: email });
        console.log('Office worker:', worker);
        return worker as officeWorker | null;
    } catch (error) {
        console.error('Error fetching office worker by email:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה עובד לפי מזהה ייחודי
export async function getOfficeWorkerById(workerId: ObjectId): Promise<officeWorker | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.office_worker_collection);
        const worker = await collection.findOne({ _id: workerId });
        console.log('Office worker:', worker);
        return worker as officeWorker | null;
    } catch (error) {
        console.error('Error fetching office worker:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה לקבלת לקוחות
export async function getClients(query = {}, projection = {}) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    } finally {
        mongo.close();
    }
}

// מוסיפה לקוח למסד הנתונים
export async function addClientToDatabase(newClient: Client) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);
        return await collection.insertOne(newClient);
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה לקוח לפי אימייל
export async function getByEmailFromDb(email: string): Promise<Client | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);
        const client = await collection.findOne({ email });
        return client as Client | null;
    } catch (error) {
        console.error('Error fetching client by email:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה להוספת לקוח
export async function addClient(client: Omit<Client, '_id'>) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection).insertOne(client);
    } catch (error) {
        throw error;
    } finally {
        mongo.close();
    }
}

// מעדכנת שדות לקוח במסד הנתונים
export async function updateDoc(id: ObjectId, updatedClient: Client) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection).updateOne(
            { _id: id },
            { $set: updatedClient }
        );
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מוחקת לקוח ממסד הנתונים לפי מזהה
export async function deleteDoc(id: ObjectId) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection).deleteOne(
            { _id: id }
        );
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מוסיפה עובד משרד חדש למסד הנתונים
export async function addWorkerToDatabase(newWorker: officeWorker) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.office_worker_collection).insertOne(newWorker);
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// מחזירה את כל העובדים ממסד הנתונים
export async function getWorkers(query = {}, projection = {}) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.office_worker_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה לקבלת ספירת מסמכים
export async function getDocCount(query = {}) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.office_worker_collection).countDocuments(query);
    } catch (error) {
        throw error;
    } finally {
        mongo.close();
    }
}

// מחזירה לקוחות נוספים לפי קריטריונים מסוימים
export async function getClientsOther(query: any, projection: any): Promise<WithId<Document>[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection).find(query, { projection }).toArray();
    } finally {
        await mongo.close();
    }
}

// יוצרת רשימת דיוור במסד הנתונים
export async function createMailingListInDb(mailingList: any) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection('mailing_lists');

        // שמירת רשימת הדיוור במסד הנתונים
        return await collection.insertOne(mailingList);
    } catch (error) {
        console.error('Error creating mailing list in database:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// יוצרת רשימת דיוור לפי סוג לקוח ושומרת אותה במסד הנתונים
export async function createMailingList(criteria: { clientType: string }) {
    const clients = await getClientsByType(criteria.clientType);
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.mailing_list_collection);

        const mailingList = {
            criteria: criteria,
            clients: clients.map(client => ({ _id: client._id, email: client.email, client_name: client.client_name })),
            created_at: new Date()
        };

        return await collection.insertOne(mailingList);
    } catch (error) {
        console.error('Error creating mailing list:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה לשליפת מסמכים רגילים של לקוח ממסד הנתונים
export async function getClientDocumentsFromDb(clientId: string): Promise<ClientDocumentContainer[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection<ClientDocumentContainer>(DB_INFO.clients_collection);

        const result = await collection
            .distinct('documents.fileName', { _id: new ObjectId(clientId) })

        return result;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}
// פונקציה לשליפת מסמכי הון של לקוח ממסד הנתונים
export async function getClientCapitalDocumentsFromDb(clientId: string): Promise<ClientCapitalDocumentContainer[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection<ClientCapitalDocumentContainer>(DB_INFO.clients_collection);

        const capitalDocuments = await collection
            .distinct('CapitalDeclarationDocuments.fileName', { _id: new ObjectId(clientId) })

        return capitalDocuments;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}
// פונקציה לשליפת מסמכים רגילים לפי שם קובץ ממסד הנתונים
export async function getDocumentsByFileNameFromDb(fileName: string, client_id: string): Promise<ClientDocument[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);

        console.log(`FileName: ${fileName}`);

        // חיפוש בביטוי רגולרי

        const documents = await collection
            .find({ _id: new ObjectId(client_id), 'documents.fileName':   fileName  }) // שימוש בביטוי רגולרי גמיש
            .sort({ 'documents.dateUploaded': 1 }) // סידור לפי תאריך העלאה
            .toArray();

        console.log("Documents found:", documents); // הדפסת המסמכים שנמצאו

        const result = documents.flatMap(doc =>
            (doc.documents as ClientDocument[]).filter(d => d.fileName.toLowerCase().includes(fileName.toLowerCase()))
        );

        console.log("Filtered Documents:", result); // הדפסת המסמכים שתואמים לשם הקובץ
        return result;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}



// פונקציה לשליפת מסמכי הון לפי שם קובץ ממסד הנתונים
export async function getCapitalDocumentsByFileNameFromDb(fileName: string, client_id: string): Promise<ClientCapitalDocument[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);

        // שימוש בביטוי רגולרי לחיפוש גמיש לפי שם הקובץ
        const capitalDocuments = await collection
            .find({ _id: new ObjectId(client_id), 'CapitalDeclarationDocuments.fileName':  fileName  }) // שימוש בביטוי רגולרי גמיש
            .sort({ 'CapitalDeclarationDocuments.dateUploaded': 1 }) // סידור לפי תאריך העלאה
            .toArray();
        // מיפוי של המסמכים שתואמים את ה-fileName
        const result = capitalDocuments.flatMap(doc =>
            (doc.CapitalDeclarationDocuments as ClientCapitalDocument[]).filter(d => d.fileName.toLowerCase().includes(fileName.toLowerCase()))
        );

        return result;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

export async function updateTaxDocStatus(client_id: string, Document_url: string, isTreated:boolean) {
    const mongo = new MongoClient(DB_INFO.host);

    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);

        const result = await collection.updateOne(
            {
                _id: new ObjectId(client_id),
                "documents.Document_url": Document_url
            },
            { $set: { "documents.$.isTreated": isTreated } }
        );

        return result;
    } catch (error) {
        console.error('שגיאה בעדכון מסמך בדטה בייס:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

export async function updateCapitalDocStatus(client_id: string, Document_url: string, isTreated:boolean) {
    const mongo = new MongoClient(DB_INFO.host);

    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.clients_collection);

        const result = await collection.updateOne(
            {
                _id: new ObjectId(client_id),
                "CapitalDeclarationDocuments.Document_url": Document_url
            },
            { $set: { "CapitalDeclarationDocuments.$.isTreated": isTreated } }
        );

        return result;
    } catch (error) {
        console.error('שגיאה בעדכון מסמך בדטה בייס:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

export async function getTaxDocumentsCountsFromDb(clientId: string) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
      await mongo.connect();
      const collection = mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection);
  
      const client = await collection.findOne(
        { _id: new ObjectId(clientId) },
        { projection: { documents: 1 } }
      );
  
      if (client && client.documents) {
        const total = client.documents.length;
        const treated = client.documents.filter((doc: { isTreated: any; })=> doc.isTreated).length;
        const untreated = total - treated;
        return { total, treated, untreated };
      } else {
        return { total: 0, treated: 0, untreated: 0 };
      }
    } catch (error) {
      console.error('Error fetching tax documents counts from DB:', error);
      throw error;
    } finally {
      await mongo.close();
    }
  }
  
  export async function getCapitalDocumentsCountsFromDb(clientId: string) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
      await mongo.connect();
      const collection = mongo.db(DB_INFO.db).collection(DB_INFO.clients_collection);
  
      const client = await collection.findOne(
        { _id: new ObjectId(clientId) },
        { projection: { CapitalDeclarationDocuments: 1 } }
      );
  
      if (client && client.CapitalDeclarationDocuments) {
        const total = client.CapitalDeclarationDocuments.length;
        const treated = client.CapitalDeclarationDocuments.filter((doc: { isTreated: any; }) => doc.isTreated).length;
        const untreated = total - treated;
        return { total, treated, untreated };
      } else {
        return { total: 0, treated: 0, untreated: 0 };
      }
    } catch (error) {
      console.error('Error fetching capital documents counts from DB:', error);
      throw error;
    } finally {
      await mongo.close();
    }
  }