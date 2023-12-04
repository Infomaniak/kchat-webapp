// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

export default class RhsSettingsItem extends React.PureComponent {
    static defaultProps = {
        infoPosition: 'bottom',
        saving: false,
        section: '',
        containerStyle: '',
    };

    static propTypes = {

        /**
         * Array of inputs selection
         */
        inputs: PropTypes.node,

        /**
         * Styles for main component
         */
        containerStyle: PropTypes.string,

        /**
         * Client error
         */
        clientError: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),

        /**
         * Server error
         */
        serverError: PropTypes.string,

        /**
         * Settings extra information
         */
        extraInfo: PropTypes.element,

        /**
         * Info position
         */
        infoPosition: PropTypes.string,

        /**
         * Settings or tab section
         */
        section: PropTypes.string,

        /**
         * Function to update section
         */
        updateSection: PropTypes.func,

        /**
         * setting to submit
         */
        setting: PropTypes.string,

        /**
         * Function to submit setting
         */
        submit: PropTypes.func,

        /**
         * Disable submit by enter key
         */
        disableEnterSubmit: PropTypes.bool,

        /**
         * Extra information on submit
         */
        submitExtra: PropTypes.node,

        /**
         * Indicates whether setting is on saving
         */
        saving: PropTypes.bool,

        /**
         * Settings title
         */
        title: PropTypes.node,

        /**
         * Settings width
         */
        width: PropTypes.string,

        /**
         * Text of cancel button
         */
        cancelButtonText: PropTypes.node,

        /**
         * Avoid submitting when using SHIFT + ENTER
         */
        shiftEnter: PropTypes.bool,

        /**
         * Text of save button
         */
        saveButtonText: PropTypes.string,

        messageDesc: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node,
            PropTypes.func,
        ]),

        childOptionSection: PropTypes.node,

        isSelect: PropTypes.bool,

        isCustomBtn: PropTypes.bool,

        subtitle: PropTypes.element,
    };

    constructor(props) {
        super(props);
        this.settingList = React.createRef();
    }

    componentDidMount() {
        if (this.settingList.current) {
            const focusableElements = this.settingList.current.querySelectorAll('.btn:not(.save-button):not(.btn-cancel), input.form-control, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }

        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (e) => {
        if (this.props.shiftEnter && e.keyCode === Constants.KeyCodes.ENTER && e.shiftKey) {
            return;
        }
        if (this.props.disableEnterSubmit !== true && isKeyPressed(e, Constants.KeyCodes.ENTER) && this.props.submit && e.target.tagName !== 'SELECT' && e.target.parentElement && e.target.parentElement.className !== 'react-select__input' && !e.target.classList.contains('btn-cancel') && this.settingList.current && this.settingList.current.contains(e.target)) {
            this.handleSubmit(e);
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();

        if (this.props.setting) {
            this.props.submit(this.props.setting);
        } else {
            this.props.submit();
        }
    };

    handleUpdateSection = (e) => {
        this.props.updateSection(this.props.section);
        e.preventDefault();
    };

    render() {
        let clientError = null;
        if (this.props.clientError) {
            clientError = (
                <div className='form-group'>
                    <label
                        id='clientError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.clientError}
                    </label>
                </div>
            );
        }

        let serverError = null;
        if (this.props.serverError) {
            serverError = (
                <div className='form-group'>
                    <label
                        id='serverError'
                        className='col-sm-12 has-error'
                    >
                        {this.props.serverError}
                    </label>
                </div>
            );
        }

        let extraInfo = null;
        let messageDesc = null;
        let hintClass = 'setting-list__hint';
        if (this.props.infoPosition === 'top') {
            hintClass = 'pb-3';
        }

        if (this.props.extraInfo) {
            extraInfo = (
                <div
                    id='extraInfo'
                    className={hintClass}
                >
                    {this.props.extraInfo}
                </div>
            );
        }

        if (this.props.messageDesc) {
            messageDesc = (
                <div
                    id='messageDesc'
                    className={hintClass}
                >
                    {this.props.messageDesc}
                </div>
            );
        }

        const inputs = this.props.inputs;

        let title;
        if (this.props.title) {
            title = (
                <div className={`col-sm-12 ${this.props.isSelect ? 'title-select' : 'title-toggle'}`}>
                    <h5
                        id='settingTitle'
                        className='settings-title'
                    >
                        {this.props.title}
                    </h5>
                    {inputs}
                </div>
            );
        }

        let childOptionSection;
        if (this.props.childOptionSection) {
            childOptionSection = this.props.childOptionSection;
        }

        let listContent = (
            <div className='setting-list-item'>
                <div className='mt-2'>
                    <div className='settings-desc'>{messageDesc}</div>
                    {extraInfo}
                </div>
                {childOptionSection}
            </div>
        );

        if (this.props.infoPosition === 'top') {
            listContent = (
                <div>
                    <div className='mt-2'>
                        {extraInfo}
                        {messageDesc}
                    </div>
                    {childOptionSection}
                </div>
            );
        }

        if (this.props.isCustomBtn) {
            return (
                <section
                    className={`row rhs-settings-section ${this.props.containerStyle}  pb-4`}
                >
                    <div className='clearfix'>
                        {inputs}
                    </div>
                    {childOptionSection}
                    <div className='setting-list-item'>
                        {this.props.submitExtra}
                        {serverError}
                        {clientError}
                    </div>
                </section>
            );
        }

        return (
            <section
                className={`row rhs-settings-section ${this.props.containerStyle}`}
            >
                {title}
                {this.props.subtitle}
                <div className='col-sm-12'>
                    <div
                        tabIndex='-1'
                        ref={this.settingList}
                        className='setting-list'
                    >
                        {listContent}
                        <div className='setting-list-item'>
                            {this.props.submitExtra}
                            {serverError}
                            {clientError}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
