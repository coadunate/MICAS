import React from 'react';

import './app.component.css'
import RoutesComponent from "./modules/routes/routes.component";

export const io = require('socket.io-client');
export const socket = io('http://0.0.0.0:5000/', { transports: ['websocket','polling']})

socket.on('connect_error', (err: { message: any; }) => {
    console.log(`connect error due to ${err.message}`)
})

const AppComponent = () => {
    return <RoutesComponent/>;
}

export default AppComponent;
