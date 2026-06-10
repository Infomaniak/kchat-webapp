// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ReactNode} from 'react';
import React from 'react';
import type {MessageDescriptor} from 'react-intl';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import WithTooltip from 'components/with_tooltip';

import {AnnouncementBarTypes} from 'utils/constants';
import {isStringContainingUrl} from 'utils/url';

import './default_announcement_bar.scss';

type Props = {
    id?: string;
    showCloseButton: boolean;
    className?: string;
    color: string;
    textColor: string;
    type: string;
    message: ReactNode;
    tooltipMsg?: ReactNode;
    handleClose?: (e?: any) => void;
    showModal?: boolean;
    announcementBarCount?: number;
    onButtonClick?: (e?: any) => void;
    modalButtonText?: MessageDescriptor;
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
        } else if (this.props.type === AnnouncementBarTypes.WARNING) {
            barClass = 'announcement-bar announcement-bar-warning';
        }

        if (this.props.className) {
            barClass += ` ${this.props.className}`;
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
                    <svg
                        width='14'
                        height='15'
                        viewBox='0 0 14 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M8.00809 7.40329C7.98176 7.37703 7.96696 7.34136 7.96696 7.30417C7.96696 7.26698 7.98176 7.23132 8.00809 7.20505L13.1954 2.01833C13.5234 1.68988 13.523 1.15772 13.1945 0.829732C12.8661 0.501741 12.3339 0.502117 12.0059 0.830572L6.81921 6.01505C6.79295 6.04138 6.75728 6.05618 6.72009 6.05618C6.6829 6.05618 6.64724 6.04138 6.62097 6.01505L1.43425 0.830572C1.10626 0.502426 0.574356 0.502301 0.24621 0.830292C-0.0819352 1.15828 -0.0820606 1.69019 0.24593 2.01833L5.43209 7.20505C5.45842 7.23132 5.47322 7.26698 5.47322 7.30417C5.47322 7.34136 5.45842 7.37703 5.43209 7.40329L0.24593 12.5906C0.0337574 12.8028 -0.0490522 13.1122 0.0286951 13.4021C0.106442 13.692 0.332935 13.9183 0.622855 13.9959C0.912775 14.0736 1.22208 13.9906 1.43425 13.7783L6.62097 8.59105C6.64724 8.56472 6.6829 8.54992 6.72009 8.54992C6.75728 8.54992 6.79295 8.56472 6.81921 8.59105L12.0059 13.7783C12.3339 14.1065 12.8658 14.1066 13.194 13.7786C13.5221 13.4506 13.5222 12.9187 13.1943 12.5906L8.00809 7.40329Z'
                            fill='currentColor'
                        />
                    </svg>
                </a>
            );
        }

        let message = this.props.message;
        if (typeof message == 'string') {
            message = (
                <FormattedMarkdownMessage id={this.props.message as string}/>
            );
        }

        const announcementIcon = () => {
            return this.props.showLinkAsButton &&
            (this.props.showCloseButton ? <i className='icon icon-alert-circle-outline'/> : <i className='icon icon-alert-outline'/>);
        };

        let barContent = (<div className='announcement-bar__text'>
            {this.props.icon ? this.props.icon : announcementIcon()}
            <span
                ref={this.messageRef}
                onMouseEnter={this.enableToolTipIfNeeded}
            >
                {message}
            </span>
            {
                this.props.showLinkAsButton && this.props.showCTA && this.props.modalButtonText &&
                <button
                    onClick={this.props.onButtonClick}
                    disabled={this.props.ctaDisabled}
                >
                    <FormattedMessage
                        {...this.props.modalButtonText}
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
        </div>);

        if (this.state.showTooltip) {
            barContent = (
                <WithTooltip
                    title={this.props.tooltipMsg ? this.props.tooltipMsg : message}
                    className='announcementBarTooltip'
                    delayClose={true}
                >
                    {barContent}

                </WithTooltip>);
        }

        return (
            <div
                className={barClass}
                style={barStyle}
                // eslint-disable-next-line react/no-unknown-property
                css={{gridArea: 'announcement'}}
                data-testid={this.props.id}
            >
                {barContent}
                {closeButton}
            </div>
        );
    }
}
