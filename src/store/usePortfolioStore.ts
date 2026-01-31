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
    scrollToCard: (index: number) => void; // New action for nav clicks


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

    // Intro state
    isIntroComplete: boolean;
    setIntroComplete: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    // Active card state
    activeCardIndex: 0,
    setActiveCardIndex: (index) => set({ activeCardIndex: index }),

    // Scroll state
    scrollProgress: 0,
    setScrollProgress: (progress) => set({ scrollProgress: progress }),
    scrollToCard: (index) => {
        set((state) => {
            const card = state.videoCards[index];
            if (card) {
                return { scrollProgress: card.position, activeCardIndex: index };
            }
            return {};
        });
    },

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
    // Video cards data
    videoCards: [
        // --- HERO SECTION ---
        {
            id: 'hero-reel',
            title: '2024 SHOWREEL',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'A collection of visual stories and technical achievements.',
            credits: ['Director of Photography', 'Editor', 'Colorist'],
            position: 0.0,
        },

        // --- NARRATIVE ---
        {
            id: 'narrative-1',
            title: 'The Last Echo',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Sci-Fi Short Film | Official Selection: Sundance 2024',
            credits: ['Director', 'VFX Supervisor'],
            position: 0.15,
        },
        {
            id: 'narrative-2',
            title: 'Before Dawn',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Drama Feature | "Best Cinematography" - Austin Film Fest',
            credits: ['Cinematographer'],
            position: 0.23,
        },
        {
            id: 'narrative-3',
            title: 'Midnight Train',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Mystery Thriller | Streaming now on Hulu',
            credits: ['Director', 'Writer'],
            position: 0.31,
        },

        // --- COMMERCIAL ---
        {
            id: 'comm-1',
            title: 'Nike: Run fast',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Global Campaign 2024',
            credits: ['Editor', 'Sound Design'],
            position: 0.45,
        },
        {
            id: 'comm-2',
            title: 'Tesla: Vision',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Product Launch Spot',
            credits: ['VFX Artist', 'Compositor'],
            position: 0.53,
        },
        {
            id: 'comm-3',
            title: 'Apple: Connect',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Lifestyle Commercial',
            credits: ['Colorist'],
            position: 0.61,
        },

        // --- MUSIC VIDEO ---
        {
            id: 'mv-1',
            title: 'Neon Dreams',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Artist: The Midnight | 50M Views',
            credits: ['Director'],
            position: 0.75,
        },
        {
            id: 'mv-2',
            title: 'Static',
            youtubeId: 'dQw4w9WgXcQ',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Artist: Glitch Mob',
            credits: ['VFX Supervisor'],
            position: 0.83,
        },

        // --- CONTACT ---
        {
            id: 'contact',
            title: 'LETS CREATE',
            youtubeId: '',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            description: 'Ready to bring your vision to life?',
            credits: ['booking@joeportfolio.com', '+1 (555) 012-3456'],
            position: 0.95,
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

    // Intro state
    isIntroComplete: false,
    setIntroComplete: () => set({ isIntroComplete: true }),
}));
