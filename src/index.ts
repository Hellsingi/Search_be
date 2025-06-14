import express, { Express } from 'express';
import * as dotenv from 'dotenv';
import postingAPIServer from './mocks/posting-api-mock-server';
import { CompanyDB } from './mocks/company.db';
import { CompanyPostingsController } from './controllers/company-postings.controller';
import { CompanyPostingsService } from './services/company-postings.service';
import { CompanyPostingRepository } from './repositories/company-posting.repository';

dotenv.config();

postingAPIServer();

const app: Express = express();
const port = process.env.PORT || 3000;
const apiUrl = process.env.API_URL || '';

const companyPostingsRouter = express.Router();

const companyDB = new CompanyDB();
const companyPostingRepository = new CompanyPostingRepository(apiUrl);
const companyPostingsService = new CompanyPostingsService(companyDB, companyPostingRepository);
const companyPostingsController = new CompanyPostingsController(companyPostingsService);

app.use(express.json());
app.use('/api', companyPostingsRouter);

companyPostingsRouter.get('/company-postings', (req, res) => companyPostingsController.get(req, res));
companyPostingsRouter.post('/company-postings', (req, res) => companyPostingsController.post(req, res));

const server = app.listen(port, () => {
  const address = server.address();
  const serverUrl = typeof address === 'string'
    ? address
    : `http://${address?.address === '::' ? 'localhost' : address?.address}:${address?.port}`;

  console.log(`⚡️[server]: Server is running at ${serverUrl}`);
});
