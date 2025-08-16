'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from 'react'
import type { WrappedCard, WrappedCardCollection } from '@/types/wrapped'

// State interface for the provider
interface WrappedCardState {
	collection: WrappedCardCollection | null
	isLoading: boolean
	error: string | null
	generationStatus: 'idle' | 'pending' | 'generating' | 'completed' | 'failed'
	pollingId: string | null
}

// Action types for the reducer
type WrappedCardAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'SET_COLLECTION'; payload: WrappedCardCollection | null }
	| { type: 'ADD_CARD'; payload: WrappedCard }
	| { type: 'SET_GENERATION_STATUS'; payload: 'idle' | 'pending' | 'generating' | 'completed' | 'failed' }
	| { type: 'SET_POLLING_ID'; payload: string | null }
	| { type: 'CLEAR_ERROR' }

// Initial state
const initialState: WrappedCardState = {
	collection: null,
	isLoading: false,
	error: null,
	generationStatus: 'idle',
	pollingId: null,
}

// Reducer function
function wrappedCardReducer(state: WrappedCardState, action: WrappedCardAction): WrappedCardState {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }

		case 'SET_ERROR':
			return { ...state, error: action.payload }

		case 'SET_COLLECTION':
			return { ...state, collection: action.payload }

		case 'ADD_CARD': {
			if (!state.collection) return state

			return {
				...state,
				collection: {
					...state.collection,
					cards: [...state.collection.cards, action.payload],
				},
			}
		}

		case 'SET_GENERATION_STATUS':
			return { ...state, generationStatus: action.payload }

		case 'SET_POLLING_ID':
			return { ...state, pollingId: action.payload }

		case 'CLEAR_ERROR':
			return { ...state, error: null }

		default:
			return state
	}
}

// Context interface
interface WrappedCardContextType {
	// State
	collection: WrappedCardCollection | null
	isLoading: boolean
	error: string | null
	generationStatus: 'idle' | 'pending' | 'generating' | 'completed' | 'failed'
	pollingId: string | null

	// Actions
	setCollection: (collection: WrappedCardCollection | null) => void
	addCard: (card: WrappedCard) => void
	setGenerationStatus: (status: 'idle' | 'pending' | 'generating' | 'completed' | 'failed') => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	clearError: () => void
	startPolling: (id: string, address: string) => void
	stopPolling: () => void

	// Utility methods
	hasCards: boolean
	cardCount: number
	isGenerating: boolean
}

// Create context
const WrappedCardContext = createContext<WrappedCardContextType | undefined>(undefined)

// Provider component
interface WrappedCardProviderProps {
	children: ReactNode
}

export function WrappedCardProvider({ children }: WrappedCardProviderProps) {
	const [state, dispatch] = useReducer(wrappedCardReducer, initialState)
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

	// Actions
	const setCollection = useCallback((collection: WrappedCardCollection | null) => {
		dispatch({ type: 'SET_COLLECTION', payload: collection })
	}, [])

	const addCard = useCallback((card: WrappedCard) => {
		dispatch({ type: 'ADD_CARD', payload: card })
	}, [])

	const setGenerationStatus = useCallback((status: 'idle' | 'pending' | 'generating' | 'completed' | 'failed') => {
		dispatch({ type: 'SET_GENERATION_STATUS', payload: status })
	}, [])

	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: 'SET_LOADING', payload: loading })
	}, [])

	const setError = useCallback((error: string | null) => {
		dispatch({ type: 'SET_ERROR', payload: error })
	}, [])

	const clearError = useCallback(() => {
		dispatch({ type: 'CLEAR_ERROR' })
	}, [])

	const setPollingId = useCallback((id: string | null) => {
		dispatch({ type: 'SET_POLLING_ID', payload: id })
	}, [])

	// Utility methods
	const hasCards = state.collection ? state.collection.cards.length > 0 : false
	const cardCount = state.collection ? state.collection.cards.length : 0
	const isGenerating = state.generationStatus === 'pending' || state.generationStatus === 'generating'

	// Stop polling
	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current)
			pollingIntervalRef.current = null
		}
		setPollingId(null)
	}, [setPollingId])

	// Polling function to check for Vercel blob
	const pollForBlob = useCallback(
		async (id: string, address: string) => {
			try {
				// Check if the blob exists by trying to fetch it
				const response = await fetch(`/api/wrapped/${address}`)

				if (response.ok) {
					const data = await response.json()

					// If we have cards, stop polling and mark as completed
					if (data.cards && data.cards.length > 0) {
						setCollection(data)
						setGenerationStatus('completed')
						setLoading(false)
						stopPolling()
						return
					}
				}
			} catch (error) {
				console.error('Error polling for blob:', error)
				// Don't set error here as the blob might not exist yet
			}
		},
		[setCollection, setGenerationStatus, setLoading, stopPolling]
	)

	// Start polling for a specific blob ID
	const startPolling = useCallback(
		(id: string, address: string) => {
			// Clear any existing polling
			stopPolling()

			// Set the polling ID
			setPollingId(id)
			setGenerationStatus('pending')
			setLoading(true)
			clearError()

			// Create empty collection to track progress
			const emptyCollection: WrappedCardCollection = {
				address: address as `0x${string}`,
				cards: [],
				timestamp: new Date().toISOString(),
			}
			setCollection(emptyCollection)

			// Start polling every 10 seconds
			pollingIntervalRef.current = setInterval(() => {
				pollForBlob(id, address)
			}, 10000)

			// Also poll immediately
			pollForBlob(id, address)
		},
		[stopPolling, setPollingId, setGenerationStatus, setLoading, clearError, setCollection, pollForBlob]
	)

	// Cleanup polling on unmount
	useEffect(() => {
		return () => {
			stopPolling()
		}
	}, [stopPolling])

	const contextValue: WrappedCardContextType = {
		// State
		collection: state.collection,
		isLoading: state.isLoading,
		error: state.error,
		generationStatus: state.generationStatus,
		pollingId: state.pollingId,

		// Actions
		setCollection,
		addCard,
		setGenerationStatus,
		setLoading,
		setError,
		clearError,
		startPolling,
		stopPolling,

		// Utility methods
		hasCards,
		cardCount,
		isGenerating,
	}

	return <WrappedCardContext.Provider value={contextValue}>{children}</WrappedCardContext.Provider>
}

// Hook to use the wrapped card context
export function useWrappedCard() {
	const context = useContext(WrappedCardContext)
	if (context === undefined) {
		throw new Error('useWrappedCard must be used within a WrappedCardProvider')
	}
	return context
}
