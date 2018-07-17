import React from "react";
import ReactDOM from "react-dom";
import AnalysisPage from "./Pages/AnalysisPage";
import SetupPage from "./Pages/Setuppage";



if(document.getElementById("content") != null)
  ReactDOM.render(<SetupPage name="MICAS" />, document.getElementById("content"));
else if(document.getElementById("analysis") != null)
  ReactDOM.render(<AnalysisPage name="MICAS" />, document.getElementById("analysis"));
