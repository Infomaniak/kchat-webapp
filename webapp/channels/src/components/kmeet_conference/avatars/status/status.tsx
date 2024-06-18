import React, {type FC} from 'react';

import type {Registrant} from 'types/conference';

import * as Sc from './styled';

type Props = {
    registrant: Registrant;
    showStatus: boolean;
    children: React.ReactChild;
}

const Status: FC<Props> = ({registrant, showStatus, children}) => {
    return (
        <Sc.Container grayscale={!registrant.present && registrant.status === 'approved'}>
            {showStatus && (
                <Sc.IconWrapper status={registrant.status}>
                    {registrant.status === 'denied' && <Sc.DeniedIcon/>}
                    {registrant.status === 'approved' && <Sc.GrantedIcon/>}
                    {registrant.status === 'pending' && <Sc.PendingIcon/>}
                </Sc.IconWrapper>
            )}
            {children}
        </Sc.Container>
    );
};

export default Status;
