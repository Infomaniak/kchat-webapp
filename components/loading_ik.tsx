// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';
import {FormattedMessage} from 'react-intl';

import loaderIk from 'images/ik/manager2x.gif';

type Props = {
    position: 'absolute' | 'fixed' | 'relative' | 'static' | 'inherit';
    style?: CSSProperties;
    message?: ReactNode;
}

export default class LoadingIk extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        position: 'relative',
        style: {},
    }

    public constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render(): JSX.Element {
        return (
            <div
                className='loader-ik'
                style={{position: this.props.position, ...this.props.style}}
            >

                <div className='loader-ik__content'>
                    <div className='loader-ik__circle'>
                        <img
                            className='loader-ik__image'
                            src={loaderIk}
                            alt='loader'
                        />
                    </div>
                </div>
            </div>
        );
    }
}
