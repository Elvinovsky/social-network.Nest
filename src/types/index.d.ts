declare global {
  export namespace Express {
    export interface Request {
      issuedAt: number;
      deviceId: string;
    }
  }
}
export * from './dist';
