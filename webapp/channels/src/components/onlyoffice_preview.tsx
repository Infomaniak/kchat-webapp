// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import {bindActionCreators, type Dispatch} from 'redux';

import type {FileInfo} from '@mattermost/types/files';

import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';
import type {GenericAction} from 'mattermost-redux/types/actions';

type Props = {
    fileInfo: FileInfo;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            forceLogoutIfNecessary,
        }, dispatch),
    };
}

const connector = connect(undefined, mapDispatchToProps);

export type PropsFromRedux = Props & ConnectedProps<typeof connector>;

class OnlyofficePreview extends React.PureComponent<PropsFromRedux> {
    async componentDidMount() {
        if (document.getElementById('onlyoffice-script')) {
            const result = await this.fetchFileInfoForUrl(this.props.fileInfo.id);

            if ('error' in result) {
                console.warn(result.error);
            } else {
                this.loadDocument(result as FileInfo);
            }
        } else {
            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.id = 'onlyoffice-script';
            script.src = 'https://documentserver.kdrive.infomaniak.com/web-apps/apps/api/documents/api.js';
            script.async = true;

            document.body.appendChild(script);

            script.onload = async () => {
                const result = await this.fetchFileInfoForUrl(this.props.fileInfo.id);

                if ('error' in result) {
                    console.warn(result.error);
                } else {
                    this.loadDocument(result as FileInfo);
                }
            };
        }
    }

    async fetchFileInfoForUrl(fileId: string) {
        try {
            const fileInfo = await Client4.getFileInfosForFile(fileId);
            return fileInfo;
        } catch (error) {
            console.warn(error);
            return {error};
        }
    }

    loadDocument(freshFileInfo: FileInfo) {
        // eslint-disable-next-line no-new
        new DocsAPI.DocEditor('onlyoffice-placeholder', freshFileInfo.onlyoffice);
    }

    render() {
        return (
            <div id='onlyoffice-placeholder'/>
        );
    }
}

export default connector(OnlyofficePreview);
