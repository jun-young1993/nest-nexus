import * as crypto from 'crypto';

const IV_LENGTH = 16; // 초기화 벡터 길이

function ensureKeyLength(key: string): Buffer {
    return crypto.createHash('sha256').update(key).digest(); // SHA-256으로 32바이트 키 생성
}

export function encrypt(text: string, secret_key: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = ensureKeyLength(secret_key); // 키 길이 보장
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted: string, secret_key: string): string {
    const textParts = encrypted.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const key = ensureKeyLength(secret_key); // 키 길이 보장
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
