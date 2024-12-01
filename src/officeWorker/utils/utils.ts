import { genSaltSync, compareSync, hashSync } from 'bcryptjs';




// פונקציה שמצפינה סיסמה באמצעות bcrypt
export function encryptPassword(password: string): string {
    let salt = genSaltSync(10);
    let hashPassword = hashSync(password, salt);
    return hashPassword;
}

// פונקציה שבודקת האם סיסמה רגילה תואמת לסיסמה המוצפנת
export function decryptPassword(password: string, hashPassword: string): boolean {
    return compareSync(password, hashPassword);
}
