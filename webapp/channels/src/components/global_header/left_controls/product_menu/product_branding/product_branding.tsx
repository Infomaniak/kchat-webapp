// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Heading from '@infomaniak/compass-components/components/heading';
import Icon from '@infomaniak/compass-components/foundations/icon';
import React from 'react';
import styled from 'styled-components';
import {useCurrentProduct} from 'utils/products';

const ProductBrandingContainer = styled.div`
    display: flex;
    align-items: center;

    > * + * {
        margin-left: 8px;
    }
`;

const ProductBranding = (): JSX.Element => {
    const currentProduct = useCurrentProduct();

    return (
        <ProductBrandingContainer tabIndex={0}>
            <Icon
                size={20}
                glyph={currentProduct && typeof currentProduct.switcherIcon === 'string' ? currentProduct.switcherIcon : 'product-channels'}
            />
            <Heading
                element='h1'
                size={200}
                margin='none'
            >
                {currentProduct ? currentProduct.switcherText : 'Channels'}
            </Heading>
        </ProductBrandingContainer>
    );
};

export default ProductBranding;
