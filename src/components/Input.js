import { useState } from "react";

export function Input({ onChange }) {
  const [value, setValue] = useState();
  return (
    <input
      className="search"
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}
