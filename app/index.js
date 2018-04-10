import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter , browserHistory } from 'react-router-dom'
import App from './app';

render(
        <BrowserRouter history={browserHistory} >
        <App />
        </BrowserRouter>
        , document.getElementById('root'));
