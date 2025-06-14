import { CompanyPostingsService } from './company-postings.service';
import { CompanyPostingRepository } from '../repositories/company-posting.repository';
// import { CompanyDB } from '../mocks/company.db'; // Removed unused import
import { Posting } from '../models/posting.model';
import { ApiError } from '../errors/api.error';

describe('CompanyPostingsService', () => {
    let service: CompanyPostingsService;
    let mockRepository: jest.Mocked<CompanyPostingRepository>;
    let mockCompanyDB: {
        getCompanyById: jest.Mock<any, any>;
        getCompaniesByIds: jest.Mock<Promise<Map<string, { id: string; name: string }>>, [string[]]>;
    };

    const mockPostings: Posting[] = [
        {
            id: '1',
            companyId: 'company1',
            freight: {
                weightPounds: 1000,
                equipmentType: 'Van',
                fullPartial: 'Full',
                lengthFeet: 53
            }
        },
        {
            id: '2',
            companyId: 'company2',
            freight: {
                weightPounds: 2000,
                equipmentType: 'Reefer',
                fullPartial: 'Partial',
                lengthFeet: 48
            }
        }
    ];

    const mockCompanies = new Map([
        ['company1', { id: 'company1', name: 'Company One' }],
        ['company2', { id: 'company2', name: 'Company Two' }]
    ]);

    beforeEach(() => {
        mockRepository = {
            getPostings: jest.fn(),
            createPosting: jest.fn()
        } as any;

        mockCompanyDB = {
            getCompanyById: jest.fn(),
            getCompaniesByIds: jest.fn()
        };

        service = new CompanyPostingsService(mockRepository, mockCompanyDB as any);
    });

    describe('getFilteredPostings', () => {
        it('should return all postings when no filters are applied', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockResolvedValue(mockCompanies);
            const result = await service.getFilteredPostings({ page: 1, limit: 10 });
            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.data[0].companyName).toBe('Company One');
            expect(result.data[1].companyName).toBe('Company Two');
        });

        it('should filter postings by companyId', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockResolvedValue(mockCompanies);
            const result = await service.getFilteredPostings({ companyId: 'company1', page: 1, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.data[0].companyId).toBe('company1');
            expect(result.data[0].companyName).toBe('Company One');
        });

        it('should filter postings by equipmentType', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockResolvedValue(mockCompanies);
            const result = await service.getFilteredPostings({ equipmentType: 'Van', page: 1, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.data[0].freight.equipmentType).toBe('Van');
        });

        it('should handle pagination correctly', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockResolvedValue(mockCompanies);
            const result = await service.getFilteredPostings({ page: 1, limit: 1 });
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(1);
        });

        it('should return empty array for out of bounds page', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockResolvedValue(mockCompanies);
            const result = await service.getFilteredPostings({ page: 999, limit: 10 });
            expect(result.data).toHaveLength(0);
            expect(result.total).toBe(2);
            expect(result.page).toBe(999);
            expect(result.limit).toBe(10);
        });

        it('should throw ApiError when company is not found', async () => {
            mockRepository.getPostings.mockResolvedValue(mockPostings);
            mockCompanyDB.getCompaniesByIds.mockRejectedValue(new Error('Company not found'));
            await expect(service.getFilteredPostings({ page: 1, limit: 10 })).rejects.toThrow(ApiError);
            await expect(service.getFilteredPostings({ page: 1, limit: 10 })).rejects.toMatchObject({
                statusCode: 404,
                message: 'Company not found'
            });
        });
    });
});