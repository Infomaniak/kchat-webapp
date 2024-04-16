
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router-dom';

import KmeetCalls from 'components/kmeet_calls';

const KmeetController = () => {
    const {path} = useRouteMatch();

    return (
        <Switch>
            <Route
                path={`${path}/calls/:conference`}
                component={KmeetCalls}
            />
        </Switch>
    );
};

export default KmeetController;
