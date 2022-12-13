/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RootNode from '../nodes/root-node';
import NetworkModificationNode from '../nodes/network-modification-node';

export const nodeTypes = {
    ROOT: RootNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
};

export const nodeWidth = 180;
export const nodeHeight = 60;
export const rootNodeWidth = 40;
export const rootNodeHeight = 40;
