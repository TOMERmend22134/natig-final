import { MongoClient, ObjectId } from "mongodb";
import { addCapitalDocumentToClientInDb, addDocumentToClientInDb, getClientByEmailFromDb, getClients, getClientsFromDb, getDocumentsFromDb, updateClientInDatabase } from "./client.db";
import { Client, ClientCapitalDocument, ClientDocument } from "./client.type";



// פונקציה שמחפשת לקוח לפי אימייל וסיסמה ומחזירה את פרטי הלקוח ללא הסיסמה
export async function findByEmailAndPassword(email: string, password: string): Promise<any> {
  let query = { email, password };
  let projection = { password: 0 }; 
  let client = await getClients(query, projection);
  return client[0];
}

// פונקציה שמחזירה רשימת לקוחות לפי רשימת מזהים
export async function getClientsByIds(ids: ObjectId[]): Promise<Client[]> {
  return await getClientsFromDb(ids);
}

// פונקציה שמחזירה לקוח לפי אימייל, או null אם הלקוח לא נמצא
export async function getClientByEmail(email: string): Promise<Client | null> {
  return await getClientByEmailFromDb(email);
}

// פונקציה שמחזירה לקוח לפי אימייל
export async function getByEmail(email: string) {
  let query = { email };
  let [client] = await getClients(query);
  return client;
}

// פונקציה במודל שמטפלת בקריאה להוספת מסמך רגיל ללקוח
export async function addDocumentToClient(clientId: string, doc: ClientDocument): Promise<boolean> {
  const clientObjectId = new ObjectId(clientId);
  return await addDocumentToClientInDb(clientObjectId, doc);
}
// פונקציה במודל שמטפלת בקריאה להוספת מסמך הון ללקוח
export async function addCapitalDocumentToClient(clientId: string, doc: ClientCapitalDocument): Promise<boolean> {
  const clientObjectId = new ObjectId(clientId);
  return await addCapitalDocumentToClientInDb(clientObjectId, doc);
}

// פונקציה שמחזירה את כל המסמכים של לקוח לפי מזהה הלקוח
export async function getClientDocuments(clientId: string): Promise<ClientDocument[]> {
  const clientObjectId = new ObjectId(clientId);
  return await getDocumentsFromDb(clientObjectId);
}

// פונקציה לעדכון פרטי לקוח
export async function updateClientInDb(clientId: ObjectId, updatedClientData: Partial<Client>) {
  return await updateClientInDatabase(clientId, updatedClientData); // קריאה לפונקציה שמעדכנת את הדטה בייס
}
