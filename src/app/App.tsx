import { useState } from "react";
import { Heart, Upload, Camera, Gamepad2, ImageIcon } from "lucide-react";
import { PolaroidCard } from "./components/PolaroidCard";
import { MemoryGame } from "./components/MemoryGame";

const MIN_CARDS_TO_PLAY = 4;

interface Photo {
  id: string;
  image: string;
  caption: string;
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mode, setMode] = useState<"dashboard" | "game">("dashboard");

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-50 to-rose-100">
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
              : "Tìm Đỉm Chungggg 💕"}
          </p>
        </div>

        {/* Mode Toggle — only show in dashboard if there are enough cards */}
        {mode === "dashboard" && photos.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg flex items-center gap-1">
              <button
                onClick={() => setMode("dashboard")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium ${mode === "dashboard"
                  ? "bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md"
                  : "text-gray-600 hover:text-pink-500"
                  }`}
              >
                <ImageIcon className="size-4" />
                Photos
              </button>
              <button
                onClick={() => {
                  if (canPlay) setMode("game");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium ${!canPlay
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
                <Gamepad2 className="size-4" />
                Memory Game
                {!canPlay && (
                  <span className="text-[10px] bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                    {photos.length}/{MIN_CARDS_TO_PLAY}
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
              <div className="max-w-md mx-auto mb-10 text-center">
                <button
                  onClick={() => setMode("game")}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Gamepad2 className="size-6 group-hover:animate-bounce" />
                  <div className="text-left">
                    <span className="block text-lg font-handwriting">
                      Play Memory Game!
                    </span>
                    <span className="block text-xs opacity-80">
                      {photos.length} photos • {photos.length * 2} cards to match
                    </span>
                  </div>
                  <Heart className="size-5 fill-current animate-pulse" />
                </button>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 max-w-7xl mx-auto">
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
