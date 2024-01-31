// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ExternalLink from 'components/external_link';

interface Props {
    toast?: {
        message: string;
        props?: {
            link: string;
        };
    };
    setKDriveToast: () => void;
}

export default class KDriveUploadToast extends React.PureComponent<Props> {
    onDismissClick = () => {
        const {setKDriveToast} = this.props;
        setKDriveToast();
    };

    render() {
        const {toast} = this.props;

        if (!toast) {
            return null;
        }

        return (
            <div
                id='kdrive-upload-toast'
                className='toast toast__visible'
                style={{backgroundColor: '#339970'}}
            >
                <div
                    className='toast__message'
                >
                    <div style={{position: 'absolute'}}>
                        <span>{toast.message}</span>
                        <div/>
                    </div>
                </div>

                {toast.props?.link && (
                    <div
                        className='toast__dismiss'
                        style={{right: '40px'}}
                    >
                        <ExternalLink
                            style={{color: 'white'}}
                            href={toast.props.link}
                            target='_blank'
                            rel='noreferrer'
                        >
                            <div>
                                <span style={{margin: '0 4px'}}>{'Open'}</span>
                            </div>
                        </ExternalLink>
                    </div>
                )}

                <div
                    className='toast__dismiss'
                    onClick={this.onDismissClick}
                >
                    <span className='close-btn'>
                        <svg
                            width='24px'
                            height='24px'
                            viewBox='0 0 24 24'
                            role='img'
                            aria-label='Close Icon'
                        >
                            <path
                                fillRule='nonzero'
                                d='M18 7.209L16.791 6 12 10.791 7.209 6 6 7.209 10.791 12 6 16.791 7.209 18 12 13.209 16.791 18 18 16.791 13.209 12z'
                            />
                        </svg>
                    </span>
                </div>
            </div>
        );
    }
}

