/**
 * Client-Side Image Compression Utility
 * Tự động thu nhỏ độ phân giải và nén ảnh logo để bảo vệ hạn mức LocalStorage 5MB.
 */

export interface CompressionResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  compressionRatio: number; // e.g. 85 (%)
  width: number;
  height: number;
}

export async function compressImageFile(
  file: File,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.85
): Promise<CompressionResult> {
  const originalBytes = file.size;

  return new Promise((resolve, reject) => {
    // If running in an environment without browser FileReader / Image
    if (typeof window === "undefined" || typeof FileReader === "undefined") {
      reject(new Error("Image compression chỉ khả dụng trên trình duyệt."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Dữ liệu ảnh rỗng."));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Không thể nạp tệp ảnh vào trình xử lý."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Giữ tỉ lệ khung hình (Aspect Ratio)
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không thể khởi tạo Canvas 2D context."));
          return;
        }

        // Bật làm mịn ảnh
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        // Xuất định dạng WebP nếu hỗ trợ, fallback sang PNG/JPEG
        let mimeType = "image/webp";
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Nếu trình duyệt không xuất được webp (trả về data:image/png) và kích thước lớn
        if (dataUrl.startsWith("data:image/png") && file.type === "image/jpeg") {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Tính dung lượng xấp xỉ của base64 string
        // base64 length * 0.75 = approximate byte length
        const base64Data = dataUrl.split(",")[1] || "";
        const compressedBytes = Math.round(base64Data.length * 0.75);

        const savedRatio = originalBytes > 0
          ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
          : 0;

        resolve({
          dataUrl,
          originalBytes,
          compressedBytes,
          compressionRatio: savedRatio,
          width,
          height,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
