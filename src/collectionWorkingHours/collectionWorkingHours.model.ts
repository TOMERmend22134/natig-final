import { collectionWorkingHours } from './collectionWorkingHours.type';
import { getAllClientHours, getAllWorkerHours, getAllWorkingHours, getWorkingHoursAmount, insertHoursToDb, updateHoursInDb } from './collectionWorkingHours.db';
import { ObjectId } from 'mongodb';

// פונקציה שמכניסה שעות עבודה למסד הנתונים
export async function insertHours(hours: collectionWorkingHours) {
    return await insertHoursToDb(hours);
}

// פונקציה שמעדכנת שעות עבודה במסד הנתונים
export async function updateHours(updatedHours: any) {
    return await updateHoursInDb(updatedHours);
}

// פונקציה שמחזירה את שעות העבודה של עובד לפי מזהה העובד
export async function getWorkerHoursByWorkerId(worker_id: string) {
    let query = { worker_id: new ObjectId(worker_id) };
    let projection = {
        _id: 1,
        worker_id: 1,
        client_id: 1,
        day_of_work: 1,
        start_hour: 1,
        end_hour: 1
    };
    let worker_hours = await getAllWorkerHours(query, projection);
    return worker_hours;
}

// פונקציה שמחזירה את שעות העבודה של לקוח לפי מזהה הלקוח
export async function getClientHoursByWorkerId(client_id: string) {
    let query = { client_id: new ObjectId(client_id) };
    console.log('client_id', client_id);
    let projection = {
        _id: 1,
        worker_id: 1,
        client_id: 1,
        day_of_work: 1,
        start_hour: 1,
        end_hour: 1
    };
    let client_hours = await getAllClientHours(query, projection);
    console.log('client_hours', client_hours);
    return client_hours;
}

// פונקציה שמחזירה את מזהה הרשומה לפי מזהה עובד ומזהה לקוח
export async function getIdByWorkerAndClient(worker_id: string, client_id: string) {
    let query = { worker_id: new ObjectId(worker_id), client_id: new ObjectId(client_id) };
    console.log('worker_id', worker_id);
    console.log('client_id', client_id);

    let projection = {
        _id: 1,
        worker_id: 1,
        client_id: 1,
        day_of_work: 1,
        start_hour: 1,
        end_hour: 1
    };

    // קריאה למסד הנתונים להחזרת שעות העבודה של העובד לפי שאילתה
    let worker_hours = await getAllWorkerHours(query, projection);
    console.log('worker_hours', worker_hours);
    for (let record of worker_hours) {
        if (record.client_id.toString() === new ObjectId(client_id).toString()) {
            return record._id;
        }
    }
    return null;
}

// פונקציה שמחזירה את שעות העבודה לפי שילוב של עובד ולקוח
export async function getWorkingHoursCombination(worker_id: string, client_id: string) {
    let query = { worker_id: new ObjectId(worker_id), client_id: new ObjectId(client_id) };
    let projection = {
        _id: 1,
        worker_id: 1,
        client_id: 1,
        day_of_work: 1,
        start_hour: 1,
        end_hour: 1
    };
    let working_hours = await getAllWorkingHours(query, projection);
    return working_hours;
}

// פונקציה שבודקת אם שעות העבודה החדשות כבר קיימות במסד הנתונים
export async function getCheckHoursValidation(newHours: collectionWorkingHours) {
    let query = { worker_id: newHours.worker_id, day_of_work: newHours.day_of_work, start_hour: newHours.start_hour, end_hour: newHours.end_hour };
    let amount = await getWorkingHoursAmount(query);
    return amount == 0;
}
