import { Request, Response } from 'express';
import { getCheckHoursValidation, getClientHoursByWorkerId, getIdByWorkerAndClient, getWorkerHoursByWorkerId, getWorkingHoursCombination, insertHours, updateHours } from './collectionWorkingHours.model';
import { ObjectId } from 'mongodb';



// פונקציה שמוסיפה שעות עבודה חדשות לעובד ולקוח במסד הנתונים
export async function addHours(req: Request, res: Response) {
    try {
        // שליפת הנתונים מהבקשה
        const { worker_id, client_id, day_of_work, start_hour, end_hour } = req.body;

        // הדפסת הנתונים כדי לוודא שהכל מגיע כמו שצריך
        console.log('Received Data:', { worker_id, client_id, day_of_work, start_hour, end_hour });

        // בדיקה שכל השדות קיימים ולא ריקים
        if (!worker_id || !client_id || !day_of_work || !start_hour || !end_hour) {
            console.log('Missing fields:', { worker_id, client_id, day_of_work, start_hour, end_hour });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // המרת worker_id ו-client_id ל-ObjectId
        const workerObjectId = new ObjectId(worker_id);
        const clientObjectId = new ObjectId(client_id);

        console.log('Worker ObjectId:', workerObjectId);
        console.log('Client ObjectId:', clientObjectId);

        // יצירת אובייקט חדש לשמירה במסד הנתונים
        const newHours = {
            worker_id: workerObjectId,
            client_id: clientObjectId,
            day_of_work,
            start_hour,
            end_hour
        };

        // בדיקה אם אפשר להוסיף את השעות
        const canAddHours = await getCheckHoursValidation(newHours);
        if (canAddHours) {
            const result = await insertHours(newHours);
            if (result.acknowledged) {
                console.log('Hours added successfully');
                return res.status(200).json({ success: true, message: 'Hours added successfully', redirectUrl: `/manageClients?worker_id=${worker_id}` });
            } else {
                console.log('Failed to add hours');
                return res.status(500).json({ message: 'Failed to add working hours' });
            }
        } else {
            return res.status(400).json({ message: 'You have already worked on those hours.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An internal error occurred' });
    }
}


// פונקציה שמעדכנת שעות עבודה במסד הנתונים עבור עובד ולקוח מסוימים
export async function changeHours(req: Request, res: Response) {
    try {
        const { worker_id, client_id, hour_id, day_of_work, start_hour, end_hour } = req.body;

        const updatedFields: any = {};
        if (day_of_work) updatedFields.day_of_work = day_of_work;
        if (start_hour) updatedFields.start_hour = start_hour;
        if (end_hour) updatedFields.end_hour = end_hour;
        updatedFields.worker_id = new ObjectId(worker_id);

        // בדיקה האם ניתן לעדכן את השעות על סמך ולידציה
        const canAddHours = await getCheckHoursValidation(updatedFields);
        if (canAddHours) {
            const result = await updateHours({ _id: new ObjectId(hour_id), ...updatedFields });
            if (result.modifiedCount > 0) {
                res.json({ success: true, message: 'Hours updated successfully' });
            } else {
                res.status(400).json({ message: 'Failed to update hours' });
            }
        } else {
            res.status(500).json({ message: 'You have already worked on those hours.' });
        }
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

// פונקציה שמחזירה את שעות העבודה של עובד לפי מזהה העובד
export async function getWorkerHours(req: Request, res: Response) {
    try {
        let { worker_id } = req.params;

        if (worker_id.length != 24)
            return res.status(403).json({ message: 'invalid id' });

        let worker_hours = await getWorkerHoursByWorkerId(worker_id);

        if (!worker_hours)
            res.status(404).json({ message: 'Worker hours not found' });
        else
            res.status(200).json({ worker_hours });
    } catch (error) {
        res.status(500).json({ error });
    }
}

// פונקציה שמחזירה את שעות העבודה של לקוח לפי מזהה הלקוח
export async function getClientHours(req: Request, res: Response) {
    try {
        let { client_id } = req.params;

        if (client_id.length != 24) {
            return res.status(403).json({ message: 'invalid id' });
        }

        console.log(client_id);

        let client_hours = await getClientHoursByWorkerId(client_id);

        if (!client_hours) {
            res.status(404).json({ message: 'No hours found for this client.' });
        } else {
            res.status(200).json({ client_hours });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

// פונקציה שמחזירה את שעות העבודה עבור עובד ולקוח לפי מזהים
export async function getWorkingHours(req: Request, res: Response) {
    try {
        let { worker_id, client_id } = req.params;

        if (worker_id.length != 24 || client_id.length != 24)
            return res.status(403).json({ message: 'invalid id' });

        console.log(worker_id, client_id);

        let working_hours = await getWorkingHoursCombination(worker_id, client_id);

        if (!working_hours)
            res.status(404).json({ message: 'Worker hours not found' });
        else
            res.status(200).json({ working_hours });
    } catch (error) {
        res.status(500).json({ error });
    }
}
