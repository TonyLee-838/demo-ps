import React, { useCallback, useEffect, useRef, useState } from "react";

import "./index.css";
import {
  Coordinate,
  createRGB,
  createHSV,
  hsbToRgb,
  hueToRGB,
  RGB,
  rgbToHue,
  rgbToHsb,
  linearToGammaSpaceExact,
  syncPluginRGBToPhotoShop,
  HSV,
} from "../../utils";
import ColorSlider, { ColorSliderRefType } from "../ColorSlider";
import ColorForm from "../ColorForm";

const DEFAULT_RGB = createRGB(255, 255, 255);
const DEFAULT_PureRGB = createRGB(255, 0, 0);

type DragMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent;

function getRelativeCoordinates(
  event: DragMouseEvent,
  element: HTMLDivElement
) {
  // 获取元素的边界信息
  const bounds = element?.getBoundingClientRect();

  if (!bounds) {
    return {
      x: 0,
      y: 0,
    };
  }

  // 计算相对坐标
  let x = event.clientX - bounds.left;
  let y = event.clientY - bounds.top;

  x = Math.max(x, 0);
  x = Math.min(x, bounds.width); // 改为height属性

  y = Math.max(y, 0);
  y = Math.min(y, bounds.height);

  return { x, y };
}

function calculateXYFromSV(
  saturation: number,
  brightness: number,
  element: HTMLDivElement
) {
  const x = (saturation / 100) * element.offsetWidth;
  const y = (1 - brightness / 100) * element.offsetHeight;
  return { x, y };
}

export const ColorPicker = ({ onChange }: { onChange?: (c: RGB) => void }) => {
  const containerEl = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);

  const [ifPassCol, setIfPassCol] = useState(false);

  const sliderRef = useRef<ColorSliderRefType>(null);

  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [brightness, setBrightness] = useState(100);

  const [pureRGB, setPureRGB] = useState<RGB>(DEFAULT_PureRGB);
  const [finalRGB, setFinalRGB] = useState<RGB>(DEFAULT_RGB);

  const [coordinate, setCoordinate] = useState<Coordinate>({ x: 0, y: 0 });

  useEffect(() => {
    // const photoshop = window.require("photoshop").action;
    // function listener() {
    //   console.log("Foreground color changed");
    // }
    // photoshop.addNotificationListener(["set"], listener);
    const photoshop = window.require("photoshop");
    const app = photoshop.app;
    const action = photoshop.action;
    action.addNotificationListener(["set"], (event, descriptor) => {
      //descriptor._target?.[0]?._property获取，确认是否为前景色
      const property = descriptor._target?.[0]?._property;
      if (property == "foregroundColor") {
        const gammaRed = linearToGammaSpaceExact(app.foregroundColor.rgb.red);
        const gammaGreen = linearToGammaSpaceExact(
          app.foregroundColor.rgb.green
        );
        const gammaBlue = linearToGammaSpaceExact(app.foregroundColor.rgb.blue);
        const psCol = createRGB(gammaRed, gammaGreen, gammaBlue);

        setFinalRGB(psCol);
        const psHSV = rgbToHsb(psCol.r, psCol.g, psCol.b);
        setHue(psHSV.h);
        setPureRGB(hueToRGB(psHSV.h));
        sliderRef.current?.setHue(psHSV.h);
        setSaturation(psHSV.s);
        setBrightness(psHSV.v);
        setCoordinate(calculateXYFromSV(psHSV.s, psHSV.v, containerEl.current));
      }

      //console.log("🚀 ~ useEffect ~ event:", event);
    });
  }, []);

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

  /** 保证重新渲染时，函数的引用不变 */
  const dragHandler = (e: DragMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (containerEl.current) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      setCoordinate({ x, y });

      const saturation = (x / containerEl.current.offsetWidth) * 100;
      const brightness = (1 - y / containerEl.current.offsetHeight) * 100;

      const finalRGB = hsbToRgb(hue, saturation, brightness);
      setSaturation(saturation);
      setBrightness(brightness);
      setFinalRGB(finalRGB);
      setIfPassCol(true);
      //syncPluginRGBToPhotoShop(finalRGB);
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
      document.body.removeEventListener("mousemove", dragHandler);
    };
  }, [dragging]);

  useEffect(() => {
    if (ifPassCol) {
      syncPluginRGBToPhotoShop(finalRGB);
    }
    setIfPassCol(false);
  }, [ifPassCol]);

  const startDragging = (e: DragMouseEvent) => {
    setDragging(true);
    e.preventDefault(); // 防止鼠标光标选中页面上的其他元素
  };

  const stopDragging = () => {
    setDragging(false);
  };

  const doDrag = (e: DragMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (dragging && containerEl.current) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      setCoordinate({ x, y });

      const saturation = (x / containerEl.current.offsetWidth) * 100;
      const brightness = (1 - y / containerEl.current.offsetHeight) * 100;
      const finalRGB = hsbToRgb(hue, saturation, brightness);
      setSaturation(saturation);
      setBrightness(brightness);

      setFinalRGB(finalRGB);
      setIfPassCol(true);
      //syncPluginRGBToPhotoShop(finalRGB);
    }
  };

  return (
    <div className="colorPicker">
      <div className="canvas-container" onMouseUp={stopDragging}>
        <div
          onMouseDown={startDragging}
          ref={containerEl}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            doDrag(event);
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
          ref={sliderRef}
          onValueChange={(hue) => {
            setHue(hue);
            setPureRGB(hueToRGB(hue));
            setFinalRGB(hsbToRgb(hue, saturation, brightness));
            setIfPassCol(true);
            //syncPluginRGBToPhotoShop(finalRGB);
          }}
        />
      </div>

      <div className="colorBlockAndForm">
        {/* 展示颜色的方块 */}
        <div
          className="output"
          style={{
            background: `rgb(${finalRGB.r},${finalRGB.g},${finalRGB.b})`,
          }}
        ></div>

        {/* 展示数值的 */}
        <ColorForm
          onChange={(changed, allValues) => {
            if (!containerEl.current) {
              return;
            }

            let tempRGB: RGB | null = null;
            if (changed.red != null) {
              tempRGB = createRGB(changed.red, allValues.green, allValues.blue);
            } else if (changed.green != null) {
              tempRGB = createRGB(allValues.red, changed.green, allValues.blue);
            } else if (changed.blue != null) {
              tempRGB = createRGB(allValues.red, allValues.green, changed.blue);
            }
            if (tempRGB) {
              //表单的rgb更改 触发hsv的更改。
              const finalHSV = rgbToHsb(tempRGB.r, tempRGB.g, tempRGB.b);
              const h = finalHSV.h;
              const s = finalHSV.s;
              const v = finalHSV.v;
              setHue(h);
              setPureRGB(hueToRGB(h));
              sliderRef.current?.setHue(h);
              setSaturation(s);
              setBrightness(v);
              setCoordinate(calculateXYFromSV(s, v, containerEl.current));
              setFinalRGB(tempRGB); // 这会触发上面定义的 useEffect
              setIfPassCol(true);
              //syncPluginRGBToPhotoShop(finalRGB);
            }

            let tempHSV: HSV | null = null;
            if (changed.hue != null) {
              tempHSV = createHSV(
                changed.hue,
                allValues.saturation,
                allValues.brightness
              );
            } else if (changed.saturation != null) {
              tempHSV = createHSV(
                allValues.hue,
                changed.saturation,
                allValues.brightness
              );
            } else if (changed.brightness != null) {
              tempHSV = createHSV(
                allValues.hue,
                allValues.saturation,
                changed.brightness
              );
            }
            if (tempHSV) {
              const h = tempHSV.h;
              const s = tempHSV.s;
              const v = tempHSV.v;
              setHue(h);
              setPureRGB(hueToRGB(h));
              sliderRef.current?.setHue(h);
              setSaturation(s);
              setBrightness(v);
              setCoordinate(calculateXYFromSV(s, v, containerEl.current));
              const tempRGB = hsbToRgb(h, s, v);
              setFinalRGB(tempRGB); // 这会触发上面定义的 useEffect
              setIfPassCol(true);
              //  syncPluginRGBToPhotoShop(finalRGB);
            }
          }}
          value={{
            hue: Math.round(hue),
            saturation: saturation,
            brightness: brightness,
            red: Math.round(finalRGB.r),
            green: Math.round(finalRGB.g),
            blue: Math.round(finalRGB.b),
          }}
        />
      </div>
    </div>
  );
};
