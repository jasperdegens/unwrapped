'use client'

import { Check, Copy, X } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
	isOpen: boolean
	onClose: () => void
	shareUrl: string
}

export function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
	const [copied, setCopied] = useState(false)

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy:', error)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Share Your Wrapped</h2>
					<button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<X size={24} />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-600 mb-3">Share this link with friends to show off your crypto journey:</p>

					<div className="bg-gray-100 rounded-lg p-3 break-all">
						<code className="text-sm text-gray-800">{shareUrl}</code>
					</div>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={copyToClipboard}
						className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
					>
						{copied ? (
							<>
								<Check size={20} />
								Copied!
							</>
						) : (
							<>
								<Copy size={20} />
								Copy Link
							</>
						)}
					</button>

					<button
						type="button"
						onClick={onClose}
						className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
