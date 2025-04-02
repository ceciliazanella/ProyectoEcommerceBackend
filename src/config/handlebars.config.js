import handlebars from "express-handlebars";
import paths from "../utils/paths.js";

export const config = (app) => {
  app.engine(
    "handlebars",
    handlebars.engine({
      helpers: {
        eq: function (a, b) {
          return a === b;
        },
      },
    })
  );

  app.set("views", paths.views);
  app.set("view engine", "handlebars");
};
