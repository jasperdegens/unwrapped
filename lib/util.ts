export const nowIso = () => new Date().toISOString()
export const shortAddr = (a: string) => a.slice(0, 6) + "…" + a.slice(-4)
