import { z } from 'zod';

export const FreightSchema = z.object({
  equipmentType: z.string(),
  fullPartial: z.string(),
  weightPounds: z.number(),
  lengthFeet: z.number().optional(),
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

export type Posting = z.infer<typeof PostingSchema>;
export type PostingResponse = z.infer<typeof PostingResponseSchema>;
export type Freight = z.infer<typeof FreightSchema>;