//@ts-nocheck

import React, { useEffect, useRef, useState } from "react";

import "./index.css";
import {
  Coordinate,
  createRGB,
  hsbToRgb,
  hueToRGB,
  RGB,
  rgbToHue,
  rgbToHsb,
  rgbToHsv,
  syncPluginRGBToPhotoShop,
} from "../../utils";
import ColorSlider from "../ColorSlider";
import ColorForm from "../ColorForm";

const DEFAULT_RGB = createRGB(255, 0, 0);

export const ColorPicker = ({ onChange }: { onChange?: (c: RGB) => void }) => {
  const containerEl = useRef(null);
  const [dragging, setDragging] = useState(false);

  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);

  const [pureRGB, setPureRGB] = useState<RGB>(DEFAULT_RGB);
  const [finalRGB, setFinalRGB] = useState<RGB>(DEFAULT_RGB);

  const [coordinate, setCoordinate] = useState<Coordinate>({ x: 0, y: 0 });

  function calculateXYFromSV(saturation, brightness, container) {
    const x = saturation * container.current.offsetWidth;
    const y = (1 - brightness) * container.current.offsetHeight;
    return { x, y };
  }

  function getRelativeCoordinates(event, element) {
    // 获取元素的边界信息
    const bounds = element.getBoundingClientRect();

    // 计算相对坐标
    let x = event.clientX - bounds.left;
    let y = event.clientY - bounds.top;
    // console.log("🚀 ~ getRelativeCoordinates ~ {x,y}:", { x, y });

    x = Math.max(x, 0);
    x = Math.min(x, bounds.width); // 改为height属性

    y = Math.max(y, 0);
    y = Math.min(y, bounds.height);

    return { x, y };
  }

  useEffect(() => {
    const mouseUpEventHandler = () => {
      console.log("鼠标抬起啦！！！");
    };

    /** 在全局body上注册一个事件监听 */
    document.body.addEventListener("mouseup", mouseUpEventHandler);

    return () => {
      /** 退出时要清除监听，防止内存泄漏 */
      document.body.removeEventListener("mouseup", mouseUpEventHandler);
    };
  }, []);

  // useEffect(() => {
  //   setPureRGB(hueToRGB(hue));
  // }, [hue]);

  // useEffect(() => {
  //   const saturation = coordinate.x / containerEl.current.offsetWidth;
  //   const brightness = 1 - coordinate.y / containerEl.current.offsetHeight;

  //   const finalRGB = hsbToRgb(hue, saturation, brightness);

  //   setFinalRGB(createRGB(...finalRGB));

  //   //syncPluginRGBToPhotoShop(finalRGB);
  // }, [coordinate, hue]);

  // useEffect(() => {
  //   //hsv更改会导致坐标更改呗
  //   setCoordinate(calculateXYfromSV(saturation, brightness, containerEl));
  //   setHue(hue);
  // }, [hue, saturation, Brightness]);

  //

  //finalRGB更改，引发其余所有值的变更
  //hsv 还有 对应的 坐标位置。

  useEffect(() => {
    //console.log("🚀 ~ useEffect ~ finalRGB:", finalRGB);
    const r = finalRGB[0];
    const g = finalRGB[1];
    const b = finalRGB[2];

    const finalHSV = rgbToHsb(r, g, b);
    //console.log("🚀 ~ useEffect ~ finalHSV:", finalHSV);

    const h = finalHSV.h; //有的返回对象 有的返回数组
    const s = finalHSV.s;
    const v = finalHSV.v;

    //setHue(h);
    setSaturation(s);
    setBrightness(v);

    // const xy = calculateXYFromSV(s, v, containerEl);

    // setCoordinate(xy);

    // syncPluginRGBToPhotoShop(finalRGB);
  }, [finalRGB]);

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
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      setCoordinate({ x, y });

      const saturation = x / containerEl.current.offsetWidth;
      const brightness = 1 - y / containerEl.current.offsetHeight;
      const finalRGB = hsbToRgb(hue, saturation, brightness);

      setFinalRGB(finalRGB);
      //
      //直接更改finalRGB了。，最后再根据finalRGB反推xy值嘛？
      //
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
              doDrag;

              // const { x, y } = getRelativeCoordinates(
              //   event,
              //   containerEl.current
              // );
              // setCoordinate({ x, y });
              // const { x, y } = getRelativeCoordinates(e, containerEl.current);
              // const saturation = coordinate.x / containerEl.current.offsetWidth;
              // const brightness =
              //   1 - coordinate.y / containerEl.current.offsetHeight;
              // // setCoordinate({ x, y });
              // const finalRGB = hsbToRgb(hue, saturation, brightness);
              // setFinalRGB(finalRGB);
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
            setFinalRGB(hsbToRgb(hue, saturation, brightness));
            setPureRGB(hueToRGB(hue));
          }}
        />
      </div>

      {/* 展示颜色的方块 */}
      <div
        className="output"
        style={{
          //background: `rgb(${finalRGB.r},${finalRGB.g},${finalRGB.b})`,
          background: `rgb(${finalRGB[0]},${finalRGB[1]},${finalRGB[2]})`,
        }}
      ></div>

      {/* 展示数值的 */}
      <ColorForm
        onChange={(changed, allValues) => {
          console.log(
            "!!~ ~ ColorPicker ~ changed, allValues:",
            changed,
            allValues
          );

          if (changed.red) {
            // setHue(rgbToHue(changed.red, finalRGB.g, finalRGB.b));
            // setPureRGB(hueToRGB(rgbToHue(changed.red, finalRGB.g, finalRGB.b)));
            // const tempRGB = createRGB(changed.red, finalRGB.g, finalRGB.b);
            // setFinalRGB(tempRGB);
          }
        }}
        value={{
          hue: hue,
          saturation: containerEl.current
            ? coordinate.x / containerEl.current.offsetWidth
            : 0,
          brightness: containerEl.current
            ? 1 - coordinate.y / containerEl.current.offsetHeight
            : 0,
          red: finalRGB[0],
          green: finalRGB[1],
          blue: finalRGB[2],
          // red: finalRGB.r,
          // green: finalRGB.g,
          // blue: finalRGB.b,
        }}
      />
    </div>
  );
};
