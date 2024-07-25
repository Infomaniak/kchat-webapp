// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

export default class SettingsGroup extends React.PureComponent {
    static get propTypes() {
        return {
            show: PropTypes.bool.isRequired,
            header: PropTypes.node,
            title: PropTypes.node,
            subtitle: PropTypes.node,
            children: PropTypes.node,
            container: PropTypes.bool,
        };
    }

const SettingsGroup = ({
    show = true,
    container = true,
    header,
    title,
    subtitle,
    children,
}: Props) => {
    let wrapperClass = '';
    let contentClass = '';

    if (!show) {
        return null;
    }

    if (container) {
        wrapperClass = 'admin-console__wrapper';
        contentClass = 'admin-console__content';
    }

    let sectionTitle = null;
    if (!header && title) {
        sectionTitle = <div className={'section-title'}>{title}</div>;
    }

    let sectionSubtitle = null;
    if (!header && subtitle) {
        sectionSubtitle = (
            <div className={'section-subtitle'}>{subtitle}</div>
        );
    }

    let sectionHeader = null;
    if (sectionTitle || sectionSubtitle) {
        sectionHeader = (
            <div className={'section-header'}>
                {sectionTitle}
                {sectionSubtitle}
            </div>
        );
    }

    return (
        <div className={wrapperClass}>
            <div className={contentClass}>
                {header ? <h4>{header}</h4> : null}
                {sectionHeader}
                {children}
            </div>
        </div>
    );
};

export default memo(SettingsGroup);
