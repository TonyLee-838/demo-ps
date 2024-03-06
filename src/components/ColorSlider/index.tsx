import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import "./index.css";
import { debounce } from "lodash-es";
export type ColorSliderRefType = { setHue: (hue: number) => void };

export default forwardRef(function ColorSlider(
  {
    onValueChange,
  }: {
    onValueChange?: (color: number) => void;
  },
  dotRef: React.ForwardedRef<ColorSliderRefType>
) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const containerHue = useRef<HTMLDivElement>(null);

  const startDragging = (e: any) => {
    setDragging(true);
    e.preventDefault(); // 防止鼠标光标选中页面上的其他元素
  };

  const stopDragging = () => {
    setDragging(false);
  };
  function calculatePositionByHue(h: number) {
    const totalHeight = containerHue.current.offsetHeight;
    let position = (1 - h / 360) * totalHeight;

    // 限制位置在滑块范围内
    position = Math.max(position, 0);
    position = Math.min(position, totalHeight);

    return position;
  }

  useImperativeHandle(dotRef, () => {
    return {
      setHue(hue: number) {
        const calculatedPosition = calculatePositionByHue(hue);
        setPosition(calculatedPosition);
      },
    };
  });

  useEffect(() => {
    const mouseUpEventHandler = () => {
      console.log("鼠标抬起啦！！！");
      setDragging(false);
    };

    /** 在全局body上注册一个事件监听 */
    document.body.addEventListener("mouseup", mouseUpEventHandler);

    return () => {
      /** 退出时要清除监听，防止内存泄漏 */
      document.body.removeEventListener("mouseup", mouseUpEventHandler);
    };
  }, []);

  const doDrag = (e: any) => {
    // e.stopPropagation();
    // e.preventDefault();
    console.log("🚀dragging!!!!!");
    if (dragging) {
      const sliderRect = e.currentTarget.getBoundingClientRect();
      console.log("🚀 ~ doDrag ~ sliderRect:", sliderRect);

      let newPosition = e.clientY - sliderRect.top; // 改为clientY和top属性
      console.log("🚀 ~ doDrag ~ clientY:", e.clientY);

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
      ref={containerHue}
      // onMouseDown={doDrag}
      onMouseMove={doDrag}
      onMouseLeave={doDrag}
      onMouseUp={stopDragging}
      onClick={(e) => {
        // e.preventDefault();
        // e.stopPropagation();

        const sliderRect = e.currentTarget.getBoundingClientRect();
        let newPosition = e.clientY - sliderRect.top; // 改为clientY和top属性

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
});
