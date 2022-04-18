import { useState } from "react";

export function Input({ onChange, placeholder }) {
  const [value, setValue] = useState();
  return (
    <input
      placeholder={placeholder}
      className="input"
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}
