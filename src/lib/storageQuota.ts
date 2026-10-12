/**
 * Quản lý hạn mức và dung lượng lưu trữ LocalStorage
 * Giới hạn thông thường trên các trình duyệt: ~5MB UTF-16
 */

export const ESTIMATED_MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5MB

export interface StorageUsage {
  usedBytes: number;
  usedFormatted: string;
  maxBytes: number;
  maxFormatted: string;
  percentUsed: number;
  isNearLimit: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Tính toán tổng số bytes đang lưu trữ trong localStorage (kể cả key và value)
 */
export function getLocalStorageUsage(): StorageUsage {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {
      usedBytes: 0,
      usedFormatted: "0 B",
      maxBytes: ESTIMATED_MAX_STORAGE_BYTES,
      maxFormatted: formatBytes(ESTIMATED_MAX_STORAGE_BYTES),
      percentUsed: 0,
      isNearLimit: false,
    };
  }

  let totalChars = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalChars += key.length;
        const val = localStorage.getItem(key);
        if (val) {
          totalChars += val.length;
        }
      }
    }
  } catch (err) {
    console.warn("Lỗi khi kiểm tra dung lượng localStorage:", err);
  }

  // Trong JS, mỗi ký tự chuỗi tiêu tốn trung bình 2 bytes trong UTF-16
  const usedBytes = totalChars * 2;
  const percentUsed = Math.min(100, (usedBytes / ESTIMATED_MAX_STORAGE_BYTES) * 100);
  const isNearLimit = percentUsed >= 80;

  return {
    usedBytes,
    usedFormatted: formatBytes(usedBytes),
    maxBytes: ESTIMATED_MAX_STORAGE_BYTES,
    maxFormatted: formatBytes(ESTIMATED_MAX_STORAGE_BYTES),
    percentUsed,
    isNearLimit,
  };
}

/**
 * Lưu dữ liệu an toàn vào localStorage, bắt lỗi QuotaExceededError
 */
export function safeSetLocalStorage(
  key: string,
  value: string
): { success: boolean; error?: string } {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { success: false, error: "Môi trường không hỗ trợ localStorage." };
  }

  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err: any) {
    console.error(`Lỗi khi lưu key "${key}" vào localStorage:`, err);
    if (
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014
    ) {
      return {
        success: false,
        error: "Bộ nhớ lưu trữ trình duyệt (LocalStorage ~5MB) đã vượt quá dung lượng cho phép. Vui lòng giảm kích thước ảnh hoặc xóa bớt dữ liệu cũ.",
      };
    }
    return {
      success: false,
      error: `Không thể lưu dữ liệu: ${err.message || "Lỗi không xác định"}`,
    };
  }
}
