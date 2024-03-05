import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { entrypoints } from "uxp";
const rootEl = document.createElement("div");

rootEl.classList.add(".root-element");
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);

entrypoints.setup({
  panels: {
    Panel: {
      async create(this) {},
      async show(this, contentRoot?: { node: HTMLElement }) {
        contentRoot!.node?.appendChild(rootEl);
      },
    },
  },
});

document.body.appendChild(rootEl);
