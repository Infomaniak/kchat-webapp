// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch, ActionCreatorsMapObject} from 'redux';
import {bindActionCreators} from 'redux';

import type {GlobalState} from '@mattermost/types/store';
import type {TermsOfService as ReduxTermsOfService} from '@mattermost/types/terms_of_service';

import {getTermsOfService, updateMyTermsOfServiceStatus} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import type {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {getEmojiMap} from 'selectors/emojis';

import type {UpdateMyTermsOfServiceStatusResponse} from './terms_of_service';
import TermsOfService from './terms_of_service';

type Actions = {
    getTermsOfService: () => Promise<{data: ReduxTermsOfService}>;
    updateMyTermsOfServiceStatus: (
        termsOfServiceId: string,
        accepted: boolean
    ) => {data: UpdateMyTermsOfServiceStatusResponse};
};

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const useCaseOnboarding = getUseCaseOnboarding(state);
    return {
        useCaseOnboarding,
        termsEnabled: config.EnableCustomTermsOfService === 'true',
        emojiMap: getEmojiMap(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getTermsOfService,
            updateMyTermsOfServiceStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsOfService);
