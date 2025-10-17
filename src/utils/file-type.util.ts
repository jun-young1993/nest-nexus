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

/**
 * MIME type to file extension mapping
 */
const MIMETYPE_TO_EXTENSION_MAP: Record<string, string> = {
  // Images
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/x-icon': 'ico',
  'image/heic': 'heic',
  'image/heif': 'heif',

  // Videos
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-flv': 'flv',
  'video/x-matroska': 'mkv',
  'video/webm': 'webm',
  'video/3gpp': '3gp',

  // Audio
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/flac': 'flac',
  'audio/aac': 'aac',
  'audio/ogg': 'ogg',
  'audio/x-ms-wma': 'wma',
  'audio/mp4': 'm4a',
  'audio/opus': 'opus',

  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'text/plain': 'txt',
  'application/rtf': 'rtf',

  // Archives
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/gzip': 'gz',
  'application/x-bzip2': 'bz2',
};

/**
 * Get file extension from MIME type
 * @param mimetype - The MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @param defaultExtension - Default extension if MIME type is not recognized (default: 'bin')
 * @returns The file extension without the dot (e.g., 'jpg', 'mp4')
 */
export function getExtensionFromMimetype(
  mimetype: string,
  defaultExtension: string = 'bin',
): string {
  if (!mimetype) {
    return defaultExtension;
  }
  return MIMETYPE_TO_EXTENSION_MAP[mimetype.toLowerCase()] || defaultExtension;
}

/**
 * Extension to MIME type mapping (reverse of MIMETYPE_TO_EXTENSION_MAP)
 */
const EXTENSION_TO_MIMETYPE_MAP: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
  heic: 'image/heic',
  heif: 'image/heif',

  // Videos
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  '3gp': 'video/3gpp',
  m4v: 'video/mp4',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  wma: 'audio/x-ms-wma',
  m4a: 'audio/mp4',
  opus: 'audio/opus',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  rtf: 'application/rtf',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',

  // Archives
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  bz2: 'application/x-bzip2',
  xz: 'application/x-xz',
};

/**
 * Get MIME type from file extension
 * @param extension - The file extension without the dot (e.g., 'jpg', 'mp4')
 * @param defaultMimetype - Default MIME type if extension is not recognized (default: 'application/octet-stream')
 * @returns The MIME type (e.g., 'image/jpeg', 'video/mp4')
 */
export function getMimetypeFromExtension(
  extension: string,
  defaultMimetype: string = 'application/octet-stream',
): string {
  if (!extension) {
    return defaultMimetype;
  }
  return EXTENSION_TO_MIMETYPE_MAP[extension.toLowerCase()] || defaultMimetype;
}

/**
 * Get MIME type from filename
 * @param filename - The filename with extension (e.g., 'photo.jpg', 'video.mp4')
 * @param defaultMimetype - Default MIME type if extension is not recognized (default: 'application/octet-stream')
 * @returns The MIME type (e.g., 'image/jpeg', 'video/mp4')
 */
export function getMimetypeFromFilename(
  filename: string,
  defaultMimetype: string = 'application/octet-stream',
): string {
  if (!filename) {
    return defaultMimetype;
  }
  const extension = getFileExtension(filename);
  if (!extension) {
    return defaultMimetype;
  }
  return getMimetypeFromExtension(extension, defaultMimetype);
}
