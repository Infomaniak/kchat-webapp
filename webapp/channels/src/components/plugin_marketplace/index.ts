// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';
import type {Dispatch, ActionCreatorsMapObject} from 'redux';
import {bindActionCreators} from 'redux';

import {getPluginStatuses} from 'mattermost-redux/actions/admin';
import {setFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/actions/general';
import {getFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/selectors/entities/general';
import type {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {fetchListing, filterListing} from 'actions/marketplace';
import {closeModal} from 'actions/views/modals';
import {getListing, getInstalledListing} from 'selectors/views/marketplace';
import {isModalOpen} from 'selectors/views/modals';

import {makeAsyncComponent} from 'components/async_load';

import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import type {GlobalState} from 'types/store';

const MarketplaceModal = makeAsyncComponent('MarketplaceModal', React.lazy(() => import('./marketplace_modal')));

function mapStateToProps(state: GlobalState) {
    return {
        show: isModalOpen(state, ModalIdentifiers.PLUGIN_MARKETPLACE),
        listing: getListing(state),
        installedListing: getInstalledListing(state),
        siteURL: getSiteURL(),
        pluginStatuses: state.entities.admin.pluginStatuses,
        firstAdminVisitMarketplaceStatus: getFirstAdminVisitMarketplaceStatus(state),
    };
}

type Actions = {
    closeModal(): void;
    fetchListing(localOnly?: boolean): Promise<{error?: Error}>;
    filterListing(filter: string): Promise<{error?: Error}>;
    setFirstAdminVisitMarketplaceStatus(): Promise<void>;
    getPluginStatuses(): Promise<void>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            closeModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
            fetchListing,
            filterListing,
            setFirstAdminVisitMarketplaceStatus,
            getPluginStatuses,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal);
