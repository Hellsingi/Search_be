import { CompanyDB } from '../mocks/company.db';
import { PostingResponse, Posting, PostingFilter } from '../models/posting.model';
import { CompanyPostingRepository } from '../repositories/company-posting.repository';
import { ApiError } from '../errors/api.error';

export class CompanyPostingsService {
    constructor(
        private companyDB: CompanyDB,
        private postingRepository: CompanyPostingRepository
    ) { }

    async getFilteredPostings(filters?: PostingFilter): Promise<PostingResponse[]> {
        try {
            const postings = await this.postingRepository.getPostings();
            let filteredPostings = postings;

            if (filters) {
                filteredPostings = postings.filter(posting => {
                    if (filters.equipmentType && posting.freight.equipmentType !== filters.equipmentType) {
                        return false;
                    }
                    if (filters.fullPartial && posting.freight.fullPartial !== filters.fullPartial) {
                        return false;
                    }
                    return true;
                });
            }

            const companyIds = [...new Set(filteredPostings.map(p => p.companyId))];
            const companies = this.companyDB.getCompaniesByIds(companyIds);

            return filteredPostings.map(posting => ({
                companyName: companies.get(posting.companyId)?.name || 'Unknown Company',
                freight: {
                    weightPounds: posting.freight.weightPounds,
                    equipmentType: posting.freight.equipmentType,
                    fullPartial: posting.freight.fullPartial,
                    lengthFeet: posting.freight.lengthFeet,
                }
            }));
        } catch (error) {
            if (error instanceof Error && error.message.includes('Company with ID')) {
                throw ApiError.notFound('Company not found', { error: error.message });
            }
            throw ApiError.internal('Failed to fetch postings', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async createPosting(posting: Omit<Posting, 'id'>): Promise<PostingResponse> {
        try {
            const company = this.companyDB.getCompanyById(posting.companyId);
            const createdPosting = await this.postingRepository.createPosting(posting);

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