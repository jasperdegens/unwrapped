import { z } from 'zod'

export const UnifiedCardDataSchema = z.object({
	leadInText: z.string().min(1),
	revealText: z.string().min(1),
	highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
	footnote: z.string().optional(),
})

export type UnifiedCardData = z.infer<typeof UnifiedCardDataSchema>
