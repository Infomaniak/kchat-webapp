// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import plugins from './plugins';
import ksuite_bridge from './plugins/ksuite_bridge';
import storage from './storage';
import views from './views';

export default {
    views,
    plugins,
    storage,
    ksuite_bridge,
};
