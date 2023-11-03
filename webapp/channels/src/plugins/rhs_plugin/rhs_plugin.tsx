// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Pluggable from 'plugins/pluggable';
import React from 'react';

import SearchResultsHeader from 'components/search_results_header';

export type Props = {
    showPluggable: boolean;
    pluggableId: string;
    title: React.ReactNode;
}

const RhsPlugin = ({showPluggable, pluggableId, title}: Props) => {
    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <SearchResultsHeader>
                {title}
            </SearchResultsHeader>
            {
                showPluggable &&
                <Pluggable
                    pluggableName='RightHandSidebarComponent'
                    pluggableId={pluggableId}
                />
            }
        </div>
    );
};

export default React.memo(RhsPlugin);
