import { CompanyDB } from '../mocks/company.db';
import { PostingResponse, Posting } from '../models/posting.model';
import { CompanyPostingRepository } from '../repositories/company-posting.repository';

export class CompanyPostingsService {
    constructor(
        private companyDB: CompanyDB,
        private postingRepository: CompanyPostingRepository
    ) { }

    async getFilteredPostings(filters?: { equipmentType?: string; fullPartial?: string }): Promise<PostingResponse[]> {
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

        return filteredPostings.map(posting => ({
            companyName: this.getCompanyName(posting.companyId),
            freight: {
                weightPounds: posting.freight.weightPounds,
                equipmentType: posting.freight.equipmentType,
                fullPartial: posting.freight.fullPartial,
                lengthFeet: posting.freight.lengthFeet,
            },
        }));
    }

    async createPosting(posting: Omit<Posting, 'id'>): Promise<PostingResponse> {
        const createdPosting = await this.postingRepository.createPosting(posting);

        return {
            companyName: this.getCompanyName(createdPosting.companyId),
            freight: {
                weightPounds: createdPosting.freight.weightPounds,
                equipmentType: createdPosting.freight.equipmentType,
                fullPartial: createdPosting.freight.fullPartial,
                lengthFeet: createdPosting.freight.lengthFeet,
            },
        };
    }

    private getCompanyName(companyId: string): string {
        const company = this.companyDB.getCompanyById(companyId);
        return company?.name || 'Unknown Company';
    }
}