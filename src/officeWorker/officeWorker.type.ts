// officeWorker.type.ts
import { ObjectId } from "mongodb";

export type officeWorker = {
    _id: ObjectId,
    full_name: string,
    address: WorkerAddress,
    phone: string,
    home_phone?: string,
    position: Position,
    personal_id: string,
    start_date: Date,
    email: string,
    password: string
}

export type WorkerAddress = {
    city: string | null,
    street: string | null,
    number: number | null,
    zip_code?: string | null
}

export type Position = 'Accountant' | 'Accounts Manager' | 'Payroll Accountant' | 'Intern' | 'Clerk';
