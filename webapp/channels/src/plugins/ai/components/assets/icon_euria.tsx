import React from 'react';

import iconEuria from 'images/euria_logo.webp';

export interface IconEuriaProps {
    className?: string;
    height?: number | string;
    width?: number | string;
}

const IconEuria = (props: IconEuriaProps) => (
    <img
        className={props.className}
        src={iconEuria}
        alt='Euria icon'
        height={props.height ?? 19}
        width={props.width ?? 19}
    />
);

export default IconEuria;
