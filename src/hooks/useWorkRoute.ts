import { useEffect, useState } from "react";
import { parseWorkRoute } from "../lib/navigation";

export function useWorkRoute(): string | null {
  const [workId, setWorkId] = useState(() => parseWorkRoute(window.location.pathname));

  useEffect(() => {
    const sync = () => setWorkId(parseWorkRoute(window.location.pathname));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return workId;
}
