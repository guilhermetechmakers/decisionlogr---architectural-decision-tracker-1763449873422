import { z } from 'zod';

export const demoRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Please enter a valid phone number'
    ),
  preferred_date: z.string().optional(),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Please enter a valid phone number'
    ),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  category: z
    .enum(['support', 'sales', 'partnership', 'other'])
    .optional(),
});

export type DemoRequestFormData = z.infer<typeof demoRequestSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
