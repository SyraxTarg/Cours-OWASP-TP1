import { Request, Response, NextFunction } from 'express';
import path from 'node:path';


export default function serveFrontend(frontendFolder: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') return res.sendFile(path.join(frontendFolder, 'index.html'));
    next();
  }
}
