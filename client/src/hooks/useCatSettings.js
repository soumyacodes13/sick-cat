import { useState } from "react";

export function useCatSettings() {
  const [catColor, setCatColorState] = useState(
    () => localStorage.getItem("catColor") || "#c4956a"
  );
  const [accessory, setAccessoryState] = useState(
    () => localStorage.getItem("catAccessory") || "none"
  );

  const setCatColor = (color) => {
    setCatColorState(color);
    localStorage.setItem("catColor", color);
  };

  const setAccessory = (acc) => {
    setAccessoryState(acc);
    localStorage.setItem("catAccessory", acc);
  };

  return { catColor, setCatColor, accessory, setAccessory };
}
