import styled, {css} from 'styled-components';

import CheckCircleIcon from 'components/widgets/icons/check_circle_icon';
import CloseIcon from 'components/widgets/icons/close_icon';
import QuestionMarkIcon from 'components/widgets/icons/question_mark_icon';

import type {ConferenceUserStatus} from 'types/conference';

export const IconWrapper = styled.div<{status: ConferenceUserStatus}>`
    position: absolute;
    width: 10px;
    height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0;
    right: 0;
    border-radius: 10px;
    transform: translateX(-50%);

    ${({status}) => status === 'denied' && css`
        background-color: #F44336;
    `};

    ${({status}) => status === 'approved' && css`
        background-color: #3EBF4D;
    `};

    ${({status}) => status === 'pending' && css`
        background-color: #9F9F9F;
    `};
`;

export const Container = styled.div<{grayscale: boolean}>`
    position: relative;

    ${({grayscale}) => grayscale && css`
        filter: grayscale(1);
    `};

    &:hover {
        ${IconWrapper} {
            z-index: 10;
        }
    }
`;

export const DeniedIcon = styled(CloseIcon)`
    svg {
        width: 10px;
        height: 10px;
        fill: white;
    }
`;
export const GrantedIcon = styled(CheckCircleIcon)`
    svg {
        width: 10px;
        height: 10px;
        fill: white;
    }
`;
export const PendingIcon = styled(QuestionMarkIcon)`
    svg {
        height: 10px;
        fill: white;
    }
`;
