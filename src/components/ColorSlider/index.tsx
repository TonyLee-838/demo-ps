import React, { useRef, useState } from "react";

import "./index.css";
import { debounce } from "lodash-es";

export default function ColorSlider({
  onValueChange,
}: {
  onValueChange?: (color: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const startDragging = (e: any) => {
    setDragging(true);
    e.preventDefault(); // 防止鼠标光标选中页面上的其他元素
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const doDrag = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    if (dragging) {
      const sliderRect = e.currentTarget.getBoundingClientRect();
      let newPosition = e.clientY - sliderRect.top; // 改为clientY和top属性
      newPosition = Math.max(newPosition, 0);
      newPosition = Math.min(newPosition, sliderRect.height); // 改为height属性

      const currentHeight = newPosition;
      const totalHeight = sliderRect.height;

      const h = (1 - currentHeight / totalHeight) * 360;

      onValueChange?.(h);

      setPosition(newPosition);
    }
  };

  return (
    <div
      className="slider-container"
      // onMouseDown={doDrag}
      onMouseMove={doDrag}
      //onMouseLeave={stopDragging}
      onMouseUp={stopDragging}
      onClick={(e) => {
        //  console.log("🚀 ~ e:", e);
        e.preventDefault();
        e.stopPropagation();

        const sliderRect = e.currentTarget.getBoundingClientRect();
        let newPosition = e.clientY - sliderRect.top; // 改为clientY和top属性
        // console.log("🚀 ~ newPosition:", newPosition);

        newPosition = Math.max(newPosition, 0);
        newPosition = Math.min(newPosition, sliderRect.height); // 改为height属性

        const currentHeight = newPosition;
        const totalHeight = sliderRect.height;

        const h = (1 - currentHeight / totalHeight) * 360;

        onValueChange?.(h);

        setPosition(newPosition);
      }}
    >
      <div
        className="track"
        style={{
          background:
            "linear-gradient(to top, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
          border: "1px solid #000",
        }}
      ></div>
      <div
        ref={ref}
        style={{ top: `${position}px` }} // 改为top样式
        className="dot"
        onMouseDown={startDragging}
      ></div>
    </div>
  );
}
