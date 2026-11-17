import { useEffect, useState } from "react";

// Giả lập độ trễ của API để người dùng thấy trạng thái tải thật.
// Khi có backend, chỉ cần thay phần setTimeout bằng câu gọi fetch/axios.
export function useMockLoad(delay = 420, deps = []) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, deps);

  return loading;
}
