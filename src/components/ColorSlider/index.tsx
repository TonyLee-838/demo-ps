import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import "./index.css";
export type ColorSliderRefType = { setHue: (hue: number) => void };
export type ColorSliderProps = {
  onValueChange?: (color: number) => void;
};
type DragMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent;

function calculatePositionByHue(h: number, totalHeight: number) {
  let position = (1 - h / 360) * totalHeight;

  // 限制位置在滑块范围内
  position = Math.max(position, 0);
  position = Math.min(position, totalHeight);

  return position;
}

export default forwardRef<ColorSliderRefType, ColorSliderProps>(
  function ColorSlider({ onValueChange }, dotRef) {
    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState(0);

    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startDragging = (e: DragMouseEvent) => {
      setDragging(true);
      e.preventDefault(); // 防止鼠标光标选中页面上的其他元素
    };

    const stopDragging = () => {
      setDragging(false);
    };

    useImperativeHandle(dotRef, () => {
      return {
        setHue(hue: number) {
          const calculatedPosition = calculatePositionByHue(
            hue,
            Number(containerRef.current?.offsetHeight)
          );
          setPosition(calculatedPosition);
        },
      };
    });

    useEffect(() => {
      const mouseUpEventHandler = () => {
        // console.log("鼠标抬起啦！！！");
        setDragging(false);
      };

      /** 在全局body上注册一个事件监听 */
      document.body.addEventListener("mouseup", mouseUpEventHandler);

      return () => {
        /** 退出时要清除监听，防止内存泄漏 */
        document.body.removeEventListener("mouseup", mouseUpEventHandler);
      };
    }, []);

    const dragHandler = (e: DragMouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (containerRef.current) {
        const sliderRect = containerRef.current.getBoundingClientRect();
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

    const doDrag = (e: DragMouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (dragging && containerRef.current) {
        const sliderRect = containerRef.current.getBoundingClientRect();
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

    useEffect(() => {
      if (dragging) {
        /** 在全局body上注册一个事件监听 */
        document.body.addEventListener("mousemove", dragHandler);
      } else {
        // document.body.addEventListener("mousemove", dragHandler);
      }

      return () => {
        /** 退出时要清除监听，防止内存泄漏 */
        document.body.removeEventListener("mousemove", dragHandler);
      };
    }, [dragging]);

    return (
      <div
        className="slider-container"
        ref={containerRef}
        onMouseDown={startDragging}
        onMouseUp={stopDragging}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          doDrag(e);
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
          onClick={(e) => {
            e.preventDefault();
          }}
        ></div>
      </div>
    );
  }
);
