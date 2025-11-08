import { Struct } from "@/lib/webgpu";
import { Dispatch, SetStateAction, useState } from "react";

import reloadIcon from "@/public/icons/reload.svg";

export default function NumericVariable({
  label,
  values: { min, value, max, def },
  object,
  field,
  integer,
  action,
}: {
  label: string;
  values: { min: number; value: number; max: number; def: number };
  object: object & Struct;
  field: string;
  integer?: boolean;
  action?: Dispatch<SetStateAction<boolean>>;
}) {
  const [val, setVal] = useState(value + "");
  const [changed, setChanged] = useState(value !== def);

  function commitChange(newVal: number) {
    if (integer) newVal = Math.ceil(newVal);
    setVal(newVal + "");
    object[field] = newVal;
    setChanged(newVal !== def);
    if (action) {
      action(true);
    }
  }

  function handleSlide(event: React.FormEvent<HTMLInputElement>) {
    let newVal = Number.parseFloat(event.currentTarget.value);
    newVal = Math.max(min, Math.min(max, newVal));
    commitChange(newVal);
  }

  function handleInput(event: React.FormEvent<HTMLInputElement>) {
    setVal(event.currentTarget.value);
  }

  function handleBlur() {
    const newVal = Math.max(min, Math.min(max, Number.parseFloat(val)));
    commitChange(newVal);
  }

  function handleKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    object[field] = Math.max(min, Math.min(max, Number.parseFloat(val) || min));
    event.currentTarget.blur();
  }

  function restoreDefault() {
    commitChange(def);
  }

  let step = (max - min) / 100;
  if (integer) step = Math.ceil(step);

  return (
    <>
      <label htmlFor={field} className="col-span-full">
        {label}
      </label>
      <input
        className="slider col-span-6"
        type="range"
        id={field}
        name={field}
        step={step}
        min={min}
        max={max}
        value={val}
        onInput={handleSlide}
      />
      <input
        className="border-1 border-gray-500 px-1 rounded-md col-span-4"
        type="number"
        step={step}
        value={val}
        min={min}
        max={max}
        id={field + "-value"}
        name={field + "-value"}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeys}
      />
      {changed && (
        <button
          onClick={restoreDefault}
          className="col-span-2 flex justify-center items-center"
          title="Restore"
        >
          <div
            dangerouslySetInnerHTML={{ __html: reloadIcon }}
            className="size-6 fill-white"
          />
        </button>
      )}
    </>
  );
}
