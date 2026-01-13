// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import type {KeyboardEvent, MouseEvent} from 'react';

import type {
    Post,
    PostImage as PostImageMetadata,
} from '@mattermost/types/posts';

import ExternalImage from 'components/external_image';
import FilePreviewModal from 'components/file_preview_modal';
import SizeAwareImage from 'components/size_aware_image';

import {ModalIdentifiers} from 'utils/constants';

import type {ModalData} from 'types/actions';

type PostImageProps = {
    imageMetadata: PostImageMetadata;
    link: string;
    post: Post;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        saveFileToKDrive: (fileId: string, fileName: string) => void;
    };
}

const PostImage = ({
    imageMetadata,
    link,
    post,
    actions,
}: PostImageProps) => {
    const {openModal, saveFileToKDrive} = actions;
    const handleKDriveSave = useCallback(async (fileId: string, fileName: string) => {
        saveFileToKDrive(fileId, fileName);
        return {data: true};
    }, [saveFileToKDrive]);
    const showModal = useCallback((
        e: KeyboardEvent<HTMLImageElement> | MouseEvent<HTMLElement>,
        link = '',
    ) => {
        e.preventDefault();

        openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                post,
                startIndex: 0,
                fileInfos: [
                    {
                        has_preview_image: false,
                        link,
                        extension: imageMetadata.format,
                        name: link,
                    },
                ],
            },
        });
    }, [openModal, imageMetadata.format, post]);

    return (
        <div className='post__embed-container'>
            <ExternalImage
                src={link}
                imageMetadata={imageMetadata}
            >
                {(safeLink) => (
                    <>
                        <SizeAwareImage
                            className='img-div attachment__image cursor--pointer'
                            src={safeLink}
                            dimensions={imageMetadata}
                            showLoader={true}
                            onClick={showModal}
                            handleKDriveSave={handleKDriveSave}
                        />
                    </>
                )}
            </ExternalImage>
        </div>
    );
};

export default PostImage;
