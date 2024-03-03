//@ts-nocheck

import React, { useRef, useState } from "react";

import { WC } from "../WC";

import "./index.css";

type Color = [number, number, number];

export const ColorPicker = ({ onChange }: { onChange: (c: Color) => void }) => {
  const containerEl = useRef(null);
  const _sldR = useRef(null);
  const _sldG = useRef(null);
  const _sldB = useRef(null);
  const _txtR = useRef(null);
  const _txtG = useRef(null);
  const _txtB = useRef(null);

  const [R, setR] = useState(0xf0);
  const [G, setG] = useState(0xc0);
  const [B, setB] = useState(0xa0);

  const [finalR, setFinalR] = useState(0xf0);
  const [finalG, setFinalG] = useState(0xc0);
  const [finalB, setFinalB] = useState(0xa0);

  const updateColor = (evt) => {
    const target = evt.target;
    const part = target.getAttribute("data-part");
    switch (part) {
      case "R":
        setR(Number(target.value));
        break;
      case "G":
        setG(Number(target.value));
        break;
      case "B":
        setB(Number(target.value));
        break;
      default:
        break;
    }
  };

  return (
    <div className="colorPicker">
      <div
        ref={containerEl}
        onClick={(event) => {
          console.log("🚀 ~ ColorPicker ~ event:", event);
          // 获取点击事件相对于元素左上角的坐标
          const x = event.nativeEvent.offsetX;
          const y = event.nativeEvent.offsetY;

          // 计算点击位置与元素尺寸的比例
          const xRatio = x / containerEl.current.offsetWidth;
          console.log("🚀 ~ ColorPicker ~ xRatio:", xRatio);
          const yRatio = y / containerEl.current.offsetHeight;
          console.log("🚀 ~ ColorPicker ~ yRatio:", yRatio);

          // 假设基准颜色是红色
          const baseRed = 255;
          const baseGreen = 0;
          const baseBlue = 0;

          // 计算与白色混合的比例
          const mixRed = Math.round(baseRed + (255 - baseRed) * xRatio);
          const mixGreen = Math.round(baseGreen + (255 - baseGreen) * xRatio);
          const mixBlue = Math.round(baseBlue + (255 - baseBlue) * xRatio);

          // 计算与黑色混合的比例
          const finalRed = Math.round(mixRed * (1 - yRatio));
          const finalGreen = Math.round(mixGreen * (1 - yRatio));
          const finalBlue = Math.round(mixBlue * (1 - yRatio));
          console.log(
            "🚀 ~ ColorPicker ~ final rgb:",
            finalRed,
            finalGreen,
            finalBlue
          );

          setFinalR(finalRed);
          setFinalG(finalGreen);
          setFinalB(finalBlue);
        }}
        className="color"
        style={{
          background: `linear-gradient(to bottom, transparent, #000),linear-gradient(to right, #fff, rgb(${R}, ${G},${B}))`,
          width: 400,
          height: 400,
        }}
      ></div>
      <div>
        output:{" "}
        <div
          className="output"
          style={{
            background: `rgb(${finalR},${finalG},${finalB})`,
            width: 100,
            height: 100,
            borderRadius: 8,
          }}
        ></div>
      </div>
      <WC onInput={updateColor}>
        <div className="sliderWithInput">
          <div className="filledRange">
            <sp-slider
              ref={_sldR}
              data-part="R"
              value={R}
              min={0}
              max={255}
              show-value="false"
            >
              <sp-label slot="label">Red</sp-label>
            </sp-slider>
          </div>
          <sp-textfield
            ref={_txtR}
            data-part="R"
            type="number"
            value={R}
            min={0}
            max={255}
          ></sp-textfield>
        </div>
        <div className="sliderWithInput">
          <div className="filledRange">
            <sp-slider
              ref={_sldG}
              data-part="G"
              value={G}
              min={0}
              max={255}
              show-value="false"
            >
              <sp-label slot="label">Green</sp-label>
            </sp-slider>
          </div>
          <sp-textfield
            ref={_txtG}
            data-part="G"
            type="number"
            value={G}
            min={0}
            max={255}
          ></sp-textfield>
        </div>
        <div className="sliderWithInput">
          <div className="filledRange">
            <sp-slider
              ref={_sldB}
              data-part="B"
              value={B}
              min={0}
              max={255}
              show-value="false"
            >
              <sp-label slot="label">Blue</sp-label>
            </sp-slider>
          </div>
          <sp-textfield
            ref={_txtB}
            data-part="B"
            type="number"
            value={B}
            min={0}
            max={255}
          ></sp-textfield>
        </div>
      </WC>
    </div>
  );
};
