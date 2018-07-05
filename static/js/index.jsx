import React from "react";
import ReactDOM from "react-dom";
import AnalysisPage from "./AnalysisPage";
import SetupPage from "./Setuppage";


if(document.getElementById("content") != null)
  ReactDOM.render(<SetupPage name="xWIMP" />, document.getElementById("content"));
else if(document.getElementById("analysis") != null)
  ReactDOM.render(<AnalysisPage name="xWIMP" />, document.getElementById("analysis"));
