import classNames from 'classnames';
import React from 'react';
import type {FC} from 'react';

import './text_banner.scss';

export type Props = {
    className?: string;

    children: React.ReactNode;
}

const TextBanner: FC<Props> = ({className, children}) => {
    return (
        <div className={classNames('TextBanner', className)}>
            {children}
        </div>
    );
};

export default TextBanner;
