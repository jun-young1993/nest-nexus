import { Readable } from 'stream';
import { streamToBuffer } from '../stremes/strem-to-buffer';
import * as sharp from 'sharp';

export async function streamToBufferResize(
  stream: Readable,
  size: number,
): Promise<Buffer> {
  const buffer = await streamToBuffer(stream);
  return await sharp(buffer).resize(size).toBuffer();
}
