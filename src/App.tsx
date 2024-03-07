import { useState } from "react";

import "./App.css";
import { ColorPicker } from "./components/ColorPicker";

const App = () => {
  const [mode, setMode] = useState<"front" | "back">("front");
  return (
    <div className="content">
      <ColorPicker />
    </div>
  );
};

export default App;
