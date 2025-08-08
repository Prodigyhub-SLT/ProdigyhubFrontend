import { createServer } from '../server';
import express from 'express';
import path from 'path';

const app = createServer();

// Serve static files from the built SPA
app.use(express.static(path.join(process.cwd(), 'dist/spa')));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(process.cwd(), 'dist/spa/index.html'));
});

// Export for Vercel serverless
export default app;
