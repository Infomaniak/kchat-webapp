// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import type {OnlyofficeMeta} from '@mattermost/types/files';

import FilePreviewModal from 'components/file_preview_modal/file_preview_modal';

import {TestHelper} from 'utils/test_helper';

describe('components/FilePreviewModal', () => {
    const baseProps = {
        fileInfos: [TestHelper.getFileInfoMock({id: 'file_id', extension: 'jpg'})],
        startIndex: 0,
        canDownloadFiles: true,
        enablePublicLink: true,
        isMobileView: false,
        post: TestHelper.getPostMock(),
        onExited: jest.fn(),
    };

    test('should render OnlyofficePreview when fileOnlyoffice is true', () => {
        const onlyofficeMeta: OnlyofficeMeta = {
            document: {
                fileType: 'docx',
                key: 'unique-key-1234',
            },
            documentType: 'word',
            editorConfig: {},
            type: 'desktop',
        };

        const fileInfo = {...(TestHelper.getFileInfoMock({id: 'file_id_1', extension: 'docx'})), onlyoffice: onlyofficeMeta};

        const props = {
            ...baseProps,
            fileInfos: [fileInfo],
        };

        const wrapper = shallow(<FilePreviewModal {...props}/>);

        expect(wrapper.find('.file-preview-modal__scrollable').exists()).toBe(true);
    });
});
