import { Request, Response, NextFunction } from 'express';

export default function roleRequired(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user && req.session.user.role === requiredRole) {
      return next();
    }
    res.status(403).json({ error: 'Forbidden' });
  };
}
