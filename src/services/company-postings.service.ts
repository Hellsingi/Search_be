import { CompanyDB } from '../mocks/company.db';
import { PostingResponse, Posting, PostingFilter } from '../models/posting.model';
import { CompanyPostingRepository } from '../repositories/company-posting.repository';

export class CompanyPostingsService {
    constructor(
        private companyDB: CompanyDB,
        private postingRepository: CompanyPostingRepository
    ) { }

    async getFilteredPostings(filters?: PostingFilter): Promise<PostingResponse[]> {
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

        try {
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
            console.error('Error enriching postings with company data:', error);
            throw new Error('Failed to enrich postings with company data');
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
                throw new Error(`Cannot create posting: ${error.message}`);
            }
            console.error('Error creating posting:', error);
            throw new Error('Failed to create posting');
        }
    }
}