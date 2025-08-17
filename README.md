# 🚀 wallet unwrapped - flex your degen lore 💎

*Drop your addy, get your on-chain wrapped. No cap*

## 🎯 What is this degen app?

**wallet unrapped** is like Spotify Wrapped but for your Ethereum wallet. Drop your address and get a slick summary of your on-chain degeneracy:

- 💰 **Top Bags** - Your biggest holdings (and biggest mistakes)
- 📈 **Best Trades** - When you actually made it (rare)
- 🖼️ **NFT Flexes** - Your JPEG collection worth more than your car
- 💸 **Rug Pulls** - The tokens that went to zero (RIP)
- 🔥 **Degen Score** - How much of a true degen you really are

## 🛠️ Tech Stack

- **OpenSea MCP** 
- **Hypergraph**
- **Next.js 14**
- **TypeScript**
- **Tailwind CSS**
- **Vercel Blob**
- **AI SDK**


## Journey Notes
- Vercel's ai sdk only seems to output structured output will tools on gpt-4o
- Verbosity of some tool calls leading to quick rate limits
- OpenSea's MCP does not do well with time queries, so queries are time independent
- Getting majorly rate limited by OpenAi
- TypeSync needs mapping file already created and in specific dir, which is a bit annoying

## Known Issues
- There are still rate limiting issues with OpenAi, so sometimes you will have to re-run cards when you aren't rate limited.
- If you want to deploy, some functions take longer than Vercel's timeouts, so they will all be canceled. As a result, I am running this locally. If you clone and put in your env variables, you can also run locally!
- Also, it will cost you $$$ to run because of the calls, so make sure you have enough credits.


## 📜 License

MIT License - Do whatever you want, just don't rug us.