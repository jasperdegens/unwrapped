import fs from 'node:fs'
import { OpenAI, toFile } from 'openai'
import sharp from 'sharp'
import z from 'zod'
import type { WrappedCardGeneratorSpec } from '@/types/generator'

// Safer fetch -> validate -> normalize to PNG
async function fetchAndNormalizeToPng(url: string, name: string) {
	const res = await fetch(url, {
		headers: { Accept: 'image/*' }, // helps some CDNs pick a sane format
	})

	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`)
	}

	const ct = res.headers.get('content-type') || ''
	if (!ct.startsWith('image/')) {
		// You might be getting HTML from the CDN (e.g., 403/hotlink block)
		const text = await res.text()
		throw new Error(`Non-image payload from ${url}: content-type=${ct}, sample="${text.slice(0, 120)}..."`)
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
}

const nftMetadataSchema = z.object({
	imageUrl: z.string(),
	traits: z.array(
		z.object({
			trait_type: z.string(),
			value: z.string(),
		})
	),
})

// Helper: download remote URL to buffer
async function fetchImage(url: string) {
	const res = await fetch(url)
	const extension = url.split('.').pop()
	const fileName = url.split('/').pop()
	console.log(fileName)
	return await toFile(res, fileName, {
		type: `image/${extension}`,
	})
}

const baseMediaPrompt = `
Retrieve the traits and imageUrl of each of the NFTs provided. They should be returned in a valid JSON object, in the format of:
[
  { imageUrl: string, traits: [{trait_type: string, value: any}]}
]
`

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
	kind: 'nft_entourage',
	version: 1,
	order: 15,
	requires: ['nfts'],
	tools: ['opensea.wallet.nfts', 'opensea.nft.metadata'],
	dataPrompt: `
1) Find the wallet’s **top 4 most valuable NFTs** (current value). Prefer:
   - item’s last sale price (if recent & reliable), else
   - collection floor price for that token’s collection, else
   - highest bid / suggested value if available.
2) For each of the 4, get:
   - collection name, token id, and a **key trait** (the most notable/rare or signature trait),
3) Write a **fun, crypto-native description** of this “entourage” in degen slang (short & punchy).
4) List the NFTs as the highlights, and include their NFT token names exactly as they appear.

- If fewer than 4 NFTs are owned, use as many as available (down to 1).

The leadInText should be something like, "Your NFT entourage is...
`,
	//   mediaPrompt: `
	// Create an SVG collage (1200x1200) showing a 2x2 grid layout for NFT showcase.
	// Use neon gradients and bold degen aesthetic. Return:
	// { "kind":"svg", "svg":"<svg>...</svg>", "alt":"Top NFTs showcase" }.
	// Include placeholder rectangles with gradient fills and "NFT" labels.
	// `,
	async mediaProcessor({ ai, data }) {
		// const tokens = data.highlights
		// if (!tokens) {
		// 	return undefined
		// }

		// const prompt = `${baseMediaPrompt}\n\nNFTs:\n
		// ${tokens.map((token) => `${token.label}`).join('\n')}
		// `
		// const nftMetadata = await ai.callStructuredJSON({
		// 	system: '',
		// 	prompt: prompt,
		// 	schema: nftMetadataSchema,
		// })

		// log the urls
		// console.log(nftMetadata)

		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})

		const images = [
			'https://i2.seadn.io/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/af1144d4fcc4877459f536624a8e78/baaf1144d4fcc4877459f536624a8e78.jpeg',
			'https://i2.seadn.io/ethereum/0xd79e4cc964e5a2c1e400fe5a8488c71d9fd9847e/a9c43d0d35630b70d25a206c5fa23c/dfa9c43d0d35630b70d25a206c5fa23c.jpeg',
			'https://i2.seadn.io/ethereum/0xd79e4cc964e5a2c1e400fe5a8488c71d9fd9847e/79c6811e432302ba25b7abd3e28aca/f979c6811e432302ba25b7abd3e28aca.jpeg',
			'https://i2.seadn.io/ethereum/0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb/86b8b568bbb2c19d8c0d3a5548b800/2186b8b568bbb2c19d8c0d3a5548b800.png',
		]

		// Fetch them
		// const imageData = await Promise.all(images.map(fetchImage))
		const files = await Promise.all(images.map((url, i) => fetchAndNormalizeToPng(url, `nft-${i}`)))
		console.log(files)
		// Call OpenAI’s image edit
		const result = await openai.images.edit({
			model: 'gpt-image-1',
			prompt: imagePrompt,
			image: files,
			quality: 'low',
			size: '1024x1024',
		})

		// save this to a file
		fs.writeFileSync('./nft-entourage.png', Buffer.from(result.data?.[0]?.b64_json || '', 'base64'))

		// upload to imgbb
		// upload to imgbb
		const imageBuffer = Buffer.from(result.data?.[0]?.b64_json || '', 'base64')
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
		}
	},
}
