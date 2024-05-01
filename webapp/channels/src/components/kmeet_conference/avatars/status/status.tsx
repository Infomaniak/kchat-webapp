import React, {type FC} from 'react';

import type {Registrant} from 'types/conference';

import * as Sc from './styled';

type Props = {
    registrant: Registrant;
    children: React.ReactChild;
}

const Status: FC<Props> = ({registrant, children}) => {
    return (
        <Sc.Container>
            <Sc.IconWrapper status={registrant.status}>
                {registrant.status === 'denied' && <Sc.DeniedIcon/>}
                {registrant.status === 'granted' && <Sc.GrantedIcon/>}
                {registrant.status === 'pending' && <Sc.PendingIcon/>}
            </Sc.IconWrapper>
            {children}
        </Sc.Container>
    );
};

export default Status;
