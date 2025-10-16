/**
 * File type categories
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  UNKNOWN = 'unknown',
}

/**
 * File extension to type mapping
 */
const FILE_TYPE_MAP: Record<string, FileType> = {
  // Images
  jpg: FileType.IMAGE,
  jpeg: FileType.IMAGE,
  png: FileType.IMAGE,
  gif: FileType.IMAGE,
  bmp: FileType.IMAGE,
  webp: FileType.IMAGE,
  svg: FileType.IMAGE,
  ico: FileType.IMAGE,
  tiff: FileType.IMAGE,
  tif: FileType.IMAGE,
  heic: FileType.IMAGE,
  heif: FileType.IMAGE,

  // Videos
  mp4: FileType.VIDEO,
  avi: FileType.VIDEO,
  mov: FileType.VIDEO,
  wmv: FileType.VIDEO,
  flv: FileType.VIDEO,
  mkv: FileType.VIDEO,
  webm: FileType.VIDEO,
  m4v: FileType.VIDEO,
  mpg: FileType.VIDEO,
  mpeg: FileType.VIDEO,
  '3gp': FileType.VIDEO,

  // Audio
  mp3: FileType.AUDIO,
  wav: FileType.AUDIO,
  flac: FileType.AUDIO,
  aac: FileType.AUDIO,
  ogg: FileType.AUDIO,
  wma: FileType.AUDIO,
  m4a: FileType.AUDIO,
  opus: FileType.AUDIO,

  // Documents
  pdf: FileType.DOCUMENT,
  doc: FileType.DOCUMENT,
  docx: FileType.DOCUMENT,
  xls: FileType.DOCUMENT,
  xlsx: FileType.DOCUMENT,
  ppt: FileType.DOCUMENT,
  pptx: FileType.DOCUMENT,
  txt: FileType.DOCUMENT,
  rtf: FileType.DOCUMENT,
  odt: FileType.DOCUMENT,
  ods: FileType.DOCUMENT,
  odp: FileType.DOCUMENT,

  // Archives
  zip: FileType.ARCHIVE,
  rar: FileType.ARCHIVE,
  '7z': FileType.ARCHIVE,
  tar: FileType.ARCHIVE,
  gz: FileType.ARCHIVE,
  bz2: FileType.ARCHIVE,
  xz: FileType.ARCHIVE,
};

/**
 * Extract file extension from filename
 * @param filename - The original filename
 * @returns The file extension in lowercase without the dot
 */
export function getFileExtension(filename: string): string {
  if (!filename) {
    return '';
  }
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Get file type category based on the original filename
 * @param originalName - The original filename with extension
 * @returns The file type category (image, video, audio, document, archive, unknown)
 */
export function getFileType(originalName: string): FileType {
  if (!originalName) {
    return FileType.UNKNOWN;
  }
  const extension = getFileExtension(originalName);
  return FILE_TYPE_MAP[extension] || FileType.UNKNOWN;
}

/**
 * Check if file is an image
 * @param originalName - The original filename with extension
 * @returns True if the file is an image
 */
export function isImageFile(originalName: string): boolean {
  return getFileType(originalName) === FileType.IMAGE;
}

/**
 * Check if file is a video
 * @param originalName - The original filename with extension
 * @returns True if the file is a video
 */
export function isVideoFile(originalName: string): boolean {
  return getFileType(originalName) === FileType.VIDEO;
}

/**
 * Check if file is an audio
 * @param originalName - The original filename with extension
 * @returns True if the file is an audio
 */
export function isAudioFile(originalName: string): boolean {
  return getFileType(originalName) === FileType.AUDIO;
}

/**
 * Check if file is a document
 * @param originalName - The original filename with extension
 * @returns True if the file is a document
 */
export function isDocumentFile(originalName: string): boolean {
  return getFileType(originalName) === FileType.DOCUMENT;
}

/**
 * Check if file is an archive
 * @param originalName - The original filename with extension
 * @returns True if the file is an archive
 */
export function isArchiveFile(originalName: string): boolean {
  return getFileType(originalName) === FileType.ARCHIVE;
}

