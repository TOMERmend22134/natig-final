import { ObjectId } from "mongodb";

export type collectionWorkingHours = {
    _id?: ObjectId,
    worker_id: ObjectId,
    client_id: ObjectId,
    day_of_work: string, 
    start_hour: string,   
    end_hour: string     
}
