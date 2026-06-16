import { useState, useCallback } from "react";

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = ++_id;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  return { toasts, show, remove };
}
