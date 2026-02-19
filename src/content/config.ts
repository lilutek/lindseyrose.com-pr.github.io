import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        lang: z.enum(['en', 'es']),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        description: z.string(),
        image: z.string().optional(),
    }),
});

const portfolioCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        lang: z.enum(['en', 'es']),
        client: z.string().optional(),
        tags: z.array(z.string()).default([]),
        image: z.string(),
        featured: z.boolean().default(false),
        description: z.string(),
    }),
});

export const collections = {
    blog: blogCollection,
    portfolio: portfolioCollection,
};
