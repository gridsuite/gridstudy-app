/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AppState } from '../../../redux/reducer';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases } from '../../../services/study/node-alias';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from './node-alias.type';
import { updateCustomColumnsNodesAliases } from '../../../redux/actions';
import { AppDispatch } from '../../../redux/store';

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [nodeAliases, _setNodeAliases] = useState<NodeAlias[]>([]);

    const { snackError } = useSnackMessage();
    const dispatch = useDispatch<AppDispatch>();

    console.log(nodeAliases);
    useEffect(() => {
        if (currentNode?.id) {
            getNodeAliases(studyUuid, currentNode?.id)
                .then((_nodeAliases) => _setNodeAliases(_nodeAliases))
                .catch((error) => {
                    _setNodeAliases([]);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'nodeAliasesRetrievingError',
                    });
                });
        }
    }, [currentNode?.id, snackError, studyUuid]);

    const setNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (currentNode?.id) {
                updateNodeAliases(studyUuid, currentNode?.id, newNodeAliases)
                    .then((r) => {
                        _setNodeAliases(newNodeAliases);
                        dispatch(updateCustomColumnsNodesAliases(newNodeAliases));
                    })
                    .catch((error) =>
                        snackError({
                            messageTxt: error.message,
                            headerId: 'nodeAliasesUpdateError',
                        })
                    );
            }
        },
        [currentNode?.id, dispatch, snackError, studyUuid]
    );

    return { nodeAliases, setNodeAliases };
};
