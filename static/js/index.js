import React from "react";
import ReactDOM from "react-dom";
import AnalysisPage from "./Pages/AnalysisPage";
import SetupPage from "./Pages/Setuppage";


if(document.getElementById("content") != null)
  ReactDOM.render(<SetupPage name="MICAS" />, document.getElementById("content"));
else if(document.getElementById("analysis") != null) {
  var app_location = ""
  var minion_location = ""
  var start_time = new Date()

  if(document.getElementById("analysis").hasAttribute("app-location")){
    app_location = document.getElementById("analysis").getAttribute("app-location")
  }
  if(document.getElementById("analysis").hasAttribute("minion-location")){
    minion_location = document.getElementById("analysis").getAttribute("minion-location")
  }
  if(document.getElementById("analysis").hasAttribute("start-time")){
    start_time = document.getElementById("analysis").getAttribute("start-time")
    console.log("_INSIDE START TIME: " + start_time)
  }
  console.log("START TIME: " + start_time)
  var jsStartDate = new Date(parseInt(start_time));
  ReactDOM.render(
    <AnalysisPage
      name="MICAS" appLocation={app_location}
      minionLocation={minion_location}
      startTime={jsStartDate}
    />,
    document.getElementById("analysis")
  );
}
