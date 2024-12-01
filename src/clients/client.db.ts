import { MongoClient, ObjectId } from "mongodb";
import { Client, ClientCapitalDocument, ClientDocument } from "./client.type";
import dotenv from 'dotenv';

dotenv.config();

const DB_INFO = {
    host: process.env.CONNECTION_STRING as string,
    db: process.env.DB_NAME as string,
    collection: 'clients'
};

// פונקציה שמחזירה רשימת לקוחות לפי שאילתה כללית ומאפשרת להגדיר פרויקציה להצגת שדות ספציפיים
export async function getClients(query = {}, projection = {}): Promise<Client[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const clients = await mongo.db(DB_INFO.db).collection(DB_INFO.collection).find(query, { projection }).toArray();
        return clients as Client[];
    } catch (error) {
        throw error;
    } finally {
        mongo.close();
    }
}

// פונקציה שמחזירה לקוחות לפי רשימת מזהים
export async function getClientsByIds(clientIds: ObjectId[]): Promise<Client[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.collection);
        console.log('Client IDs for query:', clientIds);
        const clients = await collection.find({ _id: { $in: clientIds } }).toArray();
        console.log('Clients:', clients);
        return clients as Client[];
    } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמחזירה לקוחות לפי רשימת מזהים ממסד הנתונים
export async function getClientsFromDb(ids: ObjectId[]): Promise<Client[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const clients = await mongo.db(DB_INFO.db).collection(DB_INFO.collection).find({ _id: { $in: ids } }).toArray();
        console.log('Fetched clients by IDs:', clients);
        return clients as Client[];
    } catch (error) {
        console.error('Error fetching clients by IDs:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמחזירה לקוח לפי אימייל ממסד הנתונים
export async function getClientByEmailFromDb(email: string): Promise<Client | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.collection);
        const client = await collection.findOne({ email: email });
        console.log('Client:', client);
        return client as Client | null;
    } catch (error) {
        console.error('Error fetching client by email:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמחזירה לקוח לפי מזהה לקוח ממסד הנתונים
export async function getClientByIdFromDb(client_id: ObjectId): Promise<Client | null> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.collection);
        const client = await collection.findOne({ _id: client_id });
        return client as Client | null;
    } catch (error) {
        console.error('Error fetching client:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמוסיפה מסמך רגיל ללקוח לפי מזהה הלקוח בדאטהבייס
export async function addDocumentToClientInDb(clientId: ObjectId, doc: ClientDocument): Promise<boolean> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);

        const client = await db.collection(DB_INFO.collection).findOne({ _id: new ObjectId(clientId) });
        if (!client) {
            throw new Error('Client not found');
        }

        const documents = client.documents || [];
        documents.push(doc);

        const result = await db.collection(DB_INFO.collection).updateOne(
            { _id: new ObjectId(clientId) },
            { $set: { documents: documents } }
        );

        return result.modifiedCount > 0;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}
// פונקציה שמוסיפה מסמך הון ללקוח לפי מזהה הלקוח בדאטהבייס
export async function addCapitalDocumentToClientInDb(clientId: ObjectId, doc: ClientCapitalDocument): Promise<boolean> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);

        const client = await db.collection(DB_INFO.collection).findOne({ _id: new ObjectId(clientId) });
        if (!client) {
            throw new Error('Client not found');
        }

        const capitalDocuments = client.CapitalDeclarationDocuments || [];
        capitalDocuments.push(doc);

        const result = await db.collection(DB_INFO.collection).updateOne(
            { _id: new ObjectId(clientId) },
            { $set: { CapitalDeclarationDocuments: capitalDocuments } }
        );

        return result.modifiedCount > 0;
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}
// פונקציה שמחזירה את כל המסמכים של לקוח לפי מזהה הלקוח ממסד הנתונים
export async function getDocumentsFromDb(clientId: ObjectId): Promise<ClientDocument[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const client = await db.collection(DB_INFO.collection).findOne({ _id: clientId });

        if (client && client.documents) {
            return client.documents; 
        } else {
            return []; 
        }
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}
// פונקציה לעדכון לקוח בדטה בייס
export async function updateClientInDatabase(clientId: ObjectId, updatedClientData: Partial<Client>) {
    const mongo = new MongoClient(DB_INFO.host);
  
    try {
      await mongo.connect();
      const db = mongo.db(DB_INFO.db);
      const collection = db.collection(DB_INFO.collection);
  
      const result = await collection.updateOne(
        { _id: clientId },
        { $set: updatedClientData }
      );
  
      return result;
    } catch (error) {
      console.error('שגיאה בעדכון לקוח בדטה בייס:', error);
      throw error;
    } finally {
      await mongo.close();
    }
  }
