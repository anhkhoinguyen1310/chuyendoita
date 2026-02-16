import { useEffect, useState } from "react";
import { Heart, Clock } from "lucide-react";

const TARGET_DATE = new Date("2026-04-25T00:00:00");

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calcTimeLeft(): TimeLeft {
    const now = new Date();
    const diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export function CountdownClock() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);
    const isExpired =
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0;

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (isExpired) {
        return (
            <div className="flex flex-col items-center gap-2 mb-6">
                <Heart className="size-10 text-red-500 fill-current animate-bounce" />
                <p className="text-2xl font-handwriting text-red-500">
                    Ngày đặc biệt đã đến rồiii! 💕🎉
                </p>
            </div>
        );
    }

    const units = [
        { label: "Ngày", value: timeLeft.days },
        { label: "Giờ", value: timeLeft.hours },
        { label: "Phút", value: timeLeft.minutes },
        { label: "Giây", value: timeLeft.seconds },
    ];

    return (
        <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="size-5 text-pink-400" />
                <p className="text-sm font-handwriting text-gray-500">
                    Đếm ngược đến 25/04/2026 💕
                </p>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
                {units.map((unit, i) => (
                    <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md px-3 sm:px-4 py-2 sm:py-3 min-w-[56px] sm:min-w-[72px] text-center border border-pink-100">
                                <span className="text-2xl sm:text-3xl font-mono font-bold bg-gradient-to-b from-pink-500 to-red-500 bg-clip-text text-transparent">
                                    {String(unit.value).padStart(2, "0")}
                                </span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-400 mt-1 font-handwriting">
                                {unit.label}
                            </span>
                        </div>
                        {i < units.length - 1 && (
                            <span className="text-xl sm:text-2xl font-bold text-pink-300 animate-pulse mb-4">
                                :
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
