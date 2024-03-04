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
  const [dragging, setDragging] = useState(false);

  const [hue, setHue] = useState(0);

  const [pureRGB, setPureRGB] = useState<RGB>(DEFAULT_RGB);
  const [finalRGB, setFinalRGB] = useState<RGB>(DEFAULT_RGB);

  const [coordinate, setCoordinate] = useState<Coordinate>({ x: 0, y: 0 });

  function getRelativeCoordinates(event, element) {
    // 获取元素的边界信息
    const bounds = element.getBoundingClientRect();

    // 计算相对坐标
    let x = event.clientX - bounds.left;
    let y = event.clientY - bounds.top;
    console.log("🚀 ~ getRelativeCoordinates ~ {x,y}:", { x, y });

    x = Math.max(x, 0);
    x = Math.min(x, bounds.width); // 改为height属性

    y = Math.max(y, 0);
    y = Math.min(y, bounds.height);

    return { x, y };
  }

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

  const startDragging = (e: any) => {
    setDragging(true);
    e.preventDefault(); // 防止鼠标光标选中页面上的其他元素
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const outDragging = (e: any) => {
    if (dragging) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      setCoordinate({ x, y });
    }
  };

  const doDrag = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (dragging) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      setCoordinate({ x, y });
    }
  };

  return (
    <div className="colorPicker">
      <div
        className="canvas-container"
        onMouseMove={doDrag}
        onMouseLeave={doDrag}
        onMouseUp={stopDragging}
      >
        <div
          onMouseDown={startDragging}
          ref={containerEl}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (dragging) {
              const { x, y } = getRelativeCoordinates(
                event,
                containerEl.current
              );
              setCoordinate({ x, y });
            }
          }}
          className="picker-canvas"
          style={{
            background: `linear-gradient(to bottom, transparent, #000),linear-gradient(to right, #fff, rgb(${pureRGB.r}, ${pureRGB.g},${pureRGB.b}))`,
          }}
        >
          {/* 那个点啊 */}
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
            <div className="click-position-dot-inner">
              {/* <div className="click-position-dot-inner2"></div> */}
            </div>
          </div>
        </div>

        {/* hue滑条 */}
        <ColorSlider
          onValueChange={(hue) => {
            setHue(hue);
          }}
        />
      </div>

      {/* 展示颜色的方块 */}
      <div
        className="output"
        style={{
          background: `rgb(${finalRGB.r},${finalRGB.g},${finalRGB.b})`,
        }}
      ></div>

      {/* 展示数值的 */}
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
