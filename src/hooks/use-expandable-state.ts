import { useState } from "react";

export function useExpandableState(expanded = false) {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return {
    isExpanded,
    toggleExpanded,
  };
}
