import React from 'react';
import {useIntl} from 'react-intl';

export function InfomaniakChannelSearchSvg(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                width='140'
                height='140'
                viewBox='0 0 140 140'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-label={formatMessage({id: 'generic_icons.channel_search', defaultMessage: 'Channel Search Icon'})}
            >
                <g clipPath='url(#clip0_5407_2941)'>
                    <path
                        d='M4.04124 25.8945H96.0783C98.3103 25.8945 100.12 27.7039 100.12 29.9358V93.7862C100.12 96.0181 98.3103 97.8275 96.0783 97.8275H35.9673L17.3404 117.671V97.8275H4.04124C1.8093 97.8275 -4.57764e-05 96.0181 -4.57764e-05 93.7862V29.9358C-4.57764e-05 27.7039 1.8093 25.8945 4.04124 25.8945Z'
                        fill='#7BB4D1'
                    />
                    <path
                        d='M131.645 107.609L93.7298 83.2319L100.463 72.7596L138.378 97.1371C139.766 98.0294 140.168 99.8779 139.275 101.266L135.773 106.712C134.881 108.1 133.033 108.502 131.645 107.609Z'
                        fill='var(--ik-btn-secondary)'
                        stroke='var(--ik-illustration-grey-18)'
                        strokeWidth='0.5'
                    />
                    <path
                        d='M93.0094 28.5154C111.317 40.2865 116.616 64.6703 104.845 82.9782C93.0742 101.286 68.6904 106.585 50.3826 94.8142C32.0747 83.0431 26.7756 58.6592 38.5466 40.3513C50.3177 22.0434 74.7015 16.7443 93.0094 28.5154Z'
                        fill='var(--ik-illustration-grey-9)'
                        stroke='var(--ik-illustration-grey-18)'
                        strokeWidth='0.5'
                    />
                    <path
                        d='M87.7562 36.6856C101.552 45.5557 105.545 63.9301 96.6752 77.726C87.8051 91.5219 69.4307 95.5151 55.6349 86.645C41.839 77.7749 37.8458 59.4005 46.7159 45.6046C55.586 31.8087 73.9604 27.8156 87.7562 36.6856Z'
                        fill='var(--ik-illustration-grey-6)'
                        stroke='var(--ik-illustration-grey-18)'
                        strokeWidth='0.5'
                    />
                    <path
                        d='M74.2181 41.0963C80.0412 44.8403 81.7266 52.5958 77.9827 58.4189C74.2388 64.2419 66.4832 65.9273 60.6602 62.1834C54.8372 58.4395 53.1517 50.6839 56.8956 44.8609C60.6396 39.0378 68.3951 37.3524 74.2181 41.0963Z'
                        fill='var(--ik-illustration-grey-11)'
                        stroke='var(--ik-illustration-grey-18)'
                        strokeWidth='0.5'
                    />
                    <path
                        d='M133.465 98.7907C134.477 99.4412 134.77 100.789 134.119 101.801C133.469 102.813 132.121 103.106 131.109 102.455C130.097 101.804 129.805 100.457 130.455 99.4448C131.106 98.433 132.453 98.1401 133.465 98.7907Z'
                        fill='white'
                        stroke='var(--ik-illustration-grey-18'
                        strokeWidth='0.5'
                    />
                </g>
                <defs>
                    <clipPath id='clip0_5407_2941'>
                        <rect
                            width='140'
                            height='139.671'
                            fill='white'
                        />
                    </clipPath>
                </defs>
            </svg>
        </span>
    );
}
