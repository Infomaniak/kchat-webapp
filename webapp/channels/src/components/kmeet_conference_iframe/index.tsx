import React from 'react';
import ReactDOM from 'react-dom';

import KmeetConference from './kmeet_conference';

const start = async () => {
    ReactDOM.render(
        <KmeetConference/>,
        document.getElementById('app'),
    );
};

start();
