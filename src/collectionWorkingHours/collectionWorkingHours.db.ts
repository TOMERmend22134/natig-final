import { MongoClient, ObjectId, UpdateResult } from "mongodb";
import { collectionWorkingHours } from "./collectionWorkingHours.type";
import dotenv from 'dotenv';
import { Client } from "../clients/client.type";

dotenv.config();

const DB_INFO = {
    host: process.env.CONNECTION_STRING as string,
    db: process.env.DB_NAME as string,
    working_hours_collection: 'working_hours'
};

// פונקציה שמחזירה את שעות העבודה לפי מזהה עובד
export async function getWorkingHoursByWorkerId(workerId: ObjectId): Promise<any[]> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.working_hours_collection);
        const workingHours = await collection.find({ worker_id: workerId }).toArray();
        console.log('Working hours for worker:', workingHours);
        return workingHours;
    } catch (error) {
        console.error('Error fetching working hours:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמכניסה שעות עבודה למסד הנתונים
export async function insertHoursToDb(hours: collectionWorkingHours) {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.working_hours_collection);
        let doc = { worker_id: hours.worker_id, client_id: hours.client_id, day_of_work: null, start_hour: null, end_hour: null };
        collection.deleteOne(doc);
        return await collection.insertOne(hours);
    } catch (error) {
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמעדכנת שעות עבודה במסד הנתונים
export async function updateHoursInDb(updatedHours: any): Promise<UpdateResult> {
    const mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        const db = mongo.db(DB_INFO.db);
        const collection = db.collection(DB_INFO.working_hours_collection);
        const updateDoc = {
            $set: updatedHours
        };
        console.log('DB: updated hours:', updateDoc);

        const result = await collection.updateOne({ _id: new ObjectId(updatedHours._id) }, updateDoc);
        console.log('Update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating hours:', error);
        throw error;
    } finally {
        await mongo.close();
    }
}

// פונקציה שמחזירה את כל שעות העבודה של עובד לפי השאילתה
export async function getAllWorkerHours(query = {}, projection = {}): Promise<any> {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.working_hours_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    }
    finally {
        mongo.close();
    }
}

// פונקציה שמחזירה את כל שעות העבודה של לקוח לפי השאילתה
export async function getAllClientHours(query = {}, projection = {}): Promise<any> {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.working_hours_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    } finally {
        mongo.close();
    }
}

// פונקציה שמחזירה את כל שעות העבודה לפי שאילתה כללית
export async function getAllWorkingHours(query = {}, projection = {}): Promise<any> {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.working_hours_collection).find(query, { projection }).toArray();
    } catch (error) {
        throw error;
    }
    finally {
        mongo.close();
    }
}

// פונקציה שבודקת כמה שעות עבודה קיימות לפי שאילתה
export async function getWorkingHoursAmount(query = {}) {
    let mongo = new MongoClient(DB_INFO.host);
    try {
        await mongo.connect();
        return await mongo.db(DB_INFO.db).collection(DB_INFO.working_hours_collection).countDocuments(query);
    } catch (error) {
        throw error;
    }
    finally {
        mongo.close();
    }
}
