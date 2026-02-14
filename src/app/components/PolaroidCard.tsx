import { Heart, X } from "lucide-react";
import { useState } from "react";

interface PolaroidCardProps {
  image: string;
  caption: string;
  onDelete: () => void;
  onCaptionChange: (caption: string) => void;
}

export function PolaroidCard({ image, caption, onDelete, onCaptionChange }: PolaroidCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCaption, setTempCaption] = useState(caption);
  const [isLiked, setIsLiked] = useState(false);

  const handleSaveCaption = () => {
    onCaptionChange(tempCaption);
    setIsEditing(false);
  };

  return (
    <div className="relative group">
      {/* Polaroid Card */}
      <div className="bg-white p-3 shadow-lg rotate-0 hover:rotate-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
        >
          <X className="size-4" />
        </button>

        {/* Image Container */}
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          <img
            src={image}
            alt={caption}
            className="w-full h-full object-cover"
          />
          
          {/* Heart Button Overlay */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <Heart
              className={`size-5 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Caption Area */}
        <div className="mt-3 min-h-[60px]">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={tempCaption}
                onChange={(e) => setTempCaption(e.target.value)}
                className="w-full px-2 py-1 text-center border border-pink-200 rounded focus:outline-none focus:border-pink-400"
                placeholder="Add a caption..."
                autoFocus
                maxLength={50}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCaption}
                  className="flex-1 px-3 py-1 bg-pink-400 text-white text-sm rounded hover:bg-pink-500"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempCaption(caption);
                    setIsEditing(false);
                  }}
                  className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-center hover:text-pink-500 transition-colors"
            >
              <p className="font-handwriting text-gray-700">
                {caption || "Click to add caption..."}
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Decorative hearts */}
      <div className="absolute -top-6 -left-6 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
        <Heart className="size-8 fill-current" />
      </div>
      <div className="absolute -bottom-6 -right-6 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse delay-100">
        <Heart className="size-6 fill-current" />
      </div>
    </div>
  );
}
