import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

export type Company = z.infer<typeof CompanySchema>;
