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
  onChange: (changedValue: Partial<Input>, fullValue: Input) => void;
}) {
  return (
    <div className="form">
      {FormConfig.map(({ max, name, isPercentage }) => {
        let val = value[name as keyof Input];

        // if (isPercentage) {
        //   val *= 100;
        //   val = Math.round(Number(val));
        // }

        return (
          <div className="item" key={`form_item_${name}`}>
            <div className="label">{name}</div>
            <input
              className="input"
              max={max}
              type="number"
              value={val}
              /** 表单改变时触发的事件 */
              onInput={(e) => {
                /** 表单输入的值，但是是 string类型 */
                const inputValue = e.target.value;
                if (inputValue > max) return;

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
