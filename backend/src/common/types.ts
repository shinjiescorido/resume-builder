import { Request } from 'express';

export interface AuthedRequest extends Request {
  user: { sub: string; username: string };
}
