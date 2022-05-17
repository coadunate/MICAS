import React from 'react';

import './app.component.css'
import RoutesComponent from "./modules/routes/routes.component";

export const io = require('socket.io-client')( 'http://0.0.0.0:5000', {rejectUnauthorized: false});
export const socket = io.connect('http://0.0.0.0:5000/', { secure: true, reconnection: true, rejectUnauthorized: false })

socket.on('connect_error', (err: { message: any; }) => {
    console.log(`connect error due to ${err.message}`)
})

const AppComponent = () => {
    return <RoutesComponent/>;
}

export default AppComponent;
