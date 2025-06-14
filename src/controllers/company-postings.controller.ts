import { Request, Response } from 'express';
import { CompanyPostingsService } from '../services/company-postings.service';
import { PostingResponseSchema } from '../models/posting.model';

export class CompanyPostingsController {
    constructor(private companyPostingsService: CompanyPostingsService) { }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { equipmentType, fullPartial } = req.query;

            const filters = {
                equipmentType: equipmentType as string | undefined,
                fullPartial: fullPartial as string | undefined,
            };

            const postings = await this.companyPostingsService.getFilteredPostings(filters);

            const validatedPostings = postings.map(posting =>
                PostingResponseSchema.parse(posting)
            );

            res.json(validatedPostings);
        } catch (error) {
            console.error('Error fetching postings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async post(req: Request, res: Response): Promise<void> {
        // TODO: Implement POST endpoint
        res.status(501).json({ error: 'Not implemented yet' });
    }
}