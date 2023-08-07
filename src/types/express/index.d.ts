declare global {
  export namespace Express {
    export interface Request {
      issuedAt: number;
      deviceId: string;
      userId: string;
    }
  }
}
export * from './dist';
