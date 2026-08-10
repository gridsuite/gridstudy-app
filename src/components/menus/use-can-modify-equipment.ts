/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { isNodeBuilt, isNodeReadOnly } from 'components/graph/util/model-functions';
import { useCanEditNode } from 'components/utils/use-node-activity';
import { AppState } from 'redux/reducer.type';

export function useCanModifyEquipment(): boolean {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const canEditNode = useCanEditNode(currentNode?.id);
    return !!isNodeBuilt(currentNode) && !isNodeReadOnly(currentNode) && canEditNode;
}
