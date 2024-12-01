// client.type.ts
import { ObjectId } from "mongodb";

export type ClientDocument = {
    Document_name: string;
    Document_url: string;
    fileName: string;
    dateUploaded: Date;
    isTreated: boolean;
};
export type ClientCapitalDocument = {
    Document_name: string;
    Document_url: string;
    fileName: string;
    dateUploaded: Date;
    isTreated: boolean;
};

export type Client = {
    _id: ObjectId;
    client_name: string;
    client_type: ClientType;
    address: ClientAddress;
    mobile_number: string;
    home_number?: string;
    income_tax_file: number;
    vat_file_number: number;
    email: string;
    password: string;
    documents?: ClientDocument[]; 
    CapitalDeclarationDocuments?:ClientCapitalDocument[];
};


export type ClientAddress = {
    city: string | null,
    street: string | null,
    number: number | null,
    zip_code?: string | null
}



export type ClientType = 'Companies' | 'Licensed dealer' | 'Exempt dealer' | 'Controlling employee' | 'Other' | 'General';
