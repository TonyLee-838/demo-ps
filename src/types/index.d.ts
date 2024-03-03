import { action, app, constants, core, imaging } from "photoshop";

declare global {
  interface Window {
    require: (module: "photoshop") => {
      action: typeof action;
      app: typeof app;
      constants: typeof constants;
      core: typeof core;
      imaging: typeof imaging;
    };
  }
}
