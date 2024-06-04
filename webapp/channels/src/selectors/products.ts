// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {matchPath} from 'react-router-dom';

import type {ProductIdentifier} from '@mattermost/types/products';

import type {GlobalState} from 'types/store';

import type {ProductComponent} from '../types/store/plugins';

const getCurrentProduct = (
    products: ProductComponent[],
    pathname: string,
): ProductComponent | null => {
    return products?.find(({baseURL}) => matchPath(pathname, {path: baseURL, exact: false, strict: false})) ?? null;
};

export function selectCurrentProduct(state: GlobalState, pathname: string): ProductComponent | null {
    return getCurrentProduct(selectProducts(state), pathname);
}

export function selectCurrentProductId(state: GlobalState, pathname: string): ProductIdentifier {
    return selectCurrentProduct(state, pathname)?.id ?? null;
}

export const selectProducts = (state: GlobalState) => state.plugins.components.Product;
