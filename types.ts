export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface ProcessingResult {
  original: ImageFile;
  processedBase64: string | null;
}