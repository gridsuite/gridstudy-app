/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AppState } from '../../../redux/reducer';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases } from '../../../services/study/node-alias';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from './node-alias.type';
import { updateCustomColumnsNodesAliases } from '../../../redux/actions';
import { AppDispatch } from '../../../redux/store';

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const nodeAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);

    const { snackError } = useSnackMessage();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (currentNode?.id) {
            getNodeAliases(studyUuid, currentNode?.id)
                .then((_nodeAliases) => dispatch(updateCustomColumnsNodesAliases(_nodeAliases)))
                .catch((error) => {
                    dispatch(updateCustomColumnsNodesAliases([]));
                    snackError({
                        messageTxt: error.message,
                        headerId: 'nodeAliasesRetrievingError',
                    });
                });
        }
    }, [currentNode?.id, dispatch, snackError, studyUuid]);

    const setNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (currentNode?.id) {
                updateNodeAliases(studyUuid, currentNode?.id, newNodeAliases)
                    .then((r) => dispatch(updateCustomColumnsNodesAliases(newNodeAliases)))
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
