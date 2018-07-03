import React from "react";
import ReactDOM from "react-dom";
import App from "./App";


if(document.getElementById("content") != null)
  ReactDOM.render(<App name="xWIMP" />, document.getElementById("content"));
else if(document.getElementById("analysis") != null)
  ReactDOM.render(<App name="xWIMP" />, document.getElementById("analysis"));
