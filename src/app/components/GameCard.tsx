import { Heart, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface GameCardProps {
    image: string;
    caption: string;
    isFlipped: boolean;
    isMatched: boolean;
    onClick: () => void;
    disabled: boolean;
}

const CARD_ICONS = [
    { icon: Heart, color: "text-pink-400" },
    { icon: Sparkles, color: "text-red-400" },
    { icon: Star, color: "text-rose-400" },
    { icon: Heart, color: "text-red-300" },
];

export function GameCard({
    image,
    caption,
    isFlipped,
    isMatched,
    onClick,
    disabled,
}: GameCardProps) {
    const [showMatchEffect, setShowMatchEffect] = useState(false);
    const [iconIdx] = useState(() => Math.floor(Math.random() * CARD_ICONS.length));
    const IconComponent = CARD_ICONS[iconIdx].icon;
    const iconColor = CARD_ICONS[iconIdx].color;

    useEffect(() => {
        if (isMatched) {
            setShowMatchEffect(true);
            const t = setTimeout(() => setShowMatchEffect(false), 1200);
            return () => clearTimeout(t);
        }
    }, [isMatched]);

    return (
        <div
            className="perspective-[800px] cursor-pointer"
            onClick={() => {
                if (!disabled && !isFlipped && !isMatched) onClick();
            }}
        >
            <div
                className={`relative w-full transition-transform duration-500 transform-3d ${isFlipped || isMatched ? "rotate-y-180" : ""
                    }`}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* BACK FACE — the hidden/face-down card (icon vibe) */}
                <div
                    className="w-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div
                        className={`bg-white p-3 shadow-lg transition-all duration-300 ${!isFlipped && !isMatched
                                ? "hover:scale-105 hover:shadow-2xl hover:rotate-1"
                                : ""
                            }`}
                    >
                        <div className="relative bg-gradient-to-br from-pink-100 via-rose-50 to-red-100 aspect-square overflow-hidden flex items-center justify-center">
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-2 left-2">
                                    <Heart className="size-4 fill-current text-pink-400" />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Star className="size-3 fill-current text-rose-400" />
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <Star className="size-3 fill-current text-rose-400" />
                                </div>
                                <div className="absolute bottom-2 right-2">
                                    <Heart className="size-4 fill-current text-pink-400" />
                                </div>
                            </div>

                            {/* Center icon */}
                            <div className="flex flex-col items-center gap-2 animate-pulse">
                                <IconComponent
                                    className={`size-12 ${iconColor} fill-current drop-shadow-md`}
                                />
                                <span className="text-xs font-handwriting text-pink-400/70 tracking-widest">
                                    ?
                                </span>
                            </div>
                        </div>

                        {/* Caption placeholder */}
                        <div className="mt-3 min-h-[40px] flex items-center justify-center">
                            <p className="font-handwriting text-pink-300 text-sm">tap to reveal ♡</p>
                        </div>
                    </div>
                </div>

                {/* FRONT FACE — the revealed polaroid card */}
                <div
                    className="absolute inset-0 w-full backface-hidden rotate-y-180"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div
                        className={`bg-white p-3 shadow-lg transition-all duration-300 ${isMatched ? "ring-4 ring-green-400/60 shadow-green-200/50 shadow-2xl" : ""
                            }`}
                    >
                        <div className="relative bg-gray-100 aspect-square overflow-hidden">
                            <img
                                src={image}
                                alt={caption}
                                className="w-full h-full object-cover"
                            />
                            {/* Heart overlay for matched */}
                            {isMatched && (
                                <div className="absolute inset-0 bg-green-400/10 flex items-center justify-center">
                                    <Heart className="size-10 text-green-500 fill-current animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Caption */}
                        <div className="mt-3 min-h-[40px] flex items-center justify-center">
                            <p className="font-handwriting text-gray-700 text-sm text-center">
                                {caption || "A lovely memory ♡"}
                            </p>
                        </div>
                    </div>

                    {/* Match celebration effect */}
                    {showMatchEffect && (
                        <div className="absolute inset-0 pointer-events-none">
                            <Sparkles className="absolute top-0 left-0 size-6 text-yellow-400 animate-ping" />
                            <Sparkles className="absolute top-0 right-0 size-5 text-pink-400 animate-ping delay-100" />
                            <Heart className="absolute bottom-0 left-1/2 -translate-x-1/2 size-8 text-red-400 fill-current animate-bounce" />
                            <Star className="absolute bottom-2 right-0 size-5 text-yellow-300 fill-current animate-ping" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
