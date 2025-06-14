import { Express } from 'express';
import { createServer } from '../../index';
import { CompanyDB } from '../../mocks/company.db';
import { CompanyPostingRepository } from '../../repositories/company-posting.repository';
import postingAPIServer from '../../mocks/posting-api-mock-server';

const MOCK_API_URL = 'http://localhost:3000';

export interface TestContext {
    app: Express;
    companyDB: CompanyDB;
    repository: CompanyPostingRepository;
}

export async function setupTestServer(): Promise<TestContext> {
    // Initialize mock API server
    postingAPIServer();

    const companyDB = new CompanyDB();
    const repository = new CompanyPostingRepository(MOCK_API_URL);
    const app = await createServer(companyDB, repository);

    return {
        app,
        companyDB,
        repository
    };
}
