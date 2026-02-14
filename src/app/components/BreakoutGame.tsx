import { useCallback, useEffect, useRef, useState } from "react";
import {
    Heart,
    RotateCcw,
    ArrowLeft,
    Trophy,
    Sparkles,
    Timer,
    Zap,
} from "lucide-react";

interface Photo {
    id: string;
    image: string;
    caption: string;
}

interface BreakoutGameProps {
    ballPhoto: Photo;
    brickPhoto: Photo;
    onBack: () => void;
}

interface Brick {
    x: number;
    y: number;
    w: number;
    h: number;
    alive: boolean;
    row: number;
    col: number;
}

const CANVAS_W = 480;
const CANVAS_H = 680;
const PADDLE_W = 90;
const PADDLE_H = 14;
const BALL_R = 16;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_PAD = 4;
const BRICK_TOP = 50;
const BALL_SPEED = 4.5;
const INITIAL_LIVES = 3;

export function BreakoutGame({ ballPhoto, brickPhoto, onBack }: BreakoutGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    // Game state refs (for animation loop)
    const ballX = useRef(CANVAS_W / 2);
    const ballY = useRef(CANVAS_H - 80);
    const ballDX = useRef(BALL_SPEED * 0.7);
    const ballDY = useRef(-BALL_SPEED);
    const paddleX = useRef((CANVAS_W - PADDLE_W) / 2);
    const bricks = useRef<Brick[]>([]);
    const score = useRef(0);
    const lives = useRef(INITIAL_LIVES);
    const gameOver = useRef(false);
    const gameWon = useRef(false);
    const launched = useRef(false);

    // React state for UI overlay
    const [uiScore, setUiScore] = useState(0);
    const [uiLives, setUiLives] = useState(INITIAL_LIVES);
    const [uiGameOver, setUiGameOver] = useState(false);
    const [uiGameWon, setUiGameWon] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    // Image refs
    const ballImg = useRef<HTMLImageElement | null>(null);
    const brickImg = useRef<HTMLImageElement | null>(null);
    const imagesLoaded = useRef(0);

    // Preload images
    useEffect(() => {
        const img1 = new Image();
        img1.onload = () => {
            ballImg.current = img1;
            imagesLoaded.current++;
        };
        img1.src = ballPhoto.image;

        const img2 = new Image();
        img2.onload = () => {
            brickImg.current = img2;
            imagesLoaded.current++;
        };
        img2.src = brickPhoto.image;
    }, [ballPhoto.image, brickPhoto.image]);

    // Timer
    useEffect(() => {
        if (!gameStarted || uiGameOver || uiGameWon) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [gameStarted, uiGameOver, uiGameWon]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Initialize bricks
    const initBricks = useCallback(() => {
        const brickW = (CANVAS_W - BRICK_PAD * (BRICK_COLS + 1)) / BRICK_COLS;
        const brickH = 40;
        const arr: Brick[] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                arr.push({
                    x: BRICK_PAD + c * (brickW + BRICK_PAD),
                    y: BRICK_TOP + r * (brickH + BRICK_PAD),
                    w: brickW,
                    h: brickH,
                    alive: true,
                    row: r,
                    col: c,
                });
            }
        }
        return arr;
    }, []);

    // Reset game
    const resetGame = useCallback(() => {
        ballX.current = CANVAS_W / 2;
        ballY.current = CANVAS_H - 80;
        ballDX.current = BALL_SPEED * (Math.random() > 0.5 ? 0.7 : -0.7);
        ballDY.current = -BALL_SPEED;
        paddleX.current = (CANVAS_W - PADDLE_W) / 2;
        bricks.current = initBricks();
        score.current = 0;
        lives.current = INITIAL_LIVES;
        gameOver.current = false;
        gameWon.current = false;
        launched.current = false;
        setUiScore(0);
        setUiLives(INITIAL_LIVES);
        setUiGameOver(false);
        setUiGameWon(false);
        setSeconds(0);
        setGameStarted(true);
    }, [initBricks]);

    // Mouse / touch move paddle — re-attach when gameStarted changes
    useEffect(() => {
        if (!gameStarted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getRelX = (clientX: number) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = CANVAS_W / rect.width;
            return (clientX - rect.left) * scaleX;
        };

        const onMouseMove = (e: MouseEvent) => {
            const x = getRelX(e.clientX) - PADDLE_W / 2;
            paddleX.current = Math.max(0, Math.min(CANVAS_W - PADDLE_W, x));
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const x = getRelX(e.touches[0].clientX) - PADDLE_W / 2;
            paddleX.current = Math.max(0, Math.min(CANVAS_W - PADDLE_W, x));
        };

        const onClick = () => {
            if (!launched.current) {
                launched.current = true;
            }
        };

        const onTouchStart = () => {
            if (!launched.current) {
                launched.current = true;
            }
        };

        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchmove", onTouchMove, { passive: false });
        canvas.addEventListener("click", onClick);
        canvas.addEventListener("touchstart", onTouchStart);

        return () => {
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("touchmove", onTouchMove);
            canvas.removeEventListener("click", onClick);
            canvas.removeEventListener("touchstart", onTouchStart);
        };
    }, [gameStarted]);

    // Game loop
    useEffect(() => {
        if (!gameStarted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const draw = () => {
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // ── Background ──
            const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            grad.addColorStop(0, "#fce4ec");
            grad.addColorStop(1, "#fdf2f8");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // ── Draw bricks (with second photo as texture) ──
            const brickImgEl = brickImg.current;
            bricks.current.forEach((b) => {
                if (!b.alive) return;

                if (brickImgEl) {
                    // Tile the brick image across all bricks
                    const srcW = brickImgEl.naturalWidth;
                    const srcH = brickImgEl.naturalHeight;
                    // Map this brick's position to a slice of the photo
                    const totalW = CANVAS_W;
                    const totalH = BRICK_ROWS * (b.h + BRICK_PAD);
                    const sx = (b.x / totalW) * srcW;
                    const sy = ((b.y - BRICK_TOP) / totalH) * srcH;
                    const sw = (b.w / totalW) * srcW;
                    const sh = (b.h / totalH) * srcH;

                    ctx.save();
                    // Rounded brick
                    const radius = 4;
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, b.w, b.h, radius);
                    ctx.clip();
                    ctx.drawImage(brickImgEl, sx, sy, sw, sh, b.x, b.y, b.w, b.h);
                    // Add a subtle tint overlay based on row
                    const rowColors = [
                        "rgba(244,114,182,0.3)",
                        "rgba(251,113,133,0.25)",
                        "rgba(253,164,175,0.2)",
                        "rgba(252,165,165,0.15)",
                        "rgba(254,205,211,0.1)",
                    ];
                    ctx.fillStyle = rowColors[b.row] || "rgba(244,114,182,0.15)";
                    ctx.fillRect(b.x, b.y, b.w, b.h);
                    ctx.restore();

                    // Border
                    ctx.strokeStyle = "rgba(255,255,255,0.6)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, b.w, b.h, radius);
                    ctx.stroke();
                } else {
                    // Fallback: gradient bricks
                    const rowColors = ["#f472b6", "#fb7185", "#fda4af", "#fca5a5", "#fecdd3"];
                    ctx.fillStyle = rowColors[b.row] || "#f9a8d4";
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, b.w, b.h, 4);
                    ctx.fill();
                }
            });

            // ── Draw paddle ──
            const pGrad = ctx.createLinearGradient(
                paddleX.current,
                CANVAS_H - 30,
                paddleX.current + PADDLE_W,
                CANVAS_H - 30
            );
            pGrad.addColorStop(0, "#ec4899");
            pGrad.addColorStop(1, "#f43f5e");
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.roundRect(paddleX.current, CANVAS_H - 30, PADDLE_W, PADDLE_H, 7);
            ctx.fill();
            // Paddle shine
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.roundRect(paddleX.current + 4, CANVAS_H - 29, PADDLE_W - 8, 5, 3);
            ctx.fill();

            // ── Draw ball (circular photo) ──
            ctx.save();
            ctx.beginPath();
            ctx.arc(ballX.current, ballY.current, BALL_R, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (ballImg.current) {
                // Draw the photo inside the circular clip
                ctx.drawImage(
                    ballImg.current,
                    ballX.current - BALL_R,
                    ballY.current - BALL_R,
                    BALL_R * 2,
                    BALL_R * 2
                );
            } else {
                ctx.fillStyle = "#f43f5e";
                ctx.fill();
            }
            ctx.restore();

            // Ball border glow
            ctx.beginPath();
            ctx.arc(ballX.current, ballY.current, BALL_R, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(244,63,94,0.6)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Shadow
            ctx.beginPath();
            ctx.arc(ballX.current, ballY.current, BALL_R + 2, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(236,72,153,0.15)";
            ctx.lineWidth = 4;
            ctx.stroke();

            // ── Update ball position ──
            if (!launched.current) {
                ballX.current = paddleX.current + PADDLE_W / 2;
                ballY.current = CANVAS_H - 30 - BALL_R - 2;
            }

            if (gameOver.current || gameWon.current || !launched.current) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }

            ballX.current += ballDX.current;
            ballY.current += ballDY.current;

            // Wall collision
            if (ballX.current - BALL_R <= 0 || ballX.current + BALL_R >= CANVAS_W) {
                ballDX.current = -ballDX.current;
                ballX.current = Math.max(BALL_R, Math.min(CANVAS_W - BALL_R, ballX.current));
            }
            if (ballY.current - BALL_R <= 0) {
                ballDY.current = -ballDY.current;
                ballY.current = BALL_R;
            }

            // Bottom — lose life
            if (ballY.current + BALL_R >= CANVAS_H) {
                lives.current--;
                setUiLives(lives.current);
                if (lives.current <= 0) {
                    gameOver.current = true;
                    setUiGameOver(true);
                } else {
                    // Reset ball to paddle
                    launched.current = false;
                    ballX.current = paddleX.current + PADDLE_W / 2;
                    ballY.current = CANVAS_H - 30 - BALL_R - 2;
                    ballDX.current = BALL_SPEED * (Math.random() > 0.5 ? 0.7 : -0.7);
                    ballDY.current = -BALL_SPEED;
                }
            }

            // Paddle collision
            if (
                ballY.current + BALL_R >= CANVAS_H - 30 &&
                ballY.current + BALL_R <= CANVAS_H - 30 + PADDLE_H + 4 &&
                ballX.current >= paddleX.current - 4 &&
                ballX.current <= paddleX.current + PADDLE_W + 4 &&
                ballDY.current > 0
            ) {
                ballDY.current = -ballDY.current;
                // Angle the ball based on where it hit the paddle
                const hitPos = (ballX.current - paddleX.current) / PADDLE_W; // 0 to 1
                ballDX.current = BALL_SPEED * (hitPos - 0.5) * 2;
                ballY.current = CANVAS_H - 30 - BALL_R - 1;
            }

            // Brick collision
            let allDead = true;
            bricks.current.forEach((b) => {
                if (!b.alive) return;
                allDead = false;

                if (
                    ballX.current + BALL_R > b.x &&
                    ballX.current - BALL_R < b.x + b.w &&
                    ballY.current + BALL_R > b.y &&
                    ballY.current - BALL_R < b.y + b.h
                ) {
                    b.alive = false;
                    score.current += 10;
                    setUiScore(score.current);

                    // Determine which side was hit
                    const overlapLeft = ballX.current + BALL_R - b.x;
                    const overlapRight = b.x + b.w - (ballX.current - BALL_R);
                    const overlapTop = ballY.current + BALL_R - b.y;
                    const overlapBottom = b.y + b.h - (ballY.current - BALL_R);

                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                    if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                        ballDY.current = -ballDY.current;
                    } else {
                        ballDX.current = -ballDX.current;
                    }
                }
            });

            if (allDead && score.current > 0) {
                gameWon.current = true;
                setUiGameWon(true);
            }

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [gameStarted]);

    // ── Render ──

    // Start screen
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
                    <Zap className="size-16 text-pink-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-handwriting text-red-500 mb-2">
                        Breakout Tình Yêu! 💥
                    </h2>
                    <p className="text-gray-500 mb-6 font-handwriting">
                        Phá hết gạch để lộ bức ảnh bí mật nàooo
                    </p>

                    {/* Preview photos */}
                    <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-400 shadow-lg mx-auto mb-2">
                                <img
                                    src={ballPhoto.image}
                                    alt="ball"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-sm font-handwriting text-pink-500">Bóng 🏀</p>
                        </div>
                        <Heart className="size-8 text-red-400 fill-current animate-pulse" />
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-lg overflow-hidden border-4 border-rose-400 shadow-lg mx-auto mb-2">
                                <img
                                    src={brickPhoto.image}
                                    alt="bricks"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-sm font-handwriting text-rose-500">Gạch 🧱</p>
                        </div>
                    </div>

                    <button
                        onClick={resetGame}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl hover:from-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium text-lg"
                    >
                        <span className="font-handwriting">Bắt đầu chơiii! 🎮</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Game Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg"
                >
                    <ArrowLeft className="size-5" />
                    Quay lại
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <Timer className="size-4 text-pink-500" />
                        <span className="font-mono text-gray-700 font-medium">
                            {formatTime(seconds)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        <Zap className="size-4 text-yellow-500" />
                        <span className="font-mono text-gray-700 font-medium">
                            {uiScore} điểm
                        </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                        {Array.from({ length: INITIAL_LIVES }, (_, i) => (
                            <Heart
                                key={i}
                                className={`size-4 ${i < uiLives
                                    ? "text-red-500 fill-current"
                                    : "text-gray-300"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                    <RotateCcw className="size-4" />
                    <span className="font-medium text-sm">Chơi lại</span>
                </button>
            </div>

            {/* Canvas */}
            <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_W}
                        height={CANVAS_H}
                        className="rounded-xl border-2 border-pink-200 cursor-pointer max-w-full"
                        style={{ width: "100%", maxWidth: CANVAS_W, aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
                    />
                </div>
            </div>

            {/* Hint */}
            {!launched.current && !uiGameOver && !uiGameWon && (
                <div className="text-center mt-4">
                    <p className="text-sm text-pink-400 font-handwriting animate-pulse">
                        Di chuột hoặc chạm để di chuyển thanh, nhấn để bắn bóng! ♡
                    </p>
                </div>
            )}

            {/* Game Over Overlay */}
            {uiGameOver && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <Heart className="size-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-3xl font-handwriting text-gray-500 mb-3">
                            Hết mạng rồiii 😢
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Điểm:{" "}
                            <span className="font-bold text-pink-500">{uiScore}</span>
                        </p>
                        <p className="text-gray-600 mb-8">
                            Thời gian:{" "}
                            <span className="font-bold text-pink-500">{formatTime(seconds)}</span>
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={resetGame}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:from-pink-500 hover:to-red-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                            >
                                <RotateCcw className="size-4" />
                                Thử lại điiiiiii
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

            {/* Win Overlay */}
            {uiGameWon && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative inline-block mb-6">
                            <Trophy className="size-20 text-yellow-400 mx-auto" />
                            <Sparkles className="absolute -top-2 -right-2 size-8 text-pink-400 animate-ping" />
                            <Heart className="absolute -bottom-1 -left-2 size-6 text-red-400 fill-current animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-handwriting text-red-500 mb-3">
                            Phá hết gạch rồiii! 💕
                        </h2>

                        {/* Reveal the brick photo as reward */}
                        <div className="max-w-[200px] mx-auto mb-4">
                            <div className="bg-white p-2 shadow-lg rounded-lg">
                                <img
                                    src={brickPhoto.image}
                                    alt={brickPhoto.caption}
                                    className="w-full aspect-square object-cover rounded"
                                />
                                <p className="mt-1 font-handwriting text-gray-600 text-xs">
                                    {brickPhoto.caption || "Ảnh bí mật đây nè ♡"}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-2">
                            Hoàn thành trong{" "}
                            <span className="font-bold text-pink-500">{formatTime(seconds)}</span>
                        </p>
                        <p className="text-gray-600 mb-8">
                            Điểm:{" "}
                            <span className="font-bold text-pink-500">{uiScore}. Giỏi quáaa!</span>
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={resetGame}
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
