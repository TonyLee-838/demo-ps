import React from "react";

import "./index.css";

interface Field {
  name: string;
  isPercentage?: boolean;
  max: number;
}

const FormConfig: Field[] = [
  {
    name: "red",
    max: 255,
  },
  {
    name: "green",
    max: 255,
  },
  {
    name: "blue",
    max: 255,
  },
  {
    name: "hue",
    max: 360,
  },
  {
    name: "saturation",
    max: 100,
    isPercentage: true,
  },
  {
    name: "brightness",
    max: 100,
    isPercentage: true,
  },
];

interface Input {
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturation: number;
  brightness: number;
}

export default function ColorForm({
  value,
  onChange,
}: {
  value: Input;
  onChange: (value: Input) => void;
}) {
  return (
    <div className="form">
      {FormConfig.map(({ max, name, isPercentage }) => {
        let val = value[name as keyof Input];

        if (isPercentage) {
          val *= 100;
          val = Number(val.toFixed(2));
        }

        return (
          <div className="item" key={`form_item_${name}`}>
            <div className="label">{name}</div>
            <input className="input" max={max} type="number" value={val} />
            {isPercentage ? <span>%</span> : null}
          </div>
        );
      })}
    </div>
  );
}
