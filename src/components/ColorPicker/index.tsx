import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import {
  Coordinate,
  createRGB,
  createHSV,
  hsbToRgb,
  hueToRGB,
  RGB,
  rgbToHsb,
  linearToGammaSpaceExact,
  syncPluginRGBToPhotoShop,
  HSV,
  hexToRgb,
  rgbToHex,
  calculateXYFromSV,
  formatHexColor
} from "../../utils";
import ColorSlider, { ColorSliderRefType } from "../ColorSlider";
import ColorForm from "../ColorForm";
import ColorSwitcher from "../ColorSwitcher";

const DEFAULT_RGB = createRGB(255, 255, 255);
const DEFAULT_PureRGB = createRGB(255, 0, 0);

type DragMouseEvent = React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent;
function getRelativeCoordinates(   //当前位置
  event: DragMouseEvent,
  element: HTMLDivElement
) {
  const bounds = element?.getBoundingClientRect();
  if (!bounds) {
    return {
      x: 0,
      y: 0,
    };
  }
  let x = (event.clientX - bounds.left);
  let y = (event.clientY - bounds.top);
  x = Math.max(x, 0);
  x = Math.min(x, bounds.width);
  y = Math.max(y, 0);
  y = Math.min(y, bounds.height);
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
  const [hexRGB, setHexRGB] = useState("ffffff");
  const [coordinate, setCoordinate] = useState<Coordinate>({ x: 0, y: 0 });

  const [hue_back, setHue_back] = useState(0);
  const [saturation_back, setSaturation_back] = useState(0);
  const [brightness_back, setBrightness_back] = useState(100);
  const [pureRGB_back, setPureRGB_back] = useState<RGB>(DEFAULT_PureRGB);
  const [finalRGB_back, setFinalRGB_back] = useState<RGB>(DEFAULT_RGB);
  const [hexRGB_back, setHexRGB_back] = useState("ffffff");
  const [coordinate_back, setCoordinate_back] = useState<Coordinate>({ x: 0, y: 0, });

  const [selectedFore, setSelectedFore] = useState(true);

  const handleColorSelect = (
    colorType: "foreground" | "background",
    color: string
  ) => {
    if (colorType == "foreground") {
      setSelectedFore(true);
    } else {
      setSelectedFore(false);
    }
  };

  useEffect(() => {
    if (selectedFore) {
      sliderRef.current?.setHue(hue);
    } else {
      sliderRef.current?.setHue(hue_back);
    }
  }, [selectedFore]);

  useEffect(() => {
    const photoshop = window.require("photoshop");
    const app = photoshop.app;

    const psHue = app.foregroundColor.hsb.hue
    const psSaturation = app.foregroundColor.hsb.saturation
    const psValue = app.foregroundColor.hsb.brightness
    const psRGB = hsbToRgb(psHue, psSaturation, psValue);
    const gammaRed = linearToGammaSpaceExact(psRGB.r);
    const gammaGreen = linearToGammaSpaceExact(psRGB.g);
    const gammaBlue = linearToGammaSpaceExact(psRGB.b);

    const psCol = createRGB(gammaRed, gammaGreen, gammaBlue);
    setFinalRGB(psCol);
    const psColRound = createRGB(Math.round(gammaRed), Math.round(gammaGreen), Math.round(gammaBlue));
    setHexRGB(rgbToHex(psColRound));
    const psHSV = rgbToHsb(psCol.r, psCol.g, psCol.b);
    setHue(psHSV.h);
    setPureRGB(hueToRGB(psHSV.h));
    setSaturation(psHSV.s);
    setBrightness(psHSV.v);
    const psHue_back = app.backgroundColor.hsb.hue
    const psSaturation_back = app.backgroundColor.hsb.saturation
    const psValue_back = app.backgroundColor.hsb.brightness
    const psRGB_back = hsbToRgb(psHue_back, psSaturation_back, psValue_back);
    const gammaRed_back = linearToGammaSpaceExact(psRGB_back.r);
    const gammaGreen_back = linearToGammaSpaceExact(psRGB_back.g);
    const gammaBlue_back = linearToGammaSpaceExact(psRGB_back.b);

    const psCol_back = createRGB(gammaRed_back, gammaGreen_back, gammaBlue_back);
    setFinalRGB_back(psCol_back);
    const psColRound_back = createRGB(Math.round(gammaRed_back), Math.round(gammaGreen_back), Math.round(gammaBlue_back));
    setHexRGB_back(rgbToHex(psColRound_back));
    const psHSV_back = rgbToHsb(psCol_back.r, psCol_back.g, psCol_back.b);
    setHue_back(psHSV_back.h);
    setPureRGB_back(hueToRGB(psHSV_back.h));
    setSaturation_back(psHSV_back.s);
    setBrightness_back(psHSV_back.v);

  }, []);

  useEffect(() => {
    if (containerEl.current) {
      setCoordinate(calculateXYFromSV(saturation, brightness, containerEl.current));
      setCoordinate_back(calculateXYFromSV(saturation_back, brightness_back, containerEl.current));
    }
  }, [saturation, brightness, saturation_back, brightness_back, containerEl]);


  useEffect(() => {
    const photoshop = window.require("photoshop");
    const app = photoshop.app;
    const action = photoshop.action;
    action.addNotificationListener(["set"], (event, descriptor) => {
      //descriptor._target?.[0]?._property获取，确认是否为前景色
      const property = descriptor._target?.[0]?._property;
      //23.0.3版本传过来的rgb全是undefined 我晕....用hsv转rgb得了
      if (property == "foregroundColor") {
        const psHue = app.foregroundColor.hsb.hue
        const psSaturation = app.foregroundColor.hsb.saturation
        const psValue = app.foregroundColor.hsb.brightness
        const psRGB = hsbToRgb(psHue, psSaturation, psValue);
        const gammaRed = linearToGammaSpaceExact(psRGB.r);
        const gammaGreen = linearToGammaSpaceExact(psRGB.g);
        const gammaBlue = linearToGammaSpaceExact(psRGB.b);
        const psCol = createRGB(gammaRed, gammaGreen, gammaBlue);
        setFinalRGB(psCol);
        const psColRound = createRGB(Math.round(gammaRed), Math.round(gammaGreen), Math.round(gammaBlue));
        setHexRGB(rgbToHex(psColRound));
        const psHSV = rgbToHsb(psCol.r, psCol.g, psCol.b);
        setHue(psHSV.h);
        setPureRGB(hueToRGB(psHSV.h));
        setSaturation(psHSV.s);
        setBrightness(psHSV.v);
      } else if (property == "backgroundColor") {
        const psHue = app.backgroundColor.hsb.hue
        const psSaturation = app.backgroundColor.hsb.saturation
        const psValue = app.backgroundColor.hsb.brightness
        const psRGB = hsbToRgb(psHue, psSaturation, psValue);
        const gammaRed = linearToGammaSpaceExact(psRGB.r);
        const gammaGreen = linearToGammaSpaceExact(psRGB.g);
        const gammaBlue = linearToGammaSpaceExact(psRGB.b);
        const psCol = createRGB(gammaRed, gammaGreen, gammaBlue);
        setFinalRGB_back(psCol);
        const psColRound = createRGB(Math.round(gammaRed), Math.round(gammaGreen), Math.round(gammaBlue));
        setHexRGB_back(rgbToHex(psColRound));
        const psHSV = rgbToHsb(psCol.r, psCol.g, psCol.b);
        setHue_back(psHSV.h);
        setPureRGB_back(hueToRGB(psHSV.h));
        setSaturation_back(psHSV.s);
        setBrightness_back(psHSV.v);
      }
    });
  }, []); //初始化就注册一个监听ps的set操作

  useEffect(() => {
    if (selectedFore) {
      sliderRef.current?.setHue(hue);
    } else {
      sliderRef.current?.setHue(hue_back);
    }
  }, [hue, hue_back]);

  useEffect(() => {
    const mouseUpEventHandler = () => {
      setDragging(false);
    };
    document.body.addEventListener("mouseup", mouseUpEventHandler);
    return () => {
      document.body.removeEventListener("mouseup", mouseUpEventHandler);
    };
  }, []);

  /** 保证重新渲染时，函数的引用不变 */
  const dragHandler = (e: DragMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (containerEl.current) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      const saturation = (x / containerEl.current.offsetWidth) * 100;
      const brightness = (1 - y / containerEl.current.offsetHeight) * 100;

      if (selectedFore) {
        const finalRGB = hsbToRgb(hue, saturation, brightness);
        setCoordinate({ x, y });
        setSaturation(saturation);
        setBrightness(brightness);
        const ColRound = createRGB(Math.round(finalRGB.r), Math.round(finalRGB.g), Math.round(finalRGB.b));
        setHexRGB(rgbToHex(ColRound));
        setFinalRGB(finalRGB);
      } else {
        const finalRGB = hsbToRgb(hue_back, saturation, brightness);
        setCoordinate_back({ x, y });
        setSaturation_back(saturation);
        setBrightness_back(brightness);
        const ColRound = createRGB(
          Math.round(finalRGB.r),
          Math.round(finalRGB.g),
          Math.round(finalRGB.b)
        );
        setHexRGB_back(rgbToHex(ColRound));
        setFinalRGB_back(finalRGB);
      }
      setIfPassCol(true);
    }
  };

  useEffect(() => {
    if (dragging) {
      document.body.addEventListener("mousemove", dragHandler);
    }
    return () => {
      document.body.removeEventListener("mousemove", dragHandler);
    };
  }, [dragging]);

  useEffect(() => {
    if (ifPassCol) {
      if (selectedFore) {
        syncPluginRGBToPhotoShop(finalRGB, true);
      } else {
        syncPluginRGBToPhotoShop(finalRGB_back, false);
      }
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
    if (containerEl.current) {
      const { x, y } = getRelativeCoordinates(e, containerEl.current);
      const saturation = (x / containerEl.current.offsetWidth) * 100;
      const brightness = (1 - y / containerEl.current.offsetHeight) * 100;
      if (selectedFore) {
        const finalRGB = hsbToRgb(hue, saturation, brightness);
        setCoordinate({ x, y });
        setSaturation(saturation);
        setBrightness(brightness);
        const ColRound = createRGB(Math.round(finalRGB.r), Math.round(finalRGB.g), Math.round(finalRGB.b));
        setHexRGB(rgbToHex(ColRound));
        setFinalRGB(finalRGB);
      } else {
        const finalRGB = hsbToRgb(hue_back, saturation, brightness);
        setCoordinate_back({ x, y });
        setSaturation_back(saturation);
        setBrightness_back(brightness);
        const ColRound = createRGB(Math.round(finalRGB.r), Math.round(finalRGB.g), Math.round(finalRGB.b));
        setHexRGB_back(rgbToHex(ColRound));
        setFinalRGB_back(finalRGB);
      }
      setIfPassCol(true);
    }
  };


  return (
    <div>
      <div className="colorPicker">
        <div className="canvas-container" onMouseUp={stopDragging}>
          <div className="colorSwitcher">
            <ColorSwitcher
              foregroundColor={formatHexColor(hexRGB)}
              backgroundColor={formatHexColor(hexRGB_back)}
              onColorSelect={handleColorSelect}
            />
          </div>
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
              background: `linear-gradient(to bottom, transparent, #000),linear-gradient(to right, #fff, rgb(${selectedFore ? pureRGB.r : pureRGB_back.r
                }, ${selectedFore ? pureRGB.g : pureRGB_back.g},${selectedFore ? pureRGB.b : pureRGB_back.b
                }))`,
            }}
          >
            {/* 那个点啊 */}
            <div
              className="click-position-dot"
              style={
                selectedFore
                  ? {
                    top: coordinate.y,
                    left: coordinate.x,
                  }
                  : {
                    top: coordinate_back.y,
                    left: coordinate_back.x,
                  }
              }
              onClick={(e) => { e.preventDefault(); }}
            >
              <div className="click-position-dot-inner">
              </div>
            </div>
          </div>

          {/* hue滑条 */}
          <ColorSlider
            ref={sliderRef}
            onValueChange={(hue) => {
              if (selectedFore) {
                setHue(hue);
                setPureRGB(hueToRGB(hue));
                const tempRGB = hsbToRgb(hue, saturation, brightness);
                setFinalRGB(tempRGB);
                const ColRound = createRGB(
                  Math.round(tempRGB.r),
                  Math.round(tempRGB.g),
                  Math.round(tempRGB.b)
                );
                setHexRGB(rgbToHex(ColRound));
              } else {
                setHue_back(hue);
                setPureRGB_back(hueToRGB(hue));
                const tempRGB = hsbToRgb(hue, saturation, brightness);
                setFinalRGB_back(tempRGB);
                const ColRound = createRGB(
                  Math.round(tempRGB.r),
                  Math.round(tempRGB.g),
                  Math.round(tempRGB.b)
                );
                setHexRGB_back(rgbToHex(ColRound));
              }
              setIfPassCol(true);
            }}
          />
        </div>

        <div className="colorBlockAndForm">
          {/* 展示颜色的方块 */}
          <div
            className="output"
            style={{
              background: `rgb(${selectedFore ? finalRGB.r : finalRGB_back.r},${selectedFore ? finalRGB.g : finalRGB_back.g
                },${selectedFore ? finalRGB.b : finalRGB_back.b})`,
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
                tempRGB = createRGB(
                  changed.red,
                  allValues.green,
                  allValues.blue
                );
              } else if (changed.green != null) {
                tempRGB = createRGB(
                  allValues.red,
                  changed.green,
                  allValues.blue
                );
              } else if (changed.blue != null) {
                tempRGB = createRGB(
                  allValues.red,
                  allValues.green,
                  changed.blue
                );
              }
              if (tempRGB) {
                const finalHSV = rgbToHsb(tempRGB.r, tempRGB.g, tempRGB.b);
                const h = finalHSV.h;
                const s = finalHSV.s;
                const v = finalHSV.v;
                if (selectedFore) {
                  setHue(h);
                  setPureRGB(hueToRGB(h));
                  setSaturation(s);
                  setBrightness(v);
                  //setCoordinate(calculateXYFromSV(s, v, containerEl.current));
                  setFinalRGB(tempRGB);
                  const ColRound = createRGB(
                    Math.round(tempRGB.r),
                    Math.round(tempRGB.g),
                    Math.round(tempRGB.b)
                  );
                  setHexRGB(rgbToHex(ColRound));
                } else {
                  setHue_back(h);
                  setPureRGB_back(hueToRGB(h));
                  setSaturation_back(s);
                  setBrightness_back(v);
                  // setCoordinate_back(calculateXYFromSV(s, v, containerEl.current));
                  setFinalRGB_back(tempRGB);
                  const ColRound = createRGB(
                    Math.round(tempRGB.r),
                    Math.round(tempRGB.g),
                    Math.round(tempRGB.b)
                  );
                  setHexRGB_back(rgbToHex(ColRound));
                }
                setIfPassCol(true);
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
                if (selectedFore) {
                  setHue(h);
                  setPureRGB(hueToRGB(h));
                  setSaturation(s);
                  setBrightness(v);
                  //  setCoordinate(calculateXYFromSV(s, v, containerEl.current));
                  const tempRGB = hsbToRgb(h, s, v);
                  setFinalRGB(tempRGB);
                  const ColRound = createRGB(
                    Math.round(tempRGB.r),
                    Math.round(tempRGB.g),
                    Math.round(tempRGB.b)
                  );
                  setHexRGB(rgbToHex(ColRound));
                } else {
                  setHue_back(h);
                  setPureRGB_back(hueToRGB(h));
                  setSaturation_back(s);
                  setBrightness_back(v);
                  // setCoordinate_back(calculateXYFromSV(s, v, containerEl.current));
                  const tempRGB = hsbToRgb(h, s, v);
                  setFinalRGB_back(tempRGB);
                  const ColRound = createRGB(
                    Math.round(tempRGB.r),
                    Math.round(tempRGB.g),
                    Math.round(tempRGB.b)
                  );
                  setHexRGB_back(rgbToHex(ColRound));
                }
                setIfPassCol(true);
              }
            }}
            value={
              selectedFore
                ? {
                  hue: Math.round(hue),
                  saturation: saturation,
                  brightness: brightness,
                  red: Math.round(finalRGB.r),
                  green: Math.round(finalRGB.g),
                  blue: Math.round(finalRGB.b),
                }
                : {
                  hue: Math.round(hue_back),
                  saturation: saturation_back,
                  brightness: brightness_back,
                  red: Math.round(finalRGB_back.r),
                  green: Math.round(finalRGB_back.g),
                  blue: Math.round(finalRGB_back.b),
                }
            }
          />

          <div className="hexRGB">
            <span>#</span>
            <input
              type="text"
              onInput={(e) => {
                const inputValue = (e.target as HTMLInputElement).value;
                const tempRGB = hexToRgb(inputValue);
                const finalHSV = rgbToHsb(tempRGB.r, tempRGB.g, tempRGB.b);
                const h = finalHSV.h;
                const s = finalHSV.s;
                const v = finalHSV.v;
                if (selectedFore) {
                  setHexRGB(inputValue);
                  setHue(h);
                  setPureRGB(hueToRGB(h));
                  setSaturation(s);
                  setBrightness(v);
                  // setCoordinate(calculateXYFromSV(s, v, containerEl.current));
                  setFinalRGB(tempRGB);
                  setIfPassCol(true);
                } else {
                  setHexRGB_back(inputValue);
                  setHue_back(h);
                  setPureRGB_back(hueToRGB(h));
                  setSaturation_back(s);
                  setBrightness_back(v);
                  //  setCoordinate_back(calculateXYFromSV(s, v, containerEl.current));
                  setFinalRGB_back(tempRGB);
                  setIfPassCol(true);
                }
              }}
              value={selectedFore ? hexRGB : hexRGB_back}
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
};
