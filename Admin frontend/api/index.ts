import { createServer } from '../server';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = createServer();

// Vercel serverless function handler - only for API routes
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only handle API routes
  if (req.url?.startsWith('/api/')) {
    return new Promise((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }
  
  // For non-API routes, let Vercel serve the static files
  res.status(404).json({ error: "Not found" });
}
