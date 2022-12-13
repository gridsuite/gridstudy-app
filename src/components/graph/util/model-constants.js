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

export const nodeWidth = 200;
export const nodeHeight = 50;
export const spaceRootNodeX = 55;
export const spaceRootNodeY = 60;
export const rootNodeWidth = 60;
export const spaceNodeWidth = 180;
export const spaceNodeHeight = 60;
export const rootNodeType = 'ROOT';
