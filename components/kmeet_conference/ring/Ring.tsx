// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
type PropsType={
    sound: string;
}
const Ring = (props: PropsType) => {
    return (
        <>
            <audio
                preload='auto'
                src={props.sound}
                loop={true}
                autoPlay={true}
            />
        </>
    );
};
export default Ring;
