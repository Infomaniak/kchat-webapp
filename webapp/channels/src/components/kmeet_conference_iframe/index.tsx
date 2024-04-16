import React from 'react';
import ReactDOM from 'react-dom';

const start = async () => {
    ReactDOM.render(
        <div>{'Hello world'}</div>,
        document.getElementById('app'),
    );
};

start();
