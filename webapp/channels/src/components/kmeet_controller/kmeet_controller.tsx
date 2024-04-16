
import React from 'react';
import {Route, Switch} from 'react-router-dom';

const KmeetController = () => {
    return (<Switch>
        <Route
            path={'/:conference'}
            component={<div/>}
        />
    </Switch>);
};

export default KmeetController;
