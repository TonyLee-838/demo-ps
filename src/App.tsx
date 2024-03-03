// import { SketchPicker, Color } from "react-color";

//@ts-ignore

import "./App.css";
import { useEffect, useRef, useState } from "react";
import { ColorPicker } from "./components/ColorPicker";

const App = () => {
  return (
    <div className="content">
      <ColorPicker />
    </div>
  );
};

export default App;
