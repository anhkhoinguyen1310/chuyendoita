import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Heart,
    RotateCcw,
    ArrowLeft,
    Trophy,
    Sparkles,
    Timer,
    MousePointerClick,
    Puzzle,
} from "lucide-react";

interface Photo {
    id: string;
    image: string;
    caption: string;
}

interface JigsawPuzzleProps {
    photo: Photo;
    onBack: () => void;
}

interface PieceData {
    id: number;        // original correct position index
    currentPos: number; // where the piece currently sits
    row: number;        // original row
    col: number;        // original col
}

const GRID_OPTIONS = [
    { label: "3×3 (Dễ)", value: 3 },
    { label: "4×4 (Trung bình)", value: 4 },
    { label: "5×5 (Khó)", value: 5 },
];

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function JigsawPuzzle({ photo, onBack }: JigsawPuzzleProps) {
    const [gridSize, setGridSize] = useState(3);
    const [pieces, setPieces] = useState<PieceData[]>([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const totalPieces = gridSize * gridSize;

    // Initialize game
    const initGame = useCallback((size: number) => {
        const total = size * size;
        const initialPieces: PieceData[] = Array.from({ length: total }, (_, i) => ({
            id: i,
            currentPos: i,
            row: Math.floor(i / size),
            col: i % size,
        }));

        // Shuffle positions
        const positions = shuffleArray(Array.from({ length: total }, (_, i) => i));
        const shuffled = initialPieces.map((piece, idx) => ({
            ...piece,
            currentPos: positions[idx],
        }));

        setPieces(shuffled);
        setMoves(0);
        setSeconds(0);
        setGameWon(false);
        setSelectedPiece(null);
        setDraggedPiece(null);
        setGameStarted(true);
    }, []);

    // Start game on mount
    useEffect(() => {
        // Preload the image
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.src = photo.image;
    }, [photo.image]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameWon) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [gameStarted, gameWon]);

    // Check win condition
    useEffect(() => {
        if (!gameStarted || pieces.length === 0) return;
        const won = pieces.every((p) => p.id === p.currentPos);
        if (won) setGameWon(true);
    }, [pieces, gameStarted]);

    // Swap two pieces by their current positions
    const swapPieces = useCallback((posA: number, posB: number) => {
        if (posA === posB) return;
        setPieces((prev) =>
            prev.map((piece) => {
                if (piece.currentPos === posA) return { ...piece, currentPos: posB };
                if (piece.currentPos === posB) return { ...piece, currentPos: posA };
                return piece;
            })
        );
        setMoves((m) => m + 1);
    }, []);

    // Click to select/swap
    const handlePieceClick = (currentPos: number) => {
        if (gameWon) return;

        if (selectedPiece === null) {
            setSelectedPiece(currentPos);
        } else {
            if (selectedPiece !== currentPos) {
                swapPieces(selectedPiece, currentPos);
            }
            setSelectedPiece(null);
        }
    };

    // Drag & Drop handlers
    const handleDragStart = (currentPos: number) => {
        setDraggedPiece(currentPos);
        setSelectedPiece(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetPos: number) => {
        if (draggedPiece !== null && draggedPiece !== targetPos) {
            swapPieces(draggedPiece, targetPos);
        }
        setDraggedPiece(null);
    };

    const handleDragEnd = () => {
        setDraggedPiece(null);
    };

    // Touch drag support
    const [touchStart, setTouchStart] = useState<{ pos: number; x: number; y: number } | null>(null);

    const handleTouchStart = (pos: number, e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ pos, x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (pos: number, e: React.TouchEvent) => {
        if (touchStart && touchStart.pos !== pos) {
            // Touch ended on a different piece — this won't fire naturally
            // So we use click-to-swap as primary mobile UX
        }
        setTouchStart(null);
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Determine which piece is at each position
    const pieceAtPosition = useMemo(() => {
        const map = new Map<number, PieceData>();
        pieces.forEach((p) => map.set(p.currentPos, p));
        return map;
    }, [pieces]);

    // Piece size for rendering
    const puzzleSize = gridSize <= 3 ? 360 : gridSize <= 4 ? 400 : 440;
    const pieceSize = puzzleSize / gridSize;

    // Count correctly placed
    const correctCount = pieces.filter((p) => p.id === p.currentPos).length;

    if (!imageLoaded) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-20">
                <Puzzle className="size-16 text-pink-400 animate-pulse mx-auto mb-4" />
                <p className="text-lg text-gray-500 font-handwriting">Đang tải ảnh...</p>
            </div>
        );
    }

    // Difficulty selection screen
    if (!gameStarted) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg mb-6"
                >
                    <ArrowLeft className="size-5" />
                    Quay lại nhaaa
                </button>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center">
                    <Puzzle className="size-16 text-pink-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-handwriting text-red-500 mb-2">
                        Ghép Hình Nàooo! 🧩
                    </h2>
                    <p className="text-gray-500 mb-8 font-handwriting">
                        Chọn độ khó rồi chơi nào cưnggg
                    </p>

                    {/* Preview image */}
                    <div className="max-w-[280px] mx-auto mb-8">
                        <div className="bg-white p-3 shadow-lg">
                            <img
                                src={photo.image}
                                alt={photo.caption}
                                className="w-full aspect-square object-cover"
                            />
                            <p className="mt-2 font-handwriting text-gray-600 text-sm">
                                {photo.caption || "Kỉ niệm đẹp ♡"}
                            </p>
                        </div>
                    </div>

                    {/* Difficulty buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {GRID_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setGridSize(opt.value);
                                    initGame(opt.value);
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-2xl hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium"
                            >
                                <span className="block text-lg">{opt.label}</span>
                                <span className="block text-xs opacity-80">
                                    {opt.value * opt.value} mảnh ghép
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Game Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg"
                >
                    <ArrowLeft className="size-5" />
                    Quay lại nhaaa
                </button>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <Timer className="size-4 text-pink-500" />
                        <span className="font-mono text-gray-700 font-medium">
                            {formatTime(seconds)}
                        </span>
                    </div>
                    {/* Moves */}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <MousePointerClick className="size-4 text-red-400" />
                        <span className="font-mono text-gray-700 font-medium">
                            {moves} lượt
                        </span>
                    </div>
                    {/* Progress */}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <Puzzle className="size-4 text-rose-400" />
                        <span className="font-mono text-gray-700 font-medium">
                            {correctCount}/{totalPieces}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full hover:bg-white transition-all shadow-md text-sm font-medium"
                    >
                        {showPreview ? "Ẩn gợi ý" : "Xem gợi ý"}
                    </button>
                    <button
                        onClick={() => initGame(gridSize)}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                    >
                        <RotateCcw className="size-4" />
                        <span className="font-medium">Chơi lại</span>
                    </button>
                </div>
            </div>

            {/* Preview image (toggleable) */}
            {showPreview && (
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-2 shadow-lg rounded-lg">
                        <img
                            src={photo.image}
                            alt="preview"
                            className="w-32 h-32 object-cover rounded"
                        />
                    </div>
                </div>
            )}

            {/* Puzzle Board */}
            <div className="flex justify-center">
                <div
                    className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6"
                    style={{ width: puzzleSize + 48 }}
                >
                    <div
                        className="relative mx-auto grid gap-[2px] bg-pink-200/50 rounded-lg overflow-hidden"
                        style={{
                            width: puzzleSize,
                            height: puzzleSize,
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                        }}
                    >
                        {Array.from({ length: totalPieces }, (_, posIdx) => {
                            const piece = pieceAtPosition.get(posIdx);
                            if (!piece) return null;

                            const isCorrect = piece.id === piece.currentPos;
                            const isSelected = selectedPiece === posIdx;
                            const isDragging = draggedPiece === posIdx;

                            return (
                                <div
                                    key={posIdx}
                                    draggable
                                    onDragStart={() => handleDragStart(posIdx)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(posIdx)}
                                    onDragEnd={handleDragEnd}
                                    onTouchStart={(e) => handleTouchStart(posIdx, e)}
                                    onTouchEnd={(e) => handleTouchEnd(posIdx, e)}
                                    onClick={() => handlePieceClick(posIdx)}
                                    className={`
                    relative cursor-pointer transition-all duration-200
                    ${isSelected ? "ring-3 ring-pink-500 scale-95 z-10" : ""}
                    ${isDragging ? "opacity-50 scale-90" : ""}
                    ${isCorrect && !gameWon ? "ring-2 ring-green-400/50" : ""}
                    ${!isSelected && !isDragging ? "hover:brightness-110 hover:scale-[1.02]" : ""}
                  `}
                                    style={{
                                        width: pieceSize,
                                        height: pieceSize,
                                    }}
                                >
                                    {/* Piece image with background-position to show correct slice */}
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${photo.image})`,
                                            backgroundSize: `${puzzleSize}px ${puzzleSize}px`,
                                            backgroundPosition: `-${piece.col * pieceSize}px -${piece.row * pieceSize}px`,
                                        }}
                                    />

                                    {/* Correct indicator */}
                                    {isCorrect && !gameWon && (
                                        <div className="absolute top-1 right-1">
                                            <Heart className="size-3 text-green-500 fill-current" />
                                        </div>
                                    )}

                                    {/* Selected glow */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-pink-400/20 animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Caption */}
                    <p className="text-center mt-4 font-handwriting text-gray-500 text-sm">
                        {photo.caption || "Kỉ niệm đẹp ♡"}
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="text-center mt-6">
                <p className="text-sm text-gray-400 font-handwriting">
                    Nhấn chọn 2 mảnh để hoán đổi, hoặc kéo thả để ghép hình ♡
                </p>
            </div>

            {/* Win Overlay */}
            {gameWon && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative inline-block mb-6">
                            <Trophy className="size-20 text-yellow-400 mx-auto" />
                            <Sparkles className="absolute -top-2 -right-2 size-8 text-pink-400 animate-ping" />
                            <Heart className="absolute -bottom-1 -left-2 size-6 text-red-400 fill-current animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-handwriting text-red-500 mb-3">
                            Ghép xong rồi nèee! 💕
                        </h2>

                        {/* Show completed image */}
                        <div className="max-w-[200px] mx-auto mb-4">
                            <div className="bg-white p-2 shadow-lg rounded-lg">
                                <img
                                    src={photo.image}
                                    alt={photo.caption}
                                    className="w-full aspect-square object-cover rounded"
                                />
                            </div>
                        </div>

                        <p className="text-gray-600 mb-2">
                            Em hoàn thành trong{" "}
                            <span className="font-bold text-pink-500">
                                {formatTime(seconds)}
                            </span>
                        </p>
                        <p className="text-gray-600 mb-8">
                            Với{" "}
                            <span className="font-bold text-pink-500">
                                {moves} lượt hoán đổi. Giỏi quáaa!
                            </span>
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => initGame(gridSize)}
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
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
