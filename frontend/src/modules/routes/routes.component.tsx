import React from 'react';
import HomeComponent from "../home/home.component";

import {BrowserRouter as Router, Route} from 'react-router-dom';
import {IRoutes} from "./routes.interfaces";
import SetupComponent from "../setup/setup.component";
import AnalysisComponent from "../analysis/analysis-component";

const MainRoutes: IRoutes[] = [
    {
        name: "Home",
        path: "/",
        exact: true,
        component: <HomeComponent/>
    },
    {
        name: "Setup",
        path: "/setup",
        exact: true,
        component: <SetupComponent/>
    },
    {
        name: "Analysis",
        path: "/analysis/:id?",
        exact: true,
        component: <AnalysisComponent />
    }
]

const RoutesComponent = () => {
    return (
        <Router>
            {
                MainRoutes.map((r, k) => {
                    return <Route exact={r.exact} key={k}
                                  path={r.path}>{r.component}</Route>
                })
            }
        </Router>
    )
}

export default RoutesComponent;
