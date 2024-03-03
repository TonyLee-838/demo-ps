//@ts-nocheck

import React, { useEffect, useRef, useState } from "react";

import "./index.css";
import {
  Coordinate,
  createRGB,
  hsbToRgb,
  hueToRGB,
  RGB,
  syncPluginRGBToPhotoShop,
} from "../../utils";
import ColorSlider from "../ColorSlider";
import ColorForm from "../ColorForm";

const DEFAULT_RGB = createRGB(255, 0, 0);

export const ColorPicker = ({ onChange }: { onChange?: (c: RGB) => void }) => {
  const containerEl = useRef(null);

  const [hue, setHue] = useState(0);

  const [pureRGB, setPureRGB] = useState<RGB>(DEFAULT_RGB);
  const [finalRGB, setFinalRGB] = useState<RGB>(DEFAULT_RGB);

  const [coordinate, setCoordinate] = useState<Coordinate>({ x: 0, y: 0 });

  useEffect(() => {
    setPureRGB(hueToRGB(hue));
  }, [hue]);

  useEffect(() => {
    const saturation = coordinate.x / containerEl.current.offsetWidth;
    const brightness = 1 - coordinate.y / containerEl.current.offsetHeight;

    const finalRGB = hsbToRgb(hue, saturation, brightness);

    setFinalRGB(createRGB(...finalRGB));

    syncPluginRGBToPhotoShop(finalRGB);
  }, [coordinate, hue]);

  return (
    <div className="colorPicker">
      <div className="canvas-container">
        <div
          ref={containerEl}
          onClick={(event) => {
            // 获取点击事件相对于元素左上角的坐标
            const x = event.nativeEvent.offsetX;
            const y = event.nativeEvent.offsetY;

            setCoordinate({ x, y });
          }}
          className="picker-canvas"
          style={{
            background: `linear-gradient(to bottom, transparent, #000),linear-gradient(to right, #fff, rgb(${pureRGB.r}, ${pureRGB.g},${pureRGB.b}))`,
          }}
        >
          <div
            className="click-position-dot"
            style={{
              top: coordinate.y,
              left: coordinate.x,
            }}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <div className="click-position-dot-inner"></div>
          </div>
        </div>
        <ColorSlider
          onValueChange={(hue) => {
            setHue(hue);
          }}
        />
      </div>

      <div
        className="output"
        style={{
          background: `rgb(${finalRGB.r},${finalRGB.g},${finalRGB.b})`,
        }}
      ></div>

      <ColorForm
        value={{
          hue: hue,
          saturation: containerEl.current
            ? coordinate.x / containerEl.current.offsetWidth
            : 0,
          brightness: containerEl.current
            ? 1 - coordinate.y / containerEl.current.offsetHeight
            : 0,
          red: finalRGB.r,
          green: finalRGB.g,
          blue: finalRGB.b,
        }}
      />
    </div>
  );
};
