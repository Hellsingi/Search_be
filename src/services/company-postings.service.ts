import { CompanyDB } from '../mocks/company.db';
import { PostingResponse, Posting, PostingFilter } from '../models/posting.model';
import { CompanyPostingRepository } from '../repositories/company-posting.repository';
import { ApiError } from '../errors/api.error';
import { PAGINATION } from '../constants/pagination.constants';

export class CompanyPostingsService {
    constructor(
        private companyPostingRepository: CompanyPostingRepository,
        private companyDB: CompanyDB
    ) { }

    async getFilteredPostings(filters: PostingFilter): Promise<{ data: Posting[], total: number, page: number, limit: number }> {
        try {
            const page = Math.max(1, filters.page || PAGINATION.DEFAULT_PAGE);
            const limit = Math.min(Math.max(1, filters.limit || PAGINATION.DEFAULT_LIMIT), PAGINATION.MAX_LIMIT);

            const { companyId, equipmentType, fullPartial, lengthFeet, weightPounds } = filters;
            const postings = await this.companyPostingRepository.getPostings();

            let filteredPostings = postings;
            if (companyId) {
                filteredPostings = filteredPostings.filter(p => p.companyId === companyId);
            }
            if (equipmentType) {
                filteredPostings = filteredPostings.filter(p => p.freight.equipmentType === equipmentType);
            }
            if (fullPartial) {
                filteredPostings = filteredPostings.filter(p => p.freight.fullPartial === fullPartial);
            }
            if (lengthFeet) {
                filteredPostings = filteredPostings.filter(p => p.freight.lengthFeet === lengthFeet);
            }
            if (weightPounds) {
                filteredPostings = filteredPostings.filter(p => p.freight.weightPounds === weightPounds);
            }

            const total = filteredPostings.length;

            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, total);

            if (startIndex >= total) {
                return {
                    data: [],
                    total,
                    page,
                    limit
                };
            }

            const paginatedPostings = filteredPostings.slice(startIndex, endIndex);

            const companyIds = [...new Set(paginatedPostings.map(p => p.companyId))];
            const companies = await this.companyDB.getCompaniesByIds(companyIds);

            const enrichedPostings = paginatedPostings.map(posting => ({
                ...posting,
                companyName: companies.get(posting.companyId)?.name || 'Unknown Company'
            }));

            return {
                data: enrichedPostings,
                total,
                page,
                limit
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('Company not found')) {
                throw ApiError.notFound('Company not found');
            }
            throw ApiError.internal('Failed to fetch postings');
        }
    }

    async createPosting(posting: Omit<Posting, 'id'>): Promise<PostingResponse> {
        try {
            const company = this.companyDB.getCompanyById(posting.companyId);
            const createdPosting = await this.companyPostingRepository.createPosting(posting);

            return {
                companyName: company.name,
                freight: {
                    weightPounds: createdPosting.freight.weightPounds,
                    equipmentType: createdPosting.freight.equipmentType,
                    fullPartial: createdPosting.freight.fullPartial,
                    lengthFeet: createdPosting.freight.lengthFeet,
                }
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('Company with ID')) {
                throw ApiError.notFound('Cannot create posting: Company not found', { error: error.message });
            }
            throw ApiError.internal('Failed to create posting', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}