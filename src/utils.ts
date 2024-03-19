import { result, throttle } from "lodash-es";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export function createRGB(r: number, g: number, b: number): RGB {
  return { r, g, b };
}

export function createHSV(h: number, s: number, v: number): HSV {
  return { h, s, v };
}

export function linearToGammaSpaceExact(value: number) {
  value /= 255;
  let col;
  if (value <= 0.0) {
    col = 0.0;
  } else if (value <= 0.0031308) {
    col = 12.92 * value;
  } else if (value < 1.0) {
    col = 1.055 * Math.pow(value, 0.4166667) - 0.055;
  } else {
    col = Math.pow(value, 0.45454545);
  }
  // return col;
  return col * 255;
}

function SRGBToLinear(c: number) {
  var linearRGBLo = c / 12.92;
  var linearRGBHi = Math.pow((c + 0.055) / 1.055, 2.4);
  var linearRGB = c <= 0.04045 ? linearRGBLo : linearRGBHi;
  return linearRGB;
}

export function hueToRGB(hue: number): RGB {
  const saturation = 1; // 饱和度设置为100%
  const lightness = 0.5; // 亮度设置为50%，以获得纯色

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= hue && hue < 60) {
    r = chroma;
    g = x;
    b = 0;
  } else if (60 <= hue && hue < 120) {
    r = x;
    g = chroma;
    b = 0;
  } else if (120 <= hue && hue < 180) {
    r = 0;
    g = chroma;
    b = x;
  } else if (180 <= hue && hue < 240) {
    r = 0;
    g = x;
    b = chroma;
  } else if (240 <= hue && hue < 300) {
    r = x;
    g = 0;
    b = chroma;
  } else if (300 <= hue && hue <= 360) {
    r = chroma;
    g = 0;
    b = x;
  }

  r = (r + m) * 255;
  g = (g + m) * 255;
  b = (b + m) * 255;

  return createRGB(r, g, b);
}

export function hsbToRgb(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  let c = v * s; // Chroma
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h <= 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = (r + m) * 255;
  g = (g + m) * 255;
  b = (b + m) * 255;

  return { r, g, b };
}

export function rgbToHue(r: number, g: number, b: number) {
  // Convert RGB to the [0, 1] range
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  let hue = 0;

  if (chroma === 0) {
    hue = 0; // This is a gray, no chroma
  } else if (max === r) {
    hue = ((g - b) / chroma) % 6;
  } else if (max === g) {
    hue = (b - r) / chroma + 2;
  } else if (max === b) {
    hue = (r - g) / chroma + 4;
  }

  hue *= 60; // Convert to degrees on the color circle
  if (hue < 0) hue += 360; // Ensure hue is non-negative

  return hue; // The hue value will be between 0 and 360
}

export function rgbToHsb(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  let h = 0;
  let s = 0;
  let v = 0;

  const min = Math.min(r, g, b);
  const max = (v = Math.max(r, g, b));
  const difference = max - min;

  // Saturation calculation
  s = max === 0 ? 0 : difference / max;

  // Hue calculation
  //h = 0; // achromatic
  if (difference === 0) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / difference + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / difference + 2;
        break;
      case b:
        h = (r - g) / difference + 4;
        break;
    }
    h /= 6;
  }
  // HSB results from 0 to 1
  return {
    h: h * 360, // Convert hue to degrees
    s: s * 100, // Convert saturation to percentage
    v: v * 100, // Convert brightness to percentage
  };
}

export async function RGBToPhotoShop(finalRGB: RGB, isFore: boolean) {
  const photoshop = window.require("photoshop");
  const batchPlay = photoshop.action.batchPlay;
  // 构建一个设置前景色或背景色的 batchPlay 命令
  function setColorCommand(color, isFore) {
    const linearHSB = rgbToHsb(
      SRGBToLinear(color.r / 255) * 255,
      SRGBToLinear(color.g / 255) * 255,
      SRGBToLinear(color.b / 255) * 255
    );

    // return {
    //   _obj: 'set',
    //   _target: [
    //     {
    //       _ref: "color",
    //       _property: isFore ? 'foregroundColor' : 'backgroundColor'
    //     },

    //   ],
    //   to: {
    //     _obj: 'RGBColor',
    //     red: SRGBToLinear(color.r / 255) * 255,
    //     grain: SRGBToLinear(color.g / 255) * 255,
    //     blue: SRGBToLinear(color.b / 255) * 255,
    //   },
    //   "_isCommand": true,
    //   _options: {
    //     dialogOptions: "dontDisplay"
    //   }
    // };

    return {
      _obj: "set",
      _target: [
        {
          _ref: "color",
          _property: isFore ? "foregroundColor" : "backgroundColor",
        },
      ],
      to: {
        _obj: "HSBColorClass",
        hue: {
          _unit: "angleUnit",
          _value: linearHSB.h,
        },
        saturation: linearHSB.s,
        brightness: linearHSB.v,
      },
      source: "colorPickerPanel",
      _options: {
        dialogOptions: "dontDisplay",
      },
    };
  }

  // const openPicker = {
  //   _target: { _ref: "application" },
  //   _obj: "showColorPicker",
  //   context: "Some title for the color picker...",
  //   color: {
  //     _obj: 'RGBColor',
  //     red: 0,
  //     green: 0,
  //     blue: 0,
  //   },
  // };

  ////使用 executeAsModal 包装 batchPlay 命令
  try {
    await photoshop.core.executeAsModal(
      async () => {
        await batchPlay([setColorCommand(finalRGB, isFore)], {
          synchronousExecution: false,
          modalBehavior: "execute",
        });
        //const res = await photoshop.action.batchPlay([openPicker], {})
      },
      { commandName: "Set Color Command" }
    );
  } catch (e) {
    console.error("Error setting color with batchPlay:", e);
    console.error(e);
  }
}

export const syncPluginRGBToPhotoShop = throttle(RGBToPhotoShop, 100); //间隔100毫秒

export function hexToRgb(hex: string): RGB {
  // 移除十六进制颜色值前的 '#' 符号（如果存在）
  hex = hex.replace(/^#/, "");

  // 如果长度小于6位，则自动补零
  if (hex.length < 6) {
    hex = hex.padStart(6, "0");
  }

  // 将十六进制值按照颜色分成三个部分
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (colorValue: number): string => {
    const hex = colorValue.toString(16);
    // 十六进制是两位数，不足两位数前面补0
    return hex.padStart(2, "0");
  };
  const { r, g, b } = rgb;
  return toHex(r) + toHex(g) + toHex(b);
}

export function calculateXYFromSV(
  saturation: number,
  brightness: number,
  element: HTMLDivElement
) {
  const x = (saturation / 100) * element.offsetWidth;
  const y = (1 - brightness / 100) * element.offsetHeight;
  return { x, y };
}

export function formatHexColor(hex: string) {
  // 移除可能存在的 '#' 字符
  hex = hex.replace("#", "");
  // 如果长度小于6，补零
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return "#" + hex;
}

export async function RGBToContentLayer(finalRGB: RGB) {
  const photoshop = window.require("photoshop");
  const batchPlay = photoshop.action.batchPlay;
  function setColorCommand(color) {
    return {
      _obj: "set",
      _target: [
        {
          _enum: "ordinal",
          _ref: "contentLayer",
          _value: "targetEnum",
        },
      ],
      to: {
        _obj: "solidColorLayer",
        color: {
          _obj: "RGBColor",
          red: SRGBToLinear(color.r / 255) * 255,
          grain: SRGBToLinear(color.g / 255) * 255,
          blue: SRGBToLinear(color.b / 255) * 255,
        },
      },
      _isCommand: false,
    };
  }
  ////使用 executeAsModal 包装 batchPlay 命令
  try {
    await photoshop.core.executeAsModal(
      async () => {
        await batchPlay([setColorCommand(finalRGB)], {
          synchronousExecution: false,
          modalBehavior: "execute",
        });
        //const res = await photoshop.action.batchPlay([openPicker], {})
      },
      { commandName: "Set Color Command" }
    );
  } catch (e) {
    console.error("Error setting color with batchPlay:", e);
    console.error(e);
  }
}


export async function RGBToStrokeStyle(finalRGB: RGB) {
  const photoshop = window.require("photoshop");
  const batchPlay = photoshop.action.batchPlay;
  function setColorCommand(color) {
    return {
      _obj: "set",
      _target: [
        {
          _enum: "ordinal",
          _ref: "contentLayer",
          _value: "targetEnum",
        },
      ],
      to: {
        _obj: "shapeStyle",
        strokeStyle: {
          _obj: "strokeStyle",
          strokeStyleContent: {
            _obj: "solidColorLayer",
            color: {
              _obj: "RGBColor",
              red: SRGBToLinear(color.r / 255) * 255,
              grain: SRGBToLinear(color.g / 255) * 255,
              blue: SRGBToLinear(color.b / 255) * 255,
            },
          },
          strokeStyleVersion: 2,
          strokeEnabled: true
        },
      },
      _isCommand: false,
    };
  }
  ////使用 executeAsModal 包装 batchPlay 命令
  try {
    await photoshop.core.executeAsModal(
      async () => {
        await batchPlay([setColorCommand(finalRGB)], {
          synchronousExecution: false,
          modalBehavior: "execute",
        });
      },
      { commandName: "Set Color Command" }
    );
  } catch (e) {
    console.error("Error setting color with batchPlay:", e);
    console.error(e);
  }
}




export async function HSBToPhotoShop(finalHSB: HSV, isFore: boolean) {
  const photoshop = window.require("photoshop");
  const batchPlay = photoshop.action.batchPlay;
  // 构建一个设置前景色或背景色的 batchPlay 命令
  function setColorCommand(color, isFore) {

    return {
      _obj: "set",
      _target: [
        {
          _ref: "color",
          _property: isFore ? "foregroundColor" : "backgroundColor",
        },
      ],
      to: {
        _obj: "HSBColorClass",
        hue: {
          _unit: "angleUnit",
          _value: finalHSB.h,
        },
        saturation: finalHSB.s,
        brightness: finalHSB.v,
      },
      source: "colorPickerPanel",
      _options: {
        dialogOptions: "dontDisplay",
      },
    };
  }



  ////使用 executeAsModal 包装 batchPlay 命令
  try {
    await photoshop.core.executeAsModal(
      async () => {
        await batchPlay([setColorCommand(finalHSB, isFore)], {
          synchronousExecution: false,
          modalBehavior: "execute",
        });
      },
      { commandName: "Set Color Command" }
    );
  } catch (e) {
    console.error("Error setting color with batchPlay:", e);
    console.error(e);
  }
}











export async function ShowColorPicker(finalRGB: RGB, isFore: boolean) {
  const photoshop = window.require("photoshop");
  const batchPlay = photoshop.action.batchPlay;
  const linearHSB = rgbToHsb(
    SRGBToLinear(finalRGB.r / 255) * 255,
    SRGBToLinear(finalRGB.g / 255) * 255,
    SRGBToLinear(finalRGB.b / 255) * 255
  );
  try {
    const result = await photoshop.core.executeAsModal(
      async () => {
        return await batchPlay([{
          "_obj": "showColorPicker",
          "application": {
            "_class": "null"
          },
          "value": true,
          "color": {
            _obj: "HSBColorClass",
            hue: {
              _unit: "angleUnit",
              _value: linearHSB.h,
            },
            saturation: linearHSB.s,
            brightness: linearHSB.v,
          },
          "dontRecord": true,
          "forceNotify": true,
        }
        ], {
          synchronousExecution: true
        });
      },
      { commandName: "Set Color Command" }
    );

    var colorPicked = result[0].color;
    console.log("🚀 ~ ShowColorPicker ~ result:", result)
    // console.log("🚀 ~ ShowColorPicker ~ colorPicked:", colorPicked)
    const forPassHSV = createHSV(colorPicked.hue._value, colorPicked.saturation, colorPicked.brightness);
    HSBToPhotoShop(forPassHSV, isFore);
    const forPass = hsbToRgb(forPassHSV.h, forPassHSV.s, forPassHSV.v);
    // console.log("🚀 ~ ShowColorPicker ~ forPass:", forPass)

    // console.log("🚀 ~ ShowColorPicker ~ forPass2:", linearToGammaSpaceExact(forPass.r))
    // console.log("🚀 ~ ShowColorPicker ~ forPass2:", linearToGammaSpaceExact(forPass.g))
    // console.log("🚀 ~ ShowColorPicker ~ forPass2:", linearToGammaSpaceExact(forPass.b))
    forPass.r = linearToGammaSpaceExact(forPass.r);
    forPass.g = linearToGammaSpaceExact(forPass.g);
    forPass.b = linearToGammaSpaceExact(forPass.b);
    //const forPass = forPassHSV;
    return forPass;

  } catch (e) {
    console.error("Error setting color with batchPlay:", e);
    console.error(e);
  }


}
export async function getCurrentColorSpace() {
  const photoshop = window.require('photoshop');
  let targetDocument = window.require("photoshop").app.activeDocument;
  const documentID = targetDocument.id;
  let layer = targetDocument.activeLayers[0];
  const layerID = layer.id;

  return new Promise((resolve, reject) => {
    const myScript = async () => {
      console.log('myScript started'); // 确认 myScript 是否开始执行
      try {
        const imaging = photoshop.imaging;
        console.log('imaging module:', imaging); // 确认 imaging 模块是否可用
        const imageObj = await imaging.getPixels(
          {
            "documentID": documentID,
            "layerID": layerID,
            colorSpace: "RGB"
          }

        );
        const pixelData = imageObj.imageData;
        const rgbProfiles = pixelData.colorProfile;
        // console.log('🚀 ~ fetchPixelData ~ rgbProfiles:', rgbProfiles);
        //return rgbProfiles
        resolve(rgbProfiles);
      } catch (err) {
        console.error('Error inside executeAsModal:', err);
        reject(err);
      }
    };
    try {
      console.log('executeAsModal about to be called'); // 确认 executeAsModal 即将被调用
      photoshop.core.executeAsModal(myScript, {
        commandName: "Set Color Command"
      });
    } catch (e) {
      console.error('Error executing script:', e);
      reject(e);
    }
  });
}