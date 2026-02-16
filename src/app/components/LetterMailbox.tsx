import { useState } from "react";
import {
  Heart,
  Mail,
  MailOpen,
  ArrowLeft,
  Send,
  X,
  Inbox,
  Download,
  Share2,
  Check,
} from "lucide-react";

interface Letter {
  id: string;
  image: string;
  receivedAt: string;
}

interface LetterMailboxProps {
  letters: Letter[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function LetterMailbox({ letters, onBack, onDelete }: LetterMailboxProps) {
  const [openLetterId, setOpenLetterId] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const openLetter = letters.find((l) => l.id === openLetterId);

  const handleEnvelopeClick = (id: string) => {
    if (animatingId) return;
    setAnimatingId(id);
    setTimeout(() => {
      setOpenLetterId(id);
      setAnimatingId(null);
    }, 800);
  };

  const handleClose = () => {
    setOpenLetterId(null);
    setSaved(false);
    setShowEmailModal(false);
    setEmailSent(false);
  };

  /* Screenshot & download the letter card */
  const handleScreenshot = async () => {
    if (!openLetter) return;
    try {
      // Load the letter image into an Image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = openLetter.image;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image failed to load"));
      });

      // Draw a nice card on a canvas
      const PAD = 40;
      const HEADER_H = 60;
      const FOOTER_H = 40;
      const cardW = Math.max(img.naturalWidth, 600);
      const scale = cardW / img.naturalWidth;
      const imgH = img.naturalHeight * scale;
      const canvasW = cardW + PAD * 2;
      const canvasH = HEADER_H + imgH + PAD + FOOTER_H + PAD;

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(0, 0, canvasW, canvasH, 16);
      ctx.fill();

      // Header gradient
      const headerGrad = ctx.createLinearGradient(0, 0, canvasW, 0);
      headerGrad.addColorStop(0, "#ffe4e6");
      headerGrad.addColorStop(0.5, "#fce7f3");
      headerGrad.addColorStop(1, "#fecdd3");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, canvasW, HEADER_H);

      // Header text
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 24px serif";
      ctx.textAlign = "center";
      ctx.fillText("💌 Thư Tình Bé Nhỏ 💌", canvasW / 2, HEADER_H / 2 + 8);

      // Letter image
      const imgX = PAD;
      const imgY = HEADER_H + PAD / 2;
      ctx.drawImage(img, imgX, imgY, cardW, imgH);

      // Footer
      const footerY = canvasH - FOOTER_H;
      const footerGrad = ctx.createLinearGradient(0, footerY, canvasW, footerY);
      footerGrad.addColorStop(0, "#fdf2f8");
      footerGrad.addColorStop(1, "#fff1f2");
      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, footerY, canvasW, FOOTER_H);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px serif";
      ctx.textAlign = "left";
      ctx.fillText(openLetter.receivedAt, 20, footerY + 26);
      ctx.textAlign = "right";
      ctx.fillText("♡ ♡ ♡", canvasW - 20, footerY + 26);

      // Download
      const link = document.createElement("a");
      link.download = `thu-tinh-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Screenshot failed", err);
      // Fallback: just download the raw image
      if (openLetter) {
        const link = document.createElement("a");
        link.download = `thu-tinh-${Date.now()}.png`;
        link.href = openLetter.image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    }
  };

  /* Open mailto with the letter image as context */
  const handleSendEmail = () => {
    if (!emailTo.trim() || !openLetter) return;
    setEmailSending(true);

    // Build a mailto link — the image can't be attached via mailto,
    // so we include a sweet message and they can attach the saved screenshot.
    const subject = encodeURIComponent("💌 Thư Tình Bé Nhỏ - Chiện Đôi Ta");
    const body = encodeURIComponent(
      `Anh/Em gửi cho bạn một lá thư tình nè! 💕\n\n` +
      `Ngày gửi: ${openLetter.receivedAt}\n\n` +
      `(Nhớ lưu ảnh lá thư rồi đính kèm vào email nha! 📎)\n\n` +
      `— Gửi từ Chiện Đôi Ta 💌`
    );

    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, "_blank");

    setTimeout(() => {
      setEmailSending(false);
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
      }, 2000);
    }, 800);
  };

  /* ── Fullscreen letter reader ── */
  if (openLetter) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        {/* Parchment texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="size-6 text-gray-600" />
        </button>

        {/* Letter content */}
        <div className="relative animate-letter-slide-up w-full max-w-lg">
          {/* Paper letter — screenshot target */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-amber-200">
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-red-100 px-6 py-4 flex items-center gap-3 border-b border-pink-200">
              <Heart className="size-5 text-red-400 fill-current" />
              <p className="font-handwriting text-red-500 text-lg">
                Thư Tình Bé Nhỏ 💌
              </p>
              <Heart className="size-5 text-red-400 fill-current" />
            </div>

            {/* Letter image */}
            <div className="p-4 sm:p-6">
              <div className="relative rounded-lg overflow-hidden shadow-inner bg-amber-50">
                <img
                  src={openLetter.image}
                  alt="Lá thư tay"
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              </div>
            </div>

            {/* Decorative footer */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-3 flex items-center justify-between border-t border-pink-100">
              <span className="text-xs text-gray-400 font-handwriting">
                {openLetter.receivedAt}
              </span>
              <div className="flex items-center gap-1">
                <Heart className="size-3 text-pink-300 fill-current" />
                <Heart className="size-3 text-red-300 fill-current" />
                <Heart className="size-3 text-pink-300 fill-current" />
              </div>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex items-center justify-center gap-3 mt-5">
            {/* Screenshot / Download */}
            <button
              onClick={handleScreenshot}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all text-sm font-medium ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:shadow-xl"
              }`}
            >
              {saved ? (
                <>
                  <Check className="size-4" />
                  <span className="font-handwriting">Đã lưu!</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span className="font-handwriting">Lưu Ảnh</span>
                </>
              )}
            </button>

            {/* Send to email */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium"
            >
              <Share2 className="size-4" />
              <span className="font-handwriting">Gửi Email</span>
            </button>
          </div>

          {/* Stamp decoration */}
          <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-sm shadow-lg flex items-center justify-center rotate-12 border-2 border-dashed border-white/50">
            <Heart className="size-8 sm:size-10 text-white fill-current" />
          </div>
        </div>

        {/* Email modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-letter-slide-up">
              {/* Modal header */}
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-4 flex items-center justify-between border-b border-pink-200">
                <div className="flex items-center gap-2">
                  <Mail className="size-5 text-red-400" />
                  <h3 className="font-handwriting text-red-500 text-lg">Gửi Thư Qua Email</h3>
                </div>
                <button
                  onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                  className="p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {emailSent ? (
                  <div className="text-center py-4">
                    <Check className="size-12 text-green-500 mx-auto mb-3" />
                    <p className="font-handwriting text-green-600 text-lg">Đã mở mail rồi nè! 💌</p>
                    <p className="text-sm text-gray-400 mt-1">Nhớ đính kèm ảnh lá thư nha!</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 font-handwriting mb-4">
                      Nhập email người nhận, lưu ảnh trước rồi đính kèm vào email nha! 💕
                    </p>

                    <div className="mb-4">
                      <label className="block text-sm font-handwriting text-gray-600 mb-1.5">Email người nhận</label>
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-red-400 focus:outline-none transition-colors text-sm bg-pink-50/50"
                        onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                      />
                    </div>

                    {/* Quick tip */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                      <p className="text-xs text-amber-700 font-handwriting">
                        💡 Tip: Nhấn "Lưu Ảnh" trước để tải ảnh thư, rồi đính kèm vào email nha!
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-handwriting text-sm"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={!emailTo.trim() || emailSending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-handwriting text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="size-4" />
                        {emailSending ? "Đang gửi..." : "Gửi Email"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Mailbox list view ── */
  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors font-handwriting text-lg mb-6"
      >
        <ArrowLeft className="size-5" />
        <Heart className="size-5 fill-current text-pink-400" />
        Quay lại nhaaa
      </button>

      {/* Mailbox header */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-4">
          {/* Mailbox icon */}
          <div className="w-24 h-28 sm:w-32 sm:h-36 mx-auto relative">
            {/* Mailbox body */}
            <div className="absolute bottom-0 w-full h-20 sm:h-24 bg-gradient-to-b from-red-400 to-red-600 rounded-t-xl rounded-b-md shadow-lg border-2 border-red-700/30">
              {/* Mail slot */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-2 bg-red-800 rounded-full" />
              {/* Flag */}
              <div className="absolute -right-2 top-2 w-2 h-10 bg-gray-400 rounded-full">
                <div className="absolute -top-1 -left-1 w-4 h-6 bg-red-500 rounded-sm shadow animate-pulse" />
              </div>
            </div>
            {/* Mailbox roof */}
            <div className="absolute bottom-[76px] sm:bottom-[92px] w-full h-6 sm:h-8 bg-gradient-to-b from-red-500 to-red-400 rounded-t-2xl border-2 border-red-700/30 border-b-0" />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-handwriting text-red-500 mb-2">
          Hộp Thư Tình 💌
        </h2>
        <p className="text-gray-500 font-handwriting">
          {letters.length === 0
            ? "Hộp thư trống trơn... gửi thư đi nàooo! ✉️"
            : `${letters.length} lá thư đang chờ mở 💕`}
        </p>
      </div>

      {/* Letters grid */}
      {letters.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="size-20 text-pink-200 mx-auto mb-4" />
          <p className="text-lg text-gray-400 font-handwriting">
            Chưa có lá thư nào hết á...
          </p>
          <p className="text-sm text-gray-400 font-handwriting mt-1">
            Upload ảnh thư tay ở trang chủ nha 💌
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {letters.map((letter) => {
            const isAnimating = animatingId === letter.id;

            return (
              <div key={letter.id} className="flex flex-col items-center">
                {/* Envelope */}
                <button
                  onClick={() => handleEnvelopeClick(letter.id)}
                  className="group relative w-64 h-44 sm:w-72 sm:h-48 cursor-pointer"
                  style={{ perspective: "800px" }}
                >
                  {/* Envelope body */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-xl border border-amber-300 overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    {/* Envelope bottom flap (V shape) */}
                    <div className="absolute inset-0">
                      <svg
                        viewBox="0 0 288 192"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        {/* Left fold */}
                        <polygon
                          points="0,0 144,96 0,192"
                          fill="rgba(217,178,130,0.4)"
                        />
                        {/* Right fold */}
                        <polygon
                          points="288,0 144,96 288,192"
                          fill="rgba(217,178,130,0.3)"
                        />
                        {/* Bottom fold line */}
                        <line
                          x1="0"
                          y1="0"
                          x2="144"
                          y2="96"
                          stroke="rgba(180,140,90,0.3)"
                          strokeWidth="1"
                        />
                        <line
                          x1="288"
                          y1="0"
                          x2="144"
                          y2="96"
                          stroke="rgba(180,140,90,0.3)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>

                    {/* Peek of letter inside */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-white rounded-t-sm border border-amber-200 shadow-inner overflow-hidden">
                      <img
                        src={letter.image}
                        alt=""
                        className="w-full h-full object-cover opacity-60 blur-[1px]"
                      />
                    </div>

                    {/* Heart seal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="size-5 sm:size-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Envelope top flap (triangle) */}
                  <div
                    className={`absolute top-0 left-0 right-0 origin-top transition-transform duration-700 ease-in-out ${
                      isAnimating ? "envelope-flap-open" : ""
                    }`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <svg
                      viewBox="0 0 288 96"
                      className="w-full"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points="0,0 288,0 144,96"
                        className="fill-amber-200 stroke-amber-300"
                        strokeWidth="1"
                      />
                      {/* Inner shadow on flap */}
                      <polygon
                        points="4,2 284,2 144,92"
                        fill="rgba(180,140,90,0.15)"
                      />
                    </svg>
                  </div>

                  {/* Open hint */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-handwriting text-pink-400 whitespace-nowrap bg-white/80 px-3 py-1 rounded-full shadow">
                      Nhấn để mở thư 💌
                    </span>
                  </div>

                  {/* Delete button */}
                  <div
                    className="absolute -top-2 -right-2 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(letter.id);
                    }}
                  >
                    <div className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer">
                      <X className="size-4 text-white" />
                    </div>
                  </div>
                </button>

                {/* Letter info */}
                <div className="mt-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    {isAnimating ? (
                      <MailOpen className="size-4 text-pink-400" />
                    ) : (
                      <Mail className="size-4 text-pink-400" />
                    )}
                    <span className="font-handwriting text-gray-500 text-sm">
                      {letter.receivedAt}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating send button hint */}
      <div className="fixed bottom-8 right-8 z-40 hidden sm:block">
        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform cursor-default">
          <Send className="size-6" />
        </div>
      </div>
    </div>
  );
}
