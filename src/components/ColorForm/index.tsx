import React from "react";

import "./index.css";

interface Field {
  name: string;
  isPercentage?: boolean;
  max: number;
  displayName: string;
}

const FormConfig: Field[] = [
  {
    name: "red",
    max: 255,
    displayName: "R",
  },
  {
    name: "green",
    max: 255,
    displayName: "G",
  },
  {
    name: "blue",
    max: 255,
    displayName: "B",
  },
  {
    name: "hue",
    max: 360,
    displayName: "H",
  },
  {
    name: "saturation",
    max: 100,
    isPercentage: true,
    displayName: "S",
  },
  {
    name: "brightness",
    max: 100,
    isPercentage: true,
    displayName: "V",
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
  onChange: (changedValue: Partial<Input>, fullValue: Input) => void;
}) {
  return (
    <div className="form">
      {FormConfig.map(({ max, name, isPercentage, displayName }) => {
        let val = value[name as keyof Input];

        return (
          <div className="item" key={`form_item_${name}`}>
            <div className="label">{displayName}</div>
            <input
              className="input"
              max={max}
              type="number"
              value={val}
              /** 表单改变时触发的事件 */
              onInput={(e) => {
                /** 表单输入的值，但是是 string类型 */
                const inputValue = (e.target as HTMLInputElement).value;

                if (Number(inputValue) > max) return;

                const partialUpdatedValue = {
                  /** 这里是改变的值，看一下是不是number */
                  [name]: Number.isNaN(Number(inputValue))
                    ? 0
                    : Number(inputValue),
                };

                const fullValue = {
                  /** 和这个表单改变无关的值，复制进来，比如这个是red表单，把其它的blue, green等不变的值复制进来 */
                  ...value,

                  /** 相同的key，后面的会覆盖前面的 */
                  ...partialUpdatedValue,
                };

                /** 传到外面去 */
                onChange(partialUpdatedValue, fullValue);
              }}
            />
            {isPercentage ? <span>%</span> : null}
          </div>
        );
      })}
    </div>
  );
}
