// import { SketchPicker, Color } from "react-color";

import ColorPicker from "@rc-component/color-picker";
import { debounce } from "lodash-es";

//@ts-ignore
import Picker from "vanilla-picker";

import "./App.css";
import { useEffect, useRef, useState } from "react";
// import { ColorPicker } from "./components/ColorPicker";

const App = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="content">
      <ColorPicker />
      {/* <input type="color" /> */}
      {/* <ColorPicker
        color={color}
        disabledAlpha
        onChange={debounce((color) => setColor(color), 500)}
      /> */}
      {/* <SketchPicker
        key={color}
        color={color}
        width="500"
        onChange={debounce(
          (color) => {
            console.log("🚀 ~ <SketchPickeronChangeComplete ~ color:", color);
            setColor(color.hex);
          },
          100,
          { leading: true, trailing: true }
        )}
      /> */}
    </div>
  );
};

export default App;
