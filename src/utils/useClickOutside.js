import { useEffect } from "react";

// Calls `onOutside` on any pointer-down outside `ref.current` — used to
// close dropdowns/popovers when the user clicks elsewhere on the page.
export function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside]);
}
