import { z } from 'zod'

export const UnifiedCardDataSchema = z.object({
	leadInText: z.string().min(1),
	revealText: z.string().min(1),
	highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
	footnote: z.string().optional(),
})

export type UnifiedCardData = z.infer<typeof UnifiedCardDataSchema>

// Media schema for generation
// top level can't be a union because it's not a valid JSON object for openai
export const MediaSchema = z
	.object({
		kind: z.enum(['url', 'svg']),
		src: z.string().url().optional(),
		svg: z.string().optional(),
		alt: z.string().optional(),
	})
	.superRefine((val, ctx) => {
		if (val.kind === 'url') {
			if (!val.src) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "src is required when kind = 'url'" })
			if (val.svg) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "svg must be empty when kind = 'url'" })
		}
		if (val.kind === 'svg') {
			if (!val.svg) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "svg is required when kind = 'svg'" })
			if (val.src) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "src must be empty when kind = 'svg'" })
		}
	})

export type Media = z.infer<typeof MediaSchema>
