import { Struct } from "@/lib/webgpu";
import { useState } from "react";

export default function Slider({
  label,
  range: [min, value, max],
  step,
  object,
  field,
  numberInput,
}: {
  label: string;
  range: [number, number, number];
  step?: number;
  object: object & Struct;
  field: string;
  numberInput?: boolean;
}) {
  const [val, setVal] = useState(value);

  function onInput(event: React.FormEvent<HTMLInputElement>) {
    let newVal = Number.parseFloat(event.currentTarget.value) || 0;
    newVal = Math.max(min, Math.min(max, newVal));
    object[field] = newVal;
    setVal(newVal);
  }

  return (
    <div className="flex flex-col px-2 py-[2px]">
      <label htmlFor={field}>{label}</label>
      <div className="flex gap-3">
        <input
          className="slider"
          type="range"
          id={field}
          name={field}
          step={step}
          min={min}
          max={max}
          value={val}
          onInput={onInput}
        />
        {numberInput && (
          <input
            className="w-20 border-1 border-gray-500 px-1 rounded-md"
            type="number"
            step={step}
            value={val}
            min={min}
            max={max}
            id={field + "-value"}
            name={field + "-value"}
            onInput={onInput}
          />
        )}
      </div>
    </div>
  );
}
