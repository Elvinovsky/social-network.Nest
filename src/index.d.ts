declare global {
  namespace Express {
    export interface Request {
      userId: string;
      issuedAt: number;
      deviceId: string;
    }
  }
}
