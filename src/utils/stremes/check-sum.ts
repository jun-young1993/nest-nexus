import * as crypto from 'crypto';
import { Readable } from 'stream';

export async function calculateChecksum(
  stream: Readable,
  hashAlgorithm: 'sha256' | 'sha512' = 'sha256',
): Promise<string> {
  const hash = crypto.createHash(hashAlgorithm);

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Uint8Array) => {
      hash.update(chunk);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}
