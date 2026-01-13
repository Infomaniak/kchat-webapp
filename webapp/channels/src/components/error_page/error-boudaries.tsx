/* eslint-disable react/require-optimization */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ErrorPage from './index';

type Location = {
    search: string;
}

type Props = {
    children?: React.ReactNode;
    location?: Location;
}

type State = {
    hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        // eslint-disable-next-line no-console
        console.log(error);
        return {hasError: true};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentDidCatch(error: any, errorInfo: any) {
        // You can also log the error to an error reporting service
        // eslint-disable-next-line no-console
        console.log(error, errorInfo);

        /*
        logErrorToMyService(error, errorInfo);
*/
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <ErrorPage/>;
        }

        return this.props.children;
    }
}
