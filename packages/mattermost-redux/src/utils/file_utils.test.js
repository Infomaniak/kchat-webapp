// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {Client4} from 'mattermost-redux/client';

import * as FileUtils from 'mattermost-redux/utils/file_utils';

describe('FileUtils', () => {
    const serverUrl = Client4.getUrl();
    beforeEach(() => {
        Client4.setUrl('localhost');
    });

    afterEach(() => {
        Client4.setUrl(serverUrl);
    });

    it('getFileUrl', () => {
        assert.deepEqual(FileUtils.getFileUrl('id1'), 'localhost/api/v4/files/id1');
        assert.deepEqual(FileUtils.getFileUrl('id2'), 'localhost/api/v4/files/id2');
    });

    it('getFileDownloadUrl', () => {
        assert.deepEqual(FileUtils.getFileDownloadUrl('id1'), 'localhost/api/v4/files/id1?download=1');
        assert.deepEqual(FileUtils.getFileDownloadUrl('id2'), 'localhost/api/v4/files/id2?download=1');
    });

    it('getFileThumbnailUrl', () => {
        assert.deepEqual(FileUtils.getFileThumbnailUrl('id1'), 'localhost/api/v4/files/id1/thumbnail');
        assert.deepEqual(FileUtils.getFileThumbnailUrl('id2'), 'localhost/api/v4/files/id2/thumbnail');
    });

    it('getFilePreviewUrl', () => {
        assert.deepEqual(FileUtils.getFilePreviewUrl('id1'), 'localhost/api/v4/files/id1/preview');
        assert.deepEqual(FileUtils.getFilePreviewUrl('id2'), 'localhost/api/v4/files/id2/preview');
    });

    it('getFileMiniPreviewUrl', () => {
        assert.deepEqual(FileUtils.getFileMiniPreviewUrl({}), undefined);
        assert.deepEqual(FileUtils.getFileMiniPreviewUrl({mime_type: 'mime_type', mini_preview: 'mini_preview'}), 'data:mime_type;base64,mini_preview');
    });

    it('sortFileInfos', () => {
        const testCases = [
            {inputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}], outputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}]},
            {inputFileInfos: [{name: 'bbb', create_at: 200}, {name: 'aaa', create_at: 100}], outputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}]},
            {inputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}, {name: 'ccc', create_at: 300}], outputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}, {name: 'ccc', create_at: 300}]},
            {inputFileInfos: [{name: 'ccc', create_at: 300}, {name: 'bbb', create_at: 200}, {name: 'aaa', create_at: 100}], outputFileInfos: [{name: 'aaa', create_at: 100}, {name: 'bbb', create_at: 200}, {name: 'ccc', create_at: 300}]},
            {inputFileInfos: [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'aaa', create_at: 200}], outputFileInfos: [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'aaa', create_at: 200}]},
            {inputFileInfos: [{id: '2', name: 'aaa', create_at: 200}, {id: '1', name: 'aaa', create_at: 100}], outputFileInfos: [{id: '1', name: 'aaa', create_at: 100}, {id: '2', name: 'aaa', create_at: 200}]},
        ];

        testCases.forEach((testCase) => {
            assert.deepEqual(FileUtils.sortFileInfos(testCase.inputFileInfos), testCase.outputFileInfos);
        });
    });
});
