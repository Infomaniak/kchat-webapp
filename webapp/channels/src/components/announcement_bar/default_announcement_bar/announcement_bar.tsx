// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ReactNode} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {Constants, AnnouncementBarTypes} from 'utils/constants';
import {isStringContainingUrl} from 'utils/url';

type Props = {
    id?: string;
    showCloseButton: boolean;
    color: string;
    textColor: string;
    type: string;
    message: ReactNode;
    tooltipMsg?: ReactNode;
    handleClose?: (e?: any) => void;
    showModal?: boolean;
    announcementBarCount?: number;
    onButtonClick?: (e?: any) => void;
    modalButtonText?: string;
    modalButtonDefaultText?: string;
    showLinkAsButton: boolean;
    icon?: ReactNode;
    actions: {
        incrementAnnouncementBarCount: () => void;
        decrementAnnouncementBarCount: () => void;
    };
    showCTA?: boolean;
    isStringContainingUrl?: boolean;
    ctaText?: ReactNode;
    ctaDisabled?: boolean;
}

type State = {
    showTooltip: boolean;
    isStringContainingUrl: boolean;
}

const OVERLAY_ANNOUNCEMENT_HIDE_DELAY = 600;

export default class AnnouncementBar extends React.PureComponent<Props, State> {
    messageRef: React.RefObject<HTMLDivElement>;
    constructor(props: Props) {
        super(props);

        this.messageRef = React.createRef();

        this.state = {
            showTooltip: false,
            isStringContainingUrl: this.props.isStringContainingUrl || false,
        };
    }

    static defaultProps = {
        showCloseButton: false,
        color: '',
        textColor: '',
        type: AnnouncementBarTypes.CRITICAL,
        showLinkAsButton: false,
        isTallBanner: false,
        showCTA: true,
    };

    enableToolTipIfNeeded = () => {
        const elm = this.messageRef.current;
        if (elm) {
            const enable = elm.offsetWidth < elm.scrollWidth;
            this.setState({showTooltip: enable});
            if (typeof this.props.message == 'string') {
                this.setState({isStringContainingUrl: isStringContainingUrl(this.props.message)});
            }
            return;
        }
        this.setState({showTooltip: false});
    };

    componentDidMount() {
        this.props.actions.incrementAnnouncementBarCount();
        document.body.classList.add('announcement-bar--fixed');
    }

    componentDidUpdate() {
        if (this.props.announcementBarCount === 1) {
            document.body.classList.add('announcement-bar--fixed');
        }
    }

    componentWillUnmount() {
        if (this.props.announcementBarCount === 1) {
            document.body.classList.remove('announcement-bar--fixed');
        }
        this.props.actions.decrementAnnouncementBarCount();
    }

    handleClose = (e: any) => {
        e.preventDefault();
        if (this.props.handleClose) {
            this.props.handleClose();
        }
    };

    render() {
        if (!this.props.message) {
            return null;
        }

        let barClass = 'announcement-bar';
        const barStyle = {backgroundColor: '', color: ''};
        const linkStyle = {color: ''};
        if (this.props.color && this.props.textColor) {
            barStyle.backgroundColor = this.props.color;
            barStyle.color = this.props.textColor;
            linkStyle.color = this.props.textColor;
        } else if (this.props.type === AnnouncementBarTypes.DEVELOPER) {
            barClass = 'announcement-bar announcement-bar-critical';
        } else if (this.props.type === AnnouncementBarTypes.CRITICAL) {
            barClass = 'announcement-bar announcement-bar-critical';
        } else if (this.props.type === AnnouncementBarTypes.SUCCESS) {
            barClass = 'announcement-bar announcement-bar-success';
        } else if (this.props.type === AnnouncementBarTypes.ADVISOR) {
            barClass = 'announcement-bar announcement-bar-advisor';
        } else if (this.props.type === AnnouncementBarTypes.ADVISOR_ACK) {
            barClass = 'announcement-bar announcement-bar-advisor-ack';
        } else if (this.props.type === AnnouncementBarTypes.GENERAL) {
            barClass = 'announcement-bar announcement-bar-general';
        } else if (this.props.type === AnnouncementBarTypes.INFOMANIAK) {
            barClass = 'announcement-bar announcement-bar-infomaniak';
        } else if (this.props.type === AnnouncementBarTypes.INFOMANIAK_MOBILE) {
            barClass = 'announcement-bar announcement-bar-infomaniak-mobile';
        } else if (this.props.type === AnnouncementBarTypes.INFOMANIAK_ADVISOR) {
            barClass = 'announcement-bar announcement-bar-infomaniak-advisor';
        }

        let closeButton;
        if (this.props.showCloseButton) {
            closeButton = (
                <a
                    href='#'
                    className='announcement-bar__close'
                    style={linkStyle}
                    onClick={this.handleClose}
                >
                    {'×'}
                </a>
            );
        }

        let message = this.props.message;
        if (typeof message == 'string') {
            message = (
                <FormattedMarkdownMessage id={this.props.message as string}/>
            );
        }
        const announcementTooltip = this.state.showTooltip ? (
            <Tooltip id='announcement-bar__tooltip'>
                {this.props.tooltipMsg ? this.props.tooltipMsg : message}
            </Tooltip>
        ) : <></>;

        const announcementIcon = () => {
            return this.props.showLinkAsButton &&
            (this.props.showCloseButton ? <div className='content__icon'>{'\uF5D6'}</div> : <div className='content__icon'>{'\uF02A'}</div>);
        };

        return (
            <div
                className={barClass}
                style={barStyle}
                // eslint-disable-next-line react/no-unknown-property
                css={{gridArea: 'announcement'}}
                data-testid={this.props.id}
            >
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={announcementTooltip}
                    delayHide={this.state.isStringContainingUrl ? OVERLAY_ANNOUNCEMENT_HIDE_DELAY : 0}
                >
                    <div className='announcement-bar__text'>
                        {this.props.icon ? this.props.icon : announcementIcon()}
                        <span
                            ref={this.messageRef}
                            onMouseEnter={this.enableToolTipIfNeeded}
                        >
                            {message}
                        </span>
                        {
                            this.props.showLinkAsButton && this.props.showCTA && this.props.modalButtonText && this.props.modalButtonDefaultText &&
                            <button
                                onClick={this.props.onButtonClick}
                                disabled={this.props.ctaDisabled}
                            >
                                <FormattedMessage
                                    id={this.props.modalButtonText}
                                    defaultMessage={this.props.modalButtonDefaultText}
                                />
                            </button>
                        }
                        {
                            this.props.showLinkAsButton && this.props.showCTA && this.props.ctaText &&
                            <button
                                onClick={this.props.onButtonClick}
                                disabled={this.props.ctaDisabled}
                            >
                                {this.props.ctaText}
                            </button>
                        }
                    </div>
                </OverlayTrigger>
                {closeButton}
            </div>
        );
    }
}
