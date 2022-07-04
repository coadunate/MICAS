import React from 'react';

import './app.component.css'
import RoutesComponent from "./modules/routes/routes.component";

export const io = require('socket.io-client');
export const socket = io.connect('http://localhost:5007/', { transports: ['polling']})

socket.on('connect', function() {
    socket.send('message', 'User has connected!');
});

socket.on('connect_error', (err: { message: any; }) => {
    console.log(`connect error due to ${err}`)
})

const AppComponent = () => {
    return <RoutesComponent/>;
}

export default AppComponent;
