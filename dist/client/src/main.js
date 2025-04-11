"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const App_1 = __importDefault(require("./App"));
const styled_components_1 = require("styled-components");
const GlobalStyle = (0, styled_components_1.createGlobalStyle) `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;
react_dom_1.default.render((0, jsx_runtime_1.jsxs)(react_1.default.StrictMode, { children: [(0, jsx_runtime_1.jsx)(GlobalStyle, {}), (0, jsx_runtime_1.jsx)(App_1.default, {})] }), document.getElementById('root'));
