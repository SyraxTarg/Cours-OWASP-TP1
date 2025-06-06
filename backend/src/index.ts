import 'dotenv/config'
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path'
import express from 'express';
import session, { Store } from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cors from 'cors'
import { initDb } from '@/database';
import authRoutes from '@/routes/auth';
import articleRoutes from '@/routes/articles';
import notFound from '@/middlewares/notFound';
import serveFrontend from '@/middlewares/serveFrontend';
import errorHandler from '@/middlewares/errorHandler';



async function main() {
  const devPort = process.env.DEV_PORT;
  const httpsPort = process.env.HTTPS_PORT;

  await initDb();
  const SQLiteStore = SQLiteStoreFactory(session) as (new (opts: any) => Store); // Problème de typage connect-sqlite

  const app = express();

  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? `https://localhost:${httpsPort}`
      : `http://localhost:8081`,
    credentials: true
  }));

  app.use(session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: './data',
      expires: 1 * 60 * 60, // 1 heure
    }),
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'session',
  }));

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/articles', articleRoutes);

  // en production, servir le build Vue
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../public')
    app.use(express.static(clientDist));
    app.use(serveFrontend(clientDist))
  }

  app.use(notFound)
  app.use(errorHandler)

  const certDir = path.resolve(__dirname, '..', 'certs');
  const options = {
    key: fs.readFileSync(path.join(certDir, 'key.pem')),
    cert: fs.readFileSync(path.join(certDir, 'cert.pem'))
  };

  if (process.env.NODE_ENV !== 'production') {
    http.createServer(app).listen(devPort, () => console.log(`🔓 HTTP Server (dev) on http://localhost:${devPort}`));
  } else {
    https.createServer(options, app).listen(httpsPort, () => console.log(`🔒 HTTPS Server listening on port ${httpsPort}`));
  }

}
  
main().catch(console.error);