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
    placeholderId: string;
    scriptId: string;
    scriptSrc: string;
    container: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);

        this.placeholderId = 'onlyoffice-placeholder';
        this.scriptId = 'onlyoffice-script';
        this.scriptSrc = 'https://documentserver.kdrive.infomaniak.com/web-apps/apps/api/documents/api.js';
        this.container = React.createRef();
    }

    async componentDidUpdate() {
        await this.prepareDoc();
    }

    async componentDidMount() {
        await this.prepareDoc();
    }

    async prepareDoc() {
        if (document.getElementById(this.scriptId)) {
            const fileInfo = await this.downloadFile(this.props.fileInfo.id);

            if (fileInfo) {
                this.loadDocument(fileInfo);
            }
        } else {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = this.scriptId;
            script.src = this.scriptSrc;
            script.async = true;

            document.body.appendChild(script);

            script.onload = async () => {
                const fileInfo = await this.downloadFile(this.props.fileInfo.id);

                if (fileInfo) {
                    this.loadDocument(fileInfo);
                }
            };
        }
    }

    async downloadFile(fileId: string) {
        const result = await this.fetchFileInfoForUrl(fileId);

        if ('error' in result) {
            console.warn(result.error);
            return null;
        }

        return result as FileInfo;
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
        if (this.container.current) {
            const placeholder = document.createElement('div');
            placeholder.id = this.placeholderId;

            this.container.current.innerHTML = '';
            this.container.current.appendChild(placeholder);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line new-cap
            DocsAPI.DocEditor(this.placeholderId, freshFileInfo.onlyoffice);
        }
    }

    render() {
        return (
            <div
                style={{height: '100%'}}
                ref={this.container}
            />
        );
    }
}

export default connector(OnlyofficePreview);
