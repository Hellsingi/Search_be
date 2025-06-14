import request from 'supertest';
import { setupTestServer, TestContext } from './setup';
import { Posting } from '../../models/posting.model';

describe('Company Postings API Integration Tests', () => {
    let context: TestContext;

    beforeAll(async () => {
        context = await setupTestServer();
    });

    describe('GET /api/company-postings', () => {
        it('should return all postings with pagination', async () => {
            const response = await request(context.app)
                .get('/api/company-postings')
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.pagination).toHaveProperty('total');
            expect(response.body.pagination).toHaveProperty('page', 1);
            expect(response.body.pagination).toHaveProperty('limit', 10);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter postings by companyId', async () => {
            const response = await request(context.app)
                .get('/api/company-postings')
                .query({ companyId: '1', page: 1, limit: 10 })
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].companyName).toBeDefined();
        });

        it('should filter postings by equipmentType', async () => {
            const response = await request(context.app)
                .get('/api/company-postings')
                .query({ equipmentType: 'Reefer', page: 1, limit: 10 })
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].freight.equipmentType).toBe('Reefer');
        });

        it('should return 200 for invalid filter parameters (passthrough schema)', async () => {
            const response = await request(context.app)
                .get('/api/company-postings')
                .query({ invalidParam: 'value', page: 1, limit: 10 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });
    });

    describe('POST /api/company-postings', () => {
        const validPosting: Partial<Posting> = {
            companyId: '1',
            freight: {
                weightPounds: 1000,
                equipmentType: 'Van',
                fullPartial: 'Full',
                lengthFeet: 53
            }
        };

        it('should create a new posting', async () => {
            const response = await request(context.app)
                .post('/api/company-postings')
                .send(validPosting)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.companyId).toBe(validPosting.companyId);
            expect(response.body.freight).toEqual(validPosting.freight);
        });

        it('should return 400 for invalid posting data', async () => {
            const invalidPosting = {
                companyId: '1',
                freight: {
                    // Missing required fields
                }
            };

            const response = await request(context.app)
                .post('/api/company-postings')
                .send(invalidPosting)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 404 for non-existent company', async () => {
            const postingWithInvalidCompany = {
                ...validPosting,
                companyId: 'non-existent-company'
            };

            const response = await request(context.app)
                .post('/api/company-postings')
                .send(postingWithInvalidCompany)
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });
});