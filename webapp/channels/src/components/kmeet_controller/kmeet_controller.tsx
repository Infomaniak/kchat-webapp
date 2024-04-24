
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';

import Ringing from './ringing/ringing';

const KmeetController = () => {
    const {path} = useRouteMatch();

    return (
        <Switch>
            <Route
                path={`${path}/calls/:channelId/modal`}
                component={Ringing}
            />
        </Switch>
    );
};

export default KmeetController;
