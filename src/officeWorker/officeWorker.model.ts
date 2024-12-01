import { WithId, Document, MongoClient, ObjectId } from "mongodb";
import { addClient, getClients, updateDoc, findAll, addClientToDatabase, deleteDoc, addWorkerToDatabase, getOfficeWorkerByIdFromDb, getOfficeWorkerByEmailFromDb, createMailingListInDb, getClientCapitalDocumentsFromDb, getClientDocumentsFromDb, getDocumentsByFileNameFromDb, getCapitalDocumentsByFileNameFromDb, updateTaxDocStatus, updateCapitalDocStatus, getTaxDocumentsCountsFromDb, getCapitalDocumentsCountsFromDb } from "./officeWorker.db";
import { officeWorker, Position, WorkerAddress } from "./officeWorker.type";
import { Client, ClientType, ClientDocument, ClientAddress } from "../clients/client.type";
import { collectionWorkingHours } from "../collectionWorkingHours/collectionWorkingHours.type";
import { insertHoursToDb } from "../collectionWorkingHours/collectionWorkingHours.db";


// מחזירה את כל הלקוחות ממסד הנתונים
export async function getAll() {
  return await getClients();
}

// מחזירה את הלקוחות לפי מזהה עובד
export async function getClientsByWorkerId(workerId: ObjectId) {
  let query = { assignedWorkerId: workerId };
  return await getClients(query);
}

// מחזירה לקוח לפי מזהה ID
export async function getById(id: string) {
  let query = { _id: new ObjectId(id) };
  let [client] = await getClients(query);
  return client;
}

// מחזירה לקוח לפי אימייל
export async function getByEmail(email: string) {
  let query = { email };
  let [client] = await getClients(query);
  return client;
}

// מחזירה פרטי עובד לפי מזהה ID
export async function getWorkerById(id: string) {
  let query = { _id: new ObjectId(id) };
  let projection = { password: 0 };
  let [officeworker] = await findAll(query, projection);
  return officeworker;
}

// מחזירה את פרטי עובד המשרד לפי אימייל
export async function getOfficeWorkerByEmail(email: string): Promise<officeWorker | null> {
  return await getOfficeWorkerByEmailFromDb(email);
}

// מחזירה את פרטי עובד המשרד לפי מזהה ייחודי
export async function getOfficeWorkerById(workerId: ObjectId): Promise<officeWorker | null> {
  return await getOfficeWorkerByIdFromDb(workerId);
}

// מוסיפה שעות עבודה למסד הנתונים
export async function insertHours(hours: collectionWorkingHours) {
  return await insertHoursToDb(hours);
}

// הוספת לקוח חדש למסד הנתונים
export async function insertClient(
  client_name: string,
  client_type: ClientType,
  address: ClientAddress,
  mobile_number: string,
  income_tax_file: number,
  vat_file_number: number,
  email: string,
  password: string,
  home_number?: string,
  documents?: ClientDocument[]
) {
  const newClient: Client = {
    _id: new ObjectId(),
    client_name,
    client_type,
    address,
    mobile_number,
    home_number,
    income_tax_file,
    vat_file_number,
    email,
    password,
    documents
  };

  return await addClientToDatabase(newClient);
}

// מאמתת אימייל וסיסמה של עובד
export async function findByEmailAndPassword(email: string, password: string) {
  let query = { email, password };
  let projection = { password: 0 };
  let officeworker = await findAll(query, projection);
  return officeworker[0];
}

// מעדכנת פרטי לקוח במסד הנתונים
export async function updateClientInDb(
  _id: ObjectId,
  updatedClient: Client
) {
  return await updateDoc(_id, updatedClient);
}

// מוחקת לקוח ממסד הנתונים לפי מזהה
export async function deleteClientFromDb(
  _id: ObjectId
) {
  return await deleteDoc(_id);
}

// הוספת עובד משרד חדש למסד הנתונים
export async function insertWorker(
  full_name: string,
  address: WorkerAddress,
  phone: string,
  home_phone: string,
  position: Position,
  personal_id: string,
  start_date: Date,
  email: string,
  password: string
) {
  const newWorker: officeWorker = {
    _id: new ObjectId(),
    full_name,
    address,
    phone,
    home_phone,
    position,
    personal_id,
    start_date,
    email,
    password
  };

  return await addWorkerToDatabase(newWorker);
}

// מחזירה רשימת לקוחות לפי סוג לקוח
export async function getClientsByType(clientType: string): Promise<{ _id: string; email: string; client_name: string; }[]> {
  const query = { client_type: clientType };
  const projection = { _id: 1, client_name: 1, email: 1 };
  const clients: WithId<Document>[] = await getClients(query, projection);

  return clients.map(client => ({
    _id: client._id.toString(),
    email: client.email as string,
    client_name: client.client_name as string
  }));
}

// מחזירה לקוחות לפי סוג לקוח ממודל מסוים
export async function getClientsByTypeFromModel(clientType: string) {
  const query = { client_type: clientType };
  const projection = { _id: 1, client_name: 1, email: 1 };
  const clients = await getClients(query, projection);
  return clients;
}



// יוצרת רשימת דיוור לפי סוג לקוח ושומרת אותה במסד הנתונים
export async function createMailingList(criteria: { clientType: string }) {
  const clients = await getClientsByType(criteria.clientType);

  const mailingList = {
    criteria: criteria,
    clients: clients.map(client => ({
      _id: client._id,
      email: client.email,
      client_name: client.client_name
    })),
    created_at: new Date()
  };

  return await createMailingListInDb(mailingList);
}

// מחזירה רשימת לקוחות לפי מזהים ייחודיים
export async function getClientsByIds(clientIds: string[]) {
  const clients = await getClients({ _id: { $in: clientIds.map(id => new ObjectId(id)) } });
  return clients;
}

// שליפת מסמכים רגילים של לקוח דרך המודל
export async function getClientDocumentsFromModel(clientId: string) {
  return await getClientDocumentsFromDb(clientId);
}

// שליפת מסמכי הון של לקוח דרך המודל
export async function getClientCapitalDocumentsFromModel(clientId: string) {
  return await getClientCapitalDocumentsFromDb(clientId);
}
// שליפת מסמכים רגילים לפי שם קובץ דרך המודל
export async function getDocumentsByFileNameFromModel(fileName: string, client_id: string) {
  return await getDocumentsByFileNameFromDb(fileName, client_id);
}

// שליפת מסמכי הון לפי שם קובץ דרך המודל
export async function getCapitalDocumentsByFileNameFromModel(fileName: string, client_id: string) {
  return await getCapitalDocumentsByFileNameFromDb(fileName, client_id);
}

// פונקציה שמעדכנת את הסטטוס של מסמך עבור לקוח
export async function updateDocStatus(client_id: string, array: string, Document_url: string, isTreated:boolean) {

  // אם המערך הוא 'documents', מעדכנים את סטטוס המסמך בטבלת המסמכים של מס
  if (array == 'documents') {
    return await updateTaxDocStatus(client_id, Document_url, isTreated);
  }
  // אחרת, מעדכנים את סטטוס המסמך בטבלת המסמכים של הון
  return await updateCapitalDocStatus(client_id, Document_url, isTreated);
}

// פונקציה שמחזירה את ספירת המסמכים מסוג מיסים מהמודל עבור לקוח מסוים
export async function getTaxDocumentsCountsFromModel(clientId: string) {
  return await getTaxDocumentsCountsFromDb(clientId);
}

// פונקציה שמחזירה את ספירת המסמכים מסוג הון מהמודל עבור לקוח מסוים
export async function getCapitalDocumentsCountsFromModel(clientId: string) {
  return await getCapitalDocumentsCountsFromDb(clientId);
}