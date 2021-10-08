import React from 'react';

import './app.component.css'
import RoutesComponent from "./modules/routes/routes.component";

const io = require('socket.io-client');
export const socket = io('http://localhost:5000/', { transports: ['websocket']})

const AppComponent = () => {
    return <RoutesComponent/>;
}

export default AppComponent;
