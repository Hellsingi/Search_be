import { z } from 'zod';
import { PAGINATION } from '../constants/pagination.constants';

export const FreightSchema = z.object({
  equipmentType: z.string().min(1, 'Equipment type is required'),
  fullPartial: z.string().min(1, 'Full/Partial status is required'),
  weightPounds: z.number().positive('Weight must be positive'),
  lengthFeet: z.number().positive('Length must be positive').optional(),
  comments: z.array(z.object({ comment: z.string() })).optional(),
});

export const PostingSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  freight: FreightSchema,
});

export const PostingResponseSchema = z.object({
  companyName: z.string(),
  freight: z.object({
    weightPounds: z.number(),
    equipmentType: z.string(),
    fullPartial: z.string(),
    lengthFeet: z.number().optional(),
  }),
});

export const CreatePostingSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  freight: FreightSchema,
});

export const PostingFilterSchema = z.object({
    companyId: z.string().optional(),
    equipmentType: z.string().optional(),
    fullPartial: z.string().optional(),
    lengthFeet: z.number().optional(),
    weightPounds: z.number().optional(),
    page: z.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
    limit: z.number().int()
        .min(PAGINATION.MIN_LIMIT, PAGINATION.ERROR_MESSAGES.MIN_LIMIT(PAGINATION.MIN_LIMIT))
        .max(PAGINATION.MAX_LIMIT, PAGINATION.ERROR_MESSAGES.MAX_LIMIT(PAGINATION.MAX_LIMIT))
        .default(PAGINATION.DEFAULT_LIMIT)
}).strict('Invalid filter parameters. Allowed parameters are: equipmentType, fullPartial, lengthFeet, weightPounds, page, limit');

export type Posting = z.infer<typeof PostingSchema>;
export type PostingResponse = z.infer<typeof PostingResponseSchema>;
export type Freight = z.infer<typeof FreightSchema>;
export type CreatePosting = z.infer<typeof CreatePostingSchema>;
export type PostingFilter = z.infer<typeof PostingFilterSchema>;