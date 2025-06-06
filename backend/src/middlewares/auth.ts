import { Request, Response, NextFunction } from 'express';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
