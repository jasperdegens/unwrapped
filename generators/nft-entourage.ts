import fs from 'node:fs'
import OpenAI, { toFile } from 'openai'
import sharp from 'sharp'
import { MEDIA_SYSTEM_PROMPT } from '@/lib/prompts'
import { MediaSchema } from '@/schemas/unified'
import type { WrappedCardGeneratorSpec } from '@/types/generator'

// Safer fetch -> validate -> normalize to PNG
async function fetchAndNormalizeToPng(url: string, name: string) {
	try {
		const res = await fetch(url, {
			headers: { Accept: 'image/*' }, // helps some CDNs pick a sane format
		})

		if (!res.ok) {
			console.warn(`Failed to fetch ${url}: HTTP ${res.status}`)
			return null
		}

		const ct = res.headers.get('content-type') || ''
		if (!ct.startsWith('image/')) {
			// You might be getting HTML from the CDN (e.g., 403/hotlink block)
			const text = await res.text()
			console.warn(`Non-image payload from ${url}: content-type=${ct}, sample="${text.slice(0, 120)}..."`)
			return null
		}

		// Read bytes and normalize to a vanilla PNG (RGB, sRGB), limit size sensibly
		const buf = Buffer.from(await res.arrayBuffer())
		const png = await sharp(buf)
			.rotate() // respect EXIF orientation
			.png({ compressionLevel: 9 }) // standard, non-animated PNG
			.toBuffer()

		console.log(png)

		// Return a File-like object with the correct content-type
		return await toFile(new Blob([png], { type: 'image/png' }), `${name}.png`, {
			type: 'image/png',
		})
	} catch (error) {
		console.warn(`Error processing image ${url}:`, error)
		return null
	}
}

const imagePrompt = `
Create a cinematic scene called **“NFT Entourage.”**
Use the **4 provided images as the only characters** (treat them as subjects, not framed pictures).
Integrate them into a single shot **walking toward camera in a loose V-formation** on a rain-slick neon street at night.

AESTHETIC
- Crypto/degen vibes that fit the aesthetic of the provided images
- **No text.** No UI chrome. No captions.

COMPOSITION
- **Hero (highest-value NFT)** front-center; sidekicks flanking left and right; fourth character slightly behind.
- Full-body or three-quarter framing; **correct proportions**; preserve each subject’s signature colors and traits.
- Subtle motion cues: faint mist, light rain, tiny particles, gentle motion blur on strides.

INTEGRATION
- Remove original backgrounds cleanly; **no borders, frames, or drop-ins**.
- Match lighting and shadows to the scene; cast shadows onto the ground; add soft contact shadows near feet.
- **Unify with cinematic color grading** (teal/magenta) while keeping individual character identity readable.

CAMERA & LIGHTING
- 35–50mm equivalent, slightly low angle for swagger; shallow depth of field with background bokeh.
- Key light soft and frontal; neon rim lights from left and right; faint backlight from signage.
- Maintain crisp detail on faces/emblems; avoid plastic or over-smooth textures.

OUTPUT
- One cohesive square image
- **No text, no watermark, no extra characters, no signatures.**
`

export const NFTEntourageGen: WrappedCardGeneratorSpec = {
	kind: 'nft-entourage',
	version: 1,
	order: 15,
	requires: ['nfts'],
	dataPrompt: `
1) get the profile for this account, which includes the latest trades. Find the 4 trades for tokens this user currently owns that are worth the most.
2) For each of the 4, get:
   - collection name, token id, and a **key trait** (the most notable/rare or signature trait),
3) Write a **fun, crypto-native description** of this “entourage” in degen slang (short & punchy).
4) List the NFTs as the highlights, and include their NFT token names exactly as they appear.
5) Include the collection name as the highlight label. Include the token name as the highlight value.
6) You MUST include the urls for the images of the NFTs in the highlights.

- If fewer than 4 NFTs are owned, use as many as available (down to 1).

The leadInText should be something like, "Your NFT entourage is...
`,
	//   mediaPrompt: `
	// Create an SVG collage (1200x1200) showing a 2x2 grid layout for NFT showcase.
	// Use neon gradients and bold degen aesthetic. Return:
	// { "kind":"svg", "svg":"<svg>...</svg>", "alt":"Top NFTs showcase" }.
	// Include placeholder rectangles with gradient fills and "NFT" labels.
	// `,
	async mediaProcessor({ ai, data, vars }) {
		const tokens = data.highlights
		if (!tokens) {
			return ai.callStructuredJSON({
				system: MEDIA_SYSTEM_PROMPT,
				prompt: 'Generate an SVG representaiton of the NFTs in the highlights.',
				schema: MediaSchema,
			})
		}

		const prompt = `${imagePrompt}\n\nNFTs:\n
		${JSON.stringify(tokens, null, 2)}
		`

		const images = tokens.map((token) => token.image).filter((image) => image !== undefined) as string[]

		// Fetch them
		// const imageData = await Promise.all(images.map(fetchImage))
		const files = await Promise.all(images.map((url, i) => fetchAndNormalizeToPng(url, `nft-${i}`)))
		console.log(files)

		// Filter out failed images (null values)
		const validFiles = files.filter((file): file is NonNullable<typeof file> => file !== null)

		console.log(`Successfully processed ${validFiles.length}/${images.length} images`)

		if (validFiles.length === 0) {
			console.warn('No valid images could be fetched, falling back to SVG generation')
			return ai.callStructuredJSON({
				system: MEDIA_SYSTEM_PROMPT,
				prompt: 'Generate an SVG representation of the NFTs in the highlights.',
				schema: MediaSchema,
			})
		}

		// Adjust prompt based on number of available images
		const adjustedPrompt =
			validFiles.length < 4
				? `${imagePrompt}\n\nNote: Only ${validFiles.length} NFT image(s) available. Adjust the composition accordingly.\n\nNFTs:\n${JSON.stringify(tokens, null, 2)}`
				: prompt

		// Call OpenAI's image edit
		const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

		try {
			const result = await openai.images.edit({
				model: 'gpt-image-1',
				prompt: adjustedPrompt,
				image: validFiles,
				quality: 'low',
				size: '1024x1024',
			})

			if (!result.data?.[0]?.b64_json) {
				throw new Error('No image data returned from OpenAI')
			}

			// save this to a file
			try {
				fs.writeFileSync(`./images/${vars.address}-nft-entourage.png`, Buffer.from(result.data[0].b64_json, 'base64'))
			} catch (fileError) {
				console.warn('Failed to save image to local file:', fileError)
			}

			// upload to imgbb
			try {
				const imageBuffer = Buffer.from(result.data[0].b64_json, 'base64')
				const formData = new FormData()
				formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'nft-entourage.png')

				const uploadResponse = await fetch(
					`https://api.imgbb.com/1/upload?expiration=60000&key=${process.env.IMGBB_API_KEY}`,
					{
						method: 'POST',
						body: formData,
					}
				)

				const uploadResult = await uploadResponse.json()

				console.log(uploadResult)
				if (uploadResult.success) {
					return {
						kind: 'url',
						src: uploadResult.data.url,
						alt: 'NFT Entourage',
					}
				} else {
					throw new Error(`ImgBB upload failed: ${uploadResult.error?.message || 'Unknown error'}`)
				}
			} catch (uploadError) {
				console.warn('Failed to upload to ImgBB:', uploadError)
				// Fall back to returning the base64 data if upload fails
				return {
					kind: 'base64',
					src: `data:image/png;base64,${result.data[0].b64_json}`,
					alt: 'NFT Entourage',
				}
			}
		} catch (openaiError) {
			console.error('OpenAI image generation failed:', openaiError)
			// Fall back to SVG generation if OpenAI fails
			return ai.callStructuredJSON({
				system: MEDIA_SYSTEM_PROMPT,
				prompt: 'Generate an SVG representation of the NFTs in the highlights.',
				schema: MediaSchema,
			})
		}
	},
}
