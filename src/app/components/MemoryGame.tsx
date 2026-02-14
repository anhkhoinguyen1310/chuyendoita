import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Heart,
    RotateCcw,
    ArrowLeft,
    Trophy,
    Sparkles,
    Timer,
    MousePointerClick,
} from "lucide-react";
import { GameCard } from "./GameCard";

interface Photo {
    id: string;
    image: string;
    caption: string;
}

interface MemoryGameProps {
    photos: Photo[];
    onBack: () => void;
}

interface GameCardData {
    uid: string;
    photoId: string;
    image: string;
    caption: string;
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function MemoryGame({ photos, onBack }: MemoryGameProps) {
    const [cards, setCards] = useState<GameCardData[]>([]);
    const [flippedIds, setFlippedIds] = useState<string[]>([]);
    const [matchedPhotoIds, setMatchedPhotoIds] = useState<Set<string>>(new Set());
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Initialize / reset game
    const initGame = useCallback(() => {
        // Create pairs — each photo appears twice
        const pairs: GameCardData[] = photos.flatMap((photo) => [
            { uid: photo.id + "_a", photoId: photo.id, image: photo.image, caption: photo.caption },
            { uid: photo.id + "_b", photoId: photo.id, image: photo.image, caption: photo.caption },
        ]);
        setCards(shuffleArray(pairs));
        setFlippedIds([]);
        setMatchedPhotoIds(new Set());
        setMoves(0);
        setSeconds(0);
        setGameWon(false);
        setIsChecking(false);
    }, [photos]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Timer
    useEffect(() => {
        if (gameWon) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [gameWon]);

    // Check for win
    useEffect(() => {
        if (matchedPhotoIds.size > 0 && matchedPhotoIds.size === photos.length) {
            setGameWon(true);
        }
    }, [matchedPhotoIds, photos.length]);

    // Handle card click
    const handleCardClick = (uid: string) => {
        if (isChecking || gameWon) return;
        if (flippedIds.includes(uid)) return;

        const newFlipped = [...flippedIds, uid];
        setFlippedIds(newFlipped);

        if (newFlipped.length === 2) {
            setMoves((m) => m + 1);
            setIsChecking(true);

            const [first, second] = newFlipped;
            const card1 = cards.find((c) => c.uid === first)!;
            const card2 = cards.find((c) => c.uid === second)!;

            if (card1.photoId === card2.photoId) {
                // Match found!
                setTimeout(() => {
                    setMatchedPhotoIds((prev) => new Set([...prev, card1.photoId]));
                    setFlippedIds([]);
                    setIsChecking(false);
                }, 600);
            } else {
                // No match — flip back
                setTimeout(() => {
                    setFlippedIds([]);
                    setIsChecking(false);
                }, 1200);
            }
        }
    };

    const isCardFlipped = (uid: string) => flippedIds.includes(uid);
    const isCardMatched = (uid: string) => {
        const card = cards.find((c) => c.uid === uid);
        return card ? matchedPhotoIds.has(card.photoId) : false;
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Grid columns based on card count
    const gridCols = useMemo(() => {
        const total = cards.length;
        if (total <= 8) return "grid-cols-2 sm:grid-cols-4";
        if (total <= 12) return "grid-cols-3 sm:grid-cols-4";
        if (total <= 16) return "grid-cols-4";
        return "grid-cols-4 sm:grid-cols-5";
    }, [cards.length]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Game Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg"
                >
                    <ArrowLeft className="size-5" />
                    Quay lại nhaaa
                </button>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <Timer className="size-4 text-pink-500" />
                        <span className="font-mono text-gray-700 font-medium">{formatTime(seconds)}</span>
                    </div>
                    {/* Moves */}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <MousePointerClick className="size-4 text-red-400" />
                        <span className="font-mono text-gray-700 font-medium">{moves} moves</span>
                    </div>
                </div>

                <button
                    onClick={initGame}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                    <RotateCcw className="size-4" />
                    <span className="font-medium">Chơi lại điiiiiii</span>
                </button>
            </div>

            {/* Game Won Overlay */}
            {gameWon && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative inline-block mb-6">
                            <Trophy className="size-20 text-yellow-400 mx-auto" />
                            <Sparkles className="absolute -top-2 -right-2 size-8 text-pink-400 animate-ping" />
                            <Heart className="absolute -bottom-1 -left-2 size-6 text-red-400 fill-current animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-handwriting text-red-500 mb-3">
                            Chúc Mừng Cục Cưnggg! 💕
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Em đã hoàn thành trong{" "}
                            <span className="font-bold text-pink-500">{formatTime(seconds)}</span>
                        </p>
                        <p className="text-gray-600 mb-8">
                            Với{" "}
                            <span className="font-bold text-pink-500">{moves} lượt. Giỏi quá điiii</span>
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={initGame}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                            >
                                <RotateCcw className="size-4" />
                                Chơi Lại điiiiiii
                            </button>
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all"
                            >
                                <ArrowLeft className="size-4" />
                                Quay lại xem ảnhnnn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Grid */}
            <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
                {cards.map((card) => (
                    <GameCard
                        key={card.uid}
                        image={card.image}
                        caption={card.caption}
                        isFlipped={isCardFlipped(card.uid)}
                        isMatched={isCardMatched(card.uid)}
                        onClick={() => handleCardClick(card.uid)}
                        disabled={isChecking || gameWon}
                    />
                ))}
            </div>

            {/* Bottom hint */}
            <div className="text-center mt-8">
                <p className="text-sm text-gray-400 font-handwriting">
                    Find all matching pairs of your memories ♡
                </p>
            </div>
        </div>
    );
}
