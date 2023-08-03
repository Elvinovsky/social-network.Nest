declare global {
  export namespace Express {
    export interface Request {
      userId: string;
      issuedAt: number;
      deviceId: string;
    }
  }
}
export * from './dist';
