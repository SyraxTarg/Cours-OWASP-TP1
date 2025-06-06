import { db } from '@/database';
import { Request, Response } from 'express';

// Inscription
export async function register(req: Request, res: Response): Promise<any> {
  const { username, password } = req.body;
  await db.run(
    `INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`,
    username, password
  );
  res.status(201).json({ message: 'User registered' });
}

// Connexion
export async function login(req: Request, res: Response): Promise<any> {
  const { username, password } = req.body;
  const user = await db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  req.session.user = { id: user.id, role: user.role };
  res.json(user);
}

// Déconnexion
export async function logout(_req: Request, res: Response): Promise<any> {
  res.clearCookie('session').json({ message: 'Logged out' });
}

// Retourne les infos de l’utilisateur connecté
export async function me(req: Request, res: Response): Promise<any> {
  const userId = req.session.user!.id
  const user = await db.get(`SELECT * FROM users WHERE id = ?`, userId);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(user);
}
