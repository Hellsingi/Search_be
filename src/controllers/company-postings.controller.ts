import { Request, Response } from 'express';
import { CompanyPostingsService } from '../services/company-postings.service';
import { PostingResponseSchema, CreatePostingSchema, PostingFilterSchema } from '../models/posting.model';
import { ZodError } from 'zod';

export class CompanyPostingsController {
    constructor(private companyPostingsService: CompanyPostingsService) { }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const filters = PostingFilterSchema.parse(req.query);

            const postings = await this.companyPostingsService.getFilteredPostings(filters);

            const validatedPostings = postings.map(posting =>
                PostingResponseSchema.parse(posting)
            );

            res.json(validatedPostings);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Invalid filter parameters',
                    details: error.errors
                });
                return;
            }

            console.error('Error fetching postings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async post(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = CreatePostingSchema.parse(req.body);
            const posting = await this.companyPostingsService.createPosting(validatedData);
            const validatedPosting = PostingResponseSchema.parse(posting);

            res.status(201).json(validatedPosting);
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Invalid request data',
                    details: error.errors
                });
                return;
            }

            console.error('Error creating posting:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}