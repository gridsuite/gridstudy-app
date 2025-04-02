/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AppState } from '../../../redux/reducer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases as _updateNodeAlias } from '../../../services/study/node-alias';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from './node-alias.type';
import { UUID } from 'crypto';
import { nodeAliasesToUpdate } from 'redux/actions';

// NodeAlias may have invalid id/name, in error cases
export const validAlias = (alias: NodeAlias) => alias.id != null && alias.name != null;

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const changedNodeUuids = useSelector((state: AppState) => state.nodeAliasesToUpdate);
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    // init value is undefined until we have successfully made a fetch
    const [nodeAliases, setNodeAliases] = useState<NodeAlias[]>();

    const someAliasToRefresh = useMemo(() => {
        function intersect(arr1: UUID[], arr2: UUID[]) {
            const set = new Set(arr1);
            return arr2.some((id) => set.has(id));
        }
        if (changedNodeUuids.length === 0) {
            return false;
        }
        const currentAliasesUuids = nodeAliases?.map((n) => n.id).filter((id) => !!id);
        return currentAliasesUuids && intersect(changedNodeUuids, currentAliasesUuids);
    }, [changedNodeUuids, nodeAliases]);

    const fetchNodeAliases = useCallback(() => {
        if (studyUuid) {
            getNodeAliases(studyUuid)
                .then((_nodeAliases) => setNodeAliases(_nodeAliases))
                .catch((error) => {
                    setNodeAliases(undefined);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'nodeAliasesRetrievingError',
                    });
                });
        } else {
            setNodeAliases(undefined);
        }
    }, [snackError, studyUuid]);

    useEffect(() => {
        // initial state
        fetchNodeAliases();
    }, [fetchNodeAliases]);

    useEffect(() => {
        if (someAliasToRefresh) {
            // update state on node deletion/rename, if they are aliased
            fetchNodeAliases();
            dispatch(nodeAliasesToUpdate([]));
        }
    }, [dispatch, fetchNodeAliases, someAliasToRefresh]);

    const updateNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (studyUuid) {
                _updateNodeAlias(studyUuid, newNodeAliases)
                    .then((_r) => setNodeAliases(newNodeAliases))
                    .catch((error) =>
                        snackError({
                            messageTxt: error.message,
                            headerId: 'nodeAliasesUpdateError',
                        })
                    );
            }
        },
        [snackError, studyUuid]
    );

    const resetNodeAliases = useCallback(
        (aliases: string[] | undefined) => {
            let newNodeAliases: NodeAlias[] = [];
            if (aliases) {
                newNodeAliases = aliases.map((alias) => {
                    let nodeAlias: NodeAlias = { id: undefined, name: undefined, alias: alias };
                    return nodeAlias;
                });
            }
            updateNodeAliases(newNodeAliases);
        },
        [updateNodeAliases]
    );

    return { nodeAliases, updateNodeAliases, resetNodeAliases };
};
