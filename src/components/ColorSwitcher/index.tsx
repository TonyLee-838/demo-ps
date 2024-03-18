import React, { useState } from "react";
import "./index.css"; // 引入CSS文件

import {
  ShowColorPicker,
  hexToRgb,
  rgbToHex,
} from "../../utils";

type ColorSwitcherProps = {
  foregroundColor: string;
  backgroundColor: string;
  onColorSelect: (color: "foreground" | "background") => void;
  onUpdatePanelColor: boolean;
};

const ColorSwitcher: React.FC<ColorSwitcherProps> = ({
  foregroundColor,
  backgroundColor,
  onColorSelect,
  onUpdatePanelColor
}) => {
  const [selected, setSelected] = useState<"foreground" | "background">(
    "foreground"
  );

  // 选中前景色或背景色
  const selectColor = (color: "foreground" | "background") => {
    setSelected(color); // 设置选中状态
    onColorSelect(color); // 调用父组件的回调函数
  };

  return (
    <div className="color-switcher">
      <div
        className={`color-box color-box2 foreground-color ${selected === "foreground" ? "selected" : ""
          }`}
        style={{ backgroundColor: foregroundColor }}
        onClick={() => {
          if (selected == "foreground") {
            ShowColorPicker(hexToRgb(foregroundColor), true).then(() => {
              onUpdatePanelColor(true);
            });

          } else {
            selectColor("foreground")
          }
        }}
      ></div>
      <div
        className={`color-box color-box2 background-color ${selected === "background" ? "selected" : ""
          }`}
        style={{ backgroundColor: backgroundColor }}
        onClick={() => {
          if (selected == "background") {
            ShowColorPicker(hexToRgb(backgroundColor), false).then(() => {
              onUpdatePanelColor(false);
            });
          } else {
            selectColor("background")
          }




        }}
      ></div>
    </div>
  );
};

export default ColorSwitcher;
