import { create } from 'zustand';

interface VideoCard {
    id: string;
    title: string;
    youtubeId: string;
    thumbnail: string;
    videoLoop?: string;
    description: string;
    credits: string[];
    position: number; // Position along the curve (0-1)
}

interface PortfolioState {
    // Active card state
    activeCardIndex: number;
    setActiveCardIndex: (index: number) => void;

    // Scroll state
    scrollProgress: number;
    setScrollProgress: (progress: number) => void;

    // Card flip state
    flippedCards: Set<string>;
    toggleCardFlip: (cardId: string) => void;

    // Video cards data
    videoCards: VideoCard[];
    setVideoCards: (cards: VideoCard[]) => void;

    // Player state
    isPlayerOpen: boolean;
    playerCardId: string | null;
    openPlayer: (cardId: string) => void;
    closePlayer: () => void;

    // Sound preferences
    soundEnabled: boolean;
    toggleSound: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    // Active card state
    activeCardIndex: 0,
    setActiveCardIndex: (index) => set({ activeCardIndex: index }),

    // Scroll state
    scrollProgress: 0,
    setScrollProgress: (progress) => set({ scrollProgress: progress }),

    // Card flip state
    flippedCards: new Set(),
    toggleCardFlip: (cardId) =>
        set((state) => {
            const newSet = new Set(state.flippedCards);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return { flippedCards: newSet };
        }),

    // Video cards data
    videoCards: [
        {
            id: 'card-1',
            title: 'Cinematic Masterpiece',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'A breathtaking visual journey through time and space.',
            credits: ['Director: John Doe', 'Cinematographer: Jane Smith', 'Producer: Alice Johnson'],
            position: 0,
        },
        {
            id: 'card-2',
            title: 'Urban Dreams',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Exploring the intersection of humanity and architecture.',
            credits: ['Director: Bob Wilson', 'Editor: Carol Davis'],
            position: 0.25,
        },
        {
            id: 'card-3',
            title: 'Nature\'s Symphony',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'A meditation on the beauty of the natural world.',
            credits: ['Director: Eve Martinez', 'Sound Design: Frank Thompson'],
            position: 0.5,
        },
        {
            id: 'card-4',
            title: 'Neon Nights',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'A cyberpunk exploration of future metropolis.',
            credits: ['Director: Grace Lee', 'VFX: Henry Chen'],
            position: 0.75,
        },
    ],
    setVideoCards: (cards) => set({ videoCards: cards }),

    // Player state
    isPlayerOpen: false,
    playerCardId: null,
    openPlayer: (cardId) => set({ isPlayerOpen: true, playerCardId: cardId }),
    closePlayer: () => set({ isPlayerOpen: false, playerCardId: null }),

    // Sound preferences
    soundEnabled: true,
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
