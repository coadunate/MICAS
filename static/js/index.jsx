import React from "react";
import ReactDOM from "react-dom";
import SetupPage from "./SetupPage";


if(document.getElementById("content") != null)
  ReactDOM.render(<SetupPage name="xWIMP" />, document.getElementById("content"));
else if(document.getElementById("analysis") != null)
  ReactDOM.render(<SetupPage name="xWIMP" />, document.getElementById("analysis"));
