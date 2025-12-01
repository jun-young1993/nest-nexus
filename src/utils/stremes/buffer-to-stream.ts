import { Readable } from 'stream';

export function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

