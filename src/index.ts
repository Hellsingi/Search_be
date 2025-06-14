import express from 'express';
import * as dotenv from 'dotenv';
import { CompanyDB } from './mocks/company.db';
import { CompanyPostingsController } from './controllers/company-postings.controller';
import { CompanyPostingsService } from './services/company-postings.service';
import { CompanyPostingRepository } from './repositories/company-posting.repository';
import postingAPIServer from './mocks/posting-api-mock-server';

dotenv.config();

const PORT = process.env.PORT || 3001;
const MOCK_API_URL = 'http://localhost:3000';

export async function createServer(
  companyDB: CompanyDB,
  repository: CompanyPostingRepository
) {
  const app = express();
  app.use(express.json());

  // Initialize mock API server
  postingAPIServer();

  // Initialize services and controllers
  const service = new CompanyPostingsService(repository, companyDB);
  const controller = new CompanyPostingsController(service);

  // Setup routes
  app.get('/api/company-postings', (req, res) => controller.get(req, res));
  app.post('/api/company-postings', (req, res) => controller.post(req, res));

  return app;
}

if (require.main === module) {
  const repository = new CompanyPostingRepository(MOCK_API_URL);
  const companyDB = new CompanyDB();

  createServer(companyDB, repository).then((app) => {
    const server = app.listen(PORT, () => {
      const address = server.address();
      const serverUrl =
        typeof address === 'string'
          ? address
          : `http://${
              address?.address === '::' ? 'localhost' : address?.address
            }:${address?.port}`;

      console.log(`⚡️[server]: Server is running at ${serverUrl}`);
    });
  });
}
