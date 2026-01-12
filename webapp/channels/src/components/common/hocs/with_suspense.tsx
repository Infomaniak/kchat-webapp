// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentType} from 'react';
import React, {Suspense} from 'react';

export const withSuspense = <P extends object>(WrappedComponent: ComponentType<P>) => // eslint-disable-line @typescript-eslint/no-unnecessary-type-constraint
    (props: P) => (
        <Suspense fallback={null}>
            <WrappedComponent {...props}/>
        </Suspense>
    );
