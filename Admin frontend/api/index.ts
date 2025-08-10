import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Vercel API is working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}
