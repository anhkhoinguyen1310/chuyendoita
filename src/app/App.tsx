import { useState } from "react";
import { Heart, Upload, Camera, Gamepad2, ImageIcon, Puzzle, Zap } from "lucide-react";
import { PolaroidCard } from "./components/PolaroidCard";
import { MemoryGame } from "./components/MemoryGame";
import { JigsawPuzzle } from "./components/JigsawPuzzle";
import { BreakoutGame } from "./components/BreakoutGame";

const MIN_CARDS_TO_PLAY = 4;

interface Photo {
  id: string;
  image: string;
  caption: string;
}

// ── Breakout photo selection sub-component ──
function BreakoutPhotoSelect({
  photos,
  onSelect,
  onBack,
}: {
  photos: Photo[];
  onSelect: (ballId: string, brickId: string) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<"ball" | "brick">("ball");
  const [ballId, setBallId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={() => {
          if (step === "brick" && ballId) {
            setStep("ball");
            setBallId(null);
          } else {
            onBack();
          }
        }}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg mb-6"
      >
        <Heart className="size-5 fill-current text-pink-400" />
        Quay lại nhaaa
      </button>

      <div className="text-center mb-8">
        <Zap className="size-12 text-pink-500 mx-auto mb-3" />
        <h2 className="text-3xl font-handwriting text-red-500 mb-2">
          {step === "ball"
            ? "Chọn ảnh làm bóng 🏀"
            : "Chọn ảnh làm gạch 🧱"}
        </h2>
        <p className="text-gray-500 font-handwriting">
          {step === "ball"
            ? "Ảnh này sẽ thành quả bóng tròn xinh nè"
            : "Ảnh này sẽ phủ lên các viên gạch, phá hết để lộ ảnh!"}
        </p>
        {step === "brick" && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-sm text-gray-400">Bóng đã chọn:</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-400">
              <img
                src={photos.find((p) => p.id === ballId)?.image}
                alt="ball"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {photos
          .filter((p) => step === "ball" || p.id !== ballId)
          .map((photo) => (
            <button
              key={photo.id}
              onClick={() => {
                if (step === "ball") {
                  setBallId(photo.id);
                  setStep("brick");
                } else {
                  onSelect(ballId!, photo.id);
                }
              }}
              className="group bg-white p-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
            >
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                <img
                  src={photo.image}
                  alt={photo.caption}
                  className={`w-full h-full object-cover ${step === "ball" ? "rounded-full" : ""
                    }`}
                />
                <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/20 transition-colors flex items-center justify-center">
                  {step === "ball" ? (
                    <div className="w-12 h-12 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  ) : (
                    <Zap className="size-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  )}
                </div>
              </div>
              <p className="mt-2 font-handwriting text-gray-600 text-sm text-center truncate">
                {photo.caption || "Kỉ niệm đẹp ♡"}
              </p>
            </button>
          ))}
      </div>
    </div>
  );
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mode, setMode] = useState<"dashboard" | "game" | "jigsaw-select" | "jigsaw" | "breakout-select" | "breakout">("dashboard");
  const [jigsawPhotoId, setJigsawPhotoId] = useState<string | null>(null);
  const [breakoutBallPhotoId, setBreakoutBallPhotoId] = useState<string | null>(null);
  const [breakoutBrickPhotoId, setBreakoutBrickPhotoId] = useState<string | null>(null);

  const canBreakout = photos.length >= 2;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: Photo = {
            id: Date.now().toString() + Math.random(),
            image: e.target?.result as string,
            caption: "",
          };
          setPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = "";
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, caption } : photo))
    );
  };

  const canPlay = photos.length >= MIN_CARDS_TO_PLAY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-50 to-rose-100 overflow-x-hidden">
      {/* Floating hearts background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-[10%] left-[5%] size-12 text-pink-200 fill-current opacity-40 animate-float" />
        <Heart className="absolute top-[20%] right-[10%] size-8 text-red-200 fill-current opacity-30 animate-float-delayed" />
        <Heart className="absolute bottom-[15%] left-[15%] size-10 text-rose-200 fill-current opacity-35 animate-float" />
        <Heart className="absolute bottom-[30%] right-[8%] size-14 text-pink-300 fill-current opacity-25 animate-float-delayed" />
        <Heart className="absolute top-[50%] left-[50%] size-16 text-red-100 fill-current opacity-20 animate-float" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="size-10 text-red-400 fill-current animate-pulse" />
            <h1 className="text-5xl text-red-500 font-handwriting">
              Chiện Đôi Ta
            </h1>
            <Heart className="size-10 text-red-400 fill-current animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 font-handwriting">
            {mode === "dashboard"
              ? "Tạo bộ sưu tập ảnh kỉ niệm của chúng ta nào! 📸💕"
              : mode === "jigsaw-select"
                ? "Chọn ảnh để ghép hình nàooo! 🧩💕"
                : mode === "jigsaw"
                  ? "Ghép hình điiiii! 🧩💕"
                  : mode === "breakout-select"
                    ? "Chọn ảnh để chơi Breakout nàooo! 💥💕"
                    : mode === "breakout"
                      ? "Phá gạch điiiii! 💥💕"
                      : "Tìm Đỉm Chungggg 💕"}
          </p>
        </div>

        {/* Mode Toggle — only show in dashboard if there are enough cards */}
        {/* Mode Toggle — show when there are photos */}
        {photos.length > 0 && (
          <div className="flex justify-center mb-8 px-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
              <button
                onClick={() => setMode("dashboard")}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm font-medium whitespace-nowrap ${mode === "dashboard"
                  ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                  : "text-gray-600 hover:text-pink-500"
                  }`}
              >
                <ImageIcon className="size-4 shrink-0" />
                Photos
              </button>
              <button
                onClick={() => {
                  if (canPlay) setMode("game");
                }}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm font-medium whitespace-nowrap ${!canPlay
                  ? "text-gray-300 cursor-not-allowed"
                  : mode === "game"
                    ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                    : "text-gray-600 hover:text-pink-500"
                  }`}
                title={
                  !canPlay
                    ? `Upload at least ${MIN_CARDS_TO_PLAY} photos to play!`
                    : "Play Memory Game"
                }
              >
                <Gamepad2 className="size-4 shrink-0" />
                Memory Game
                {!canPlay && (
                  <span className="text-[10px] bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                    {photos.length}/{MIN_CARDS_TO_PLAY}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMode("jigsaw-select")}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm font-medium whitespace-nowrap ${mode === "jigsaw-select" || mode === "jigsaw"
                    ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                    : "text-gray-600 hover:text-pink-500"
                  }`}
              >
                <Puzzle className="size-4 shrink-0" />
                Ghép Hình
              </button>
              <button
                onClick={() => {
                  if (canBreakout) setMode("breakout-select");
                }}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm font-medium whitespace-nowrap ${!canBreakout
                    ? "text-gray-300 cursor-not-allowed"
                    : mode === "breakout-select" || mode === "breakout"
                      ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                      : "text-gray-600 hover:text-pink-500"
                  }`}
                title={
                  !canBreakout
                    ? "Upload 2 ảnh để chơi Breakout!"
                    : "Play Breakout"
                }
              >
                <Zap className="size-4 shrink-0" />
                Breakout
                {!canBreakout && (
                  <span className="text-[10px] bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                    {photos.length}/2
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── GAME MODE ── */}
        {mode === "game" ? (
          <MemoryGame
            photos={photos}
            onBack={() => setMode("dashboard")}
          />
        ) : mode === "breakout" && breakoutBallPhotoId && breakoutBrickPhotoId ? (
          <BreakoutGame
            ballPhoto={photos.find((p) => p.id === breakoutBallPhotoId)!}
            brickPhoto={photos.find((p) => p.id === breakoutBrickPhotoId)!}
            onBack={() => setMode("breakout-select")}
          />
        ) : mode === "breakout-select" ? (
          <BreakoutPhotoSelect
            photos={photos}
            onSelect={(ballId, brickId) => {
              setBreakoutBallPhotoId(ballId);
              setBreakoutBrickPhotoId(brickId);
              setMode("breakout");
            }}
            onBack={() => setMode("dashboard")}
          />
        ) : mode === "jigsaw" && jigsawPhotoId ? (
          <JigsawPuzzle
            photo={photos.find((p) => p.id === jigsawPhotoId)!}
            onBack={() => setMode("jigsaw-select")}
          />
        ) : mode === "jigsaw-select" ? (
          <div className="w-full max-w-4xl mx-auto">
            <button
              onClick={() => setMode("dashboard")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg mb-6"
            >
              <Heart className="size-5 fill-current text-pink-400" />
              Quay lại nhaaa
            </button>

            <div className="text-center mb-8">
              <Puzzle className="size-12 text-pink-500 mx-auto mb-3" />
              <h2 className="text-3xl font-handwriting text-red-500 mb-2">
                Chọn ảnh để ghép hình nàooo! 🧩
              </h2>
              <p className="text-gray-500 font-handwriting">
                Nhấn vào ảnh muốn ghép nha cưnggg
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setJigsawPhotoId(photo.id);
                    setMode("jigsaw");
                  }}
                  className="group bg-white p-3 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
                >
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    <img
                      src={photo.image}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/20 transition-colors flex items-center justify-center">
                      <Puzzle className="size-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                  <p className="mt-2 font-handwriting text-gray-600 text-sm text-center truncate">
                    {photo.caption || "Kỉ niệm đẹp ♡"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Upload Section */}
            <div className="max-w-md mx-auto mb-12">
              <label
                htmlFor="photo-upload"
                className="block w-full cursor-pointer group"
              >
                <div className="bg-white/80 backdrop-blur-sm border-3 border-dashed border-pink-300 rounded-2xl p-8 text-center hover:border-red-400 hover:bg-white transition-all hover:scale-105 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Camera className="size-16 text-pink-400 group-hover:text-red-500 transition-colors" />
                      <Heart className="absolute -top-2 -right-2 size-6 text-red-400 fill-current animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xl font-handwriting text-gray-700 mb-2">
                        Đăng Ảnh điiiiii
                      </p>
                      <p className="text-sm text-gray-500">
                        Đăng lên
                      </p>
                      {!canPlay && photos.length > 0 && (
                        <p className="text-xs text-pink-400 mt-2 font-medium">
                          Đăng thêm {MIN_CARDS_TO_PLAY - photos.length} tấm ảnh nữa để
                          mở khóa trái tim anh! 🎮
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full group-hover:from-pink-500 group-hover:to-red-500 transition-all">
                      <Upload className="size-5" />
                      <span className="font-medium">Chọn Ảnh</span>
                    </div>
                  </div>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Play Game CTA - shown when enough cards */}
            {canPlay && (
              <div className="max-w-md mx-auto mb-10 text-center flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setMode("game")}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Gamepad2 className="size-6 group-hover:animate-bounce" />
                  <div className="text-left">
                    <span className="block text-lg font-handwriting">
                      Memory Game!
                    </span>
                    <span className="block text-xs opacity-80">
                      {photos.length} photos • {photos.length * 2} cards
                    </span>
                  </div>
                  <Heart className="size-5 fill-current animate-pulse" />
                </button>
                <button
                  onClick={() => setMode("jigsaw-select")}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Puzzle className="size-6 group-hover:animate-bounce" />
                  <div className="text-left">
                    <span className="block text-lg font-handwriting">
                      Ghép Hình!
                    </span>
                    <span className="block text-xs opacity-80">
                      Chọn 1 ảnh • ghép puzzle 🧩
                    </span>
                  </div>
                  <Heart className="size-5 fill-current animate-pulse" />
                </button>
                {canBreakout && (
                  <button
                    onClick={() => setMode("breakout-select")}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="size-6 group-hover:animate-bounce" />
                    <div className="text-left">
                      <span className="block text-lg font-handwriting">
                        Breakout!
                      </span>
                      <span className="block text-xs opacity-80">
                        2 ảnh • phá gạch 💥
                      </span>
                    </div>
                    <Heart className="size-5 fill-current animate-pulse" />
                  </button>
                )}
              </div>
            )}

            {/* Jigsaw/Breakout CTA when not enough for memory game */}
            {!canPlay && photos.length > 0 && (
              <div className="max-w-lg mx-auto mb-10 text-center flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setMode("jigsaw-select")}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Puzzle className="size-6 group-hover:animate-bounce" />
                  <div className="text-left">
                    <span className="block text-lg font-handwriting">
                      Ghép Hình Nào!
                    </span>
                    <span className="block text-xs opacity-80">
                      Chọn 1 ảnh để chơi ghép hình 🧩
                    </span>
                  </div>
                  <Heart className="size-5 fill-current animate-pulse" />
                </button>
                {canBreakout && (
                  <button
                    onClick={() => setMode("breakout-select")}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="size-6 group-hover:animate-bounce" />
                    <div className="text-left">
                      <span className="block text-lg font-handwriting">
                        Breakout!
                      </span>
                      <span className="block text-xs opacity-80">
                        2 ảnh • phá gạch 💥
                      </span>
                    </div>
                    <Heart className="size-5 fill-current animate-pulse" />
                  </button>
                )}
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-12 max-w-7xl mx-auto px-2 sm:px-0">
                {photos.map((photo) => (
                  <PolaroidCard
                    key={photo.id}
                    image={photo.image}
                    caption={photo.caption}
                    onDelete={() => handleDeletePhoto(photo.id)}
                    onCaptionChange={(caption) =>
                      handleCaptionChange(photo.id, caption)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="size-24 text-pink-300 fill-current mx-auto mb-4 opacity-50" />
                <p className="text-xl text-gray-500 font-handwriting">
                  Chưa có tấm ảnh nào hết chơnnnnn.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}
