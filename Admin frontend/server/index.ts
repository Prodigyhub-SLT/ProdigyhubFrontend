// server/index.ts - Updated server with proxy to Render backend

import express from "express";
import cors from "cors";

const BACKEND_URL = 'https://prodigyhub.onrender.com';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'https://prodigyhub.vercel.app',
      'https://prodigyhubfrontend2-git-main-jayalaths-projects.vercel.app',
      'https://prodigyhubfrontend2-gx1ki5hml-jayalaths-projects.vercel.app'
    ],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Generic proxy function
  const proxyRequest = async (req: express.Request, res: express.Response, targetPath: string) => {
    try {
      const url = `${BACKEND_URL}${targetPath}`;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      console.log(`Proxying ${req.method} ${req.originalUrl} -> ${fullUrl}`);

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Forward any authorization headers
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
      };

      // Add body for POST, PATCH, PUT requests
      if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
      }

      const response = await fetch(fullUrl, fetchOptions);
      
      console.log(`Response status: ${response.status}`);
      
      // Handle different response types
      if (response.status === 204) {
        res.status(204).send();
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        res.status(response.status).send(text);
      }
    } catch (error) {
      console.error(`Proxy error for ${targetPath}:`, error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to proxy request to backend',
        '@type': 'Error'
      });
    }
  };

  // Local health check (doesn't depend on external backend)
  app.get("/api/health", async (req, res) => {
    try {
      // Try to proxy to external backend first
      await proxyRequest(req, res, '/health');
    } catch (error) {
      // If external backend fails, return local health status
      res.json({ 
        status: "healthy",
        message: "Frontend server is running",
        backend: "offline",
        timestamp: new Date().toISOString()
      });
    }
  });

  // TMF620 - Product Catalog Management API
  app.all("/api/productCatalogManagement/v5/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // TMF637 - Product Inventory Management API
  app.all("/api/tmf-api/product*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  app.all("/api/tmf-api/hub*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // TMF679 - Product Offering Qualification API
  app.all("/api/productOfferingQualification/v5/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // TMF622 - Product Ordering Management API
  app.all("/api/productOrderingManagement/v4/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // TMF688 - Event Management API
  app.all("/api/eventManagement/v4/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // TMF760 - Product Configuration Management API
  app.all("/api/tmf-api/productConfigurationManagement/v5/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // Generic TMF API proxy for any other endpoints
  app.all("/api/tmf-api/*", async (req, res) => {
    const path = req.url.replace('/api', '');
    await proxyRequest(req, res, path);
  });

  // Fallback ping endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({ 
      message: "ProdigyHub Frontend Server", 
      backend: BACKEND_URL,
      status: "online",
      timestamp: new Date().toISOString()
    });
  });

  // Catch-all for unknown API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      error: "API endpoint not found",
      path: req.path,
      method: req.method,
      '@type': 'Error'
    });
  });

  return app;
}