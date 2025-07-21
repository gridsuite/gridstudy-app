/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// move here because of cyclic dependency between reducer and network-modification-tree-pane & network-modification-tree
export enum StudyDisplayMode {
    MAP = 'Map',
    TREE = 'Tree',
    HYBRID = 'Hybrid',
    DRAW = 'Draw',
    GRID_LAYOUT = 'GridLayout',
    GRID_LAYOUT_AND_TREE = 'GridLayoutAndTree',
}

export enum CopyType {
    NODE_COPY = 'NODE_COPY',
    NODE_CUT = 'NODE_CUT',
    SUBTREE_COPY = 'SUBTREE_COPY',
    SUBTREE_CUT = 'SUBTREE_CUT',
}
