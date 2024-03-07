import React, { useState } from "react";
import "./index.css"; // 引入CSS文件

const ColorSwitcher: React.FC = () => {
  // 设置前景色和背景色的state
  const [foregroundColor, setForegroundColor] = useState<string>("#ff0000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#00ff00");
  const [selected, setSelected] = useState<"foreground" | "background">(
    "foreground"
  );

  // 选中前景色或背景色
  const selectColor = (color: "foreground" | "background") => {
    setSelected(color);
  };

  return (
    <div className="color-switcher">
      <div
        className={`color-box foreground-color ${
          selected === "foreground" ? "selected" : ""
        }`}
        style={{ backgroundColor: foregroundColor }}
        onClick={() => selectColor("foreground")}
      ></div>
      <div
        className={`color-box background-color ${
          selected === "background" ? "selected" : ""
        }`}
        style={{ backgroundColor: backgroundColor }}
        onClick={() => selectColor("background")}
      ></div>
    </div>
  );
};

export default ColorSwitcher;
