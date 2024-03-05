export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export function createRGB(r: number, g: number, b: number): RGB {
  return { r, g, b };
}

function linearToGammaSpaceExact(value: number) {
  if (value <= 0.0) {
    return 0.0;
  } else if (value <= 0.0031308) {
    return 12.92 * value;
  } else if (value < 1.0) {
    return 1.055 * Math.pow(value, 0.4166667) - 0.055;
  } else {
    return Math.pow(value, 0.45454545);
  }
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

  let h, s, v;
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
    s: s, // Convert saturation to percentage
    v: v, // Convert brightness to percentage
  };
}

// export function rgbToHsv(r: number, g: number, b: number) {
//   (r /= 255), (g /= 255), (b /= 255);

//   let max = Math.max(r, g, b),
//     min = Math.min(r, g, b);
//   let h,
//     s,
//     v = max;

//   let d = max - min;
//   s = max == 0 ? 0 : d / max;

//   if (max == min) {
//     h = 0; // achromatic
//   } else {
//     switch (max) {
//       case r:
//         h = (g - b) / d + (g < b ? 6 : 0);
//         break;
//       case g:
//         h = (b - r) / d + 2;
//         break;
//       case b:
//         h = (r - g) / d + 4;
//         break;
//     }
//     h /= 6;
//   }

//   return { h: h * 360, s: s, v: v };
// }

export async function syncPluginRGBToPhotoShop(finalRGB: {}) {
  console.log("🚀 ~ syncPluginRGBToPhotoShop ~ finalRGB:", finalRGB);
  const photoshop = window.require("photoshop").core;

  async function setColorModal() {
    try {
      const photoshop = window.require("photoshop");
      const app = photoshop.app;
      const SolidColor = app.SolidColor;
      const col = new SolidColor();
      //转到 gamma2.2？ 反正ps偏亮， 所以这边是变暗，
      col.rgb.red = SRGBToLinear(Number(finalRGB.r) / 255) * 255;
      col.rgb.green = SRGBToLinear(Number(finalRGB.g) / 255) * 255;
      col.rgb.blue = SRGBToLinear(Number(finalRGB.b) / 255) * 255;

      app.foregroundColor = col;
    } catch (error) {
      console.log("🚀 ~ setColorModal ~ error:", error);
    }
  }
  try {
    await photoshop.executeAsModal(setColorModal, {
      commandName: "Set Color Command",
    });
  } catch (e) {
    console.log("🚀 ~ syncPluginRGBToPhotoShop ~ e:", e);
    // 处理错误
    console.error(e);
  }
}
