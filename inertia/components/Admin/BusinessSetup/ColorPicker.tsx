import React, { useEffect } from 'react';

export default function ColorPicker({
  value,
  onChange,
  shade,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  shade: string;
  ariaLabel: string;
}) {
  const [color, setColor] = React.useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  return (
    <div className="flex flex-col text-secondary-500">
      <label
        className="w-16 h-10 p-0 relative mb-1.5 rounded-sm hover:cursor-pointer"
        style={{ background: color }}
      >
        <input
          type="color"
          aria-label={ariaLabel}
          className="opacity-0 border-none absolute top-0 left-0 inset-0 w-full h-full outline-none text-white appearance-none shadow-none hover:cursor-pointer"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            onChange(e.target.value);
          }}
        />
      </label>
      <span className="block text-sm font-medium leading-4">{shade} </span>
      <span className="block text-xs font-normal leading-4">{value} </span>
    </div>
  );
}
