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
import { deletedOrRenamedNodes } from 'redux/actions';

// NodeAlias may have invalid id/name, in error cases
export const validAlias = (alias: NodeAlias) => alias.id != null && alias.name != null;

export type ResetNodeAliasCallback = (appendMode: boolean, aliases?: string[]) => void;

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const changedNodeUuids = useSelector((state: AppState) => state.deletedOrRenamedNodes);
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
            dispatch(deletedOrRenamedNodes([]));
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

    const resetNodeAliases: ResetNodeAliasCallback = useCallback(
        (appendMode: boolean, aliases?: string[]) => {
            console.log('ResetNodeAliasCallback', appendMode, aliases);
            let newNodeAliases: NodeAlias[] = [];
            if (appendMode && nodeAliases?.length) {
                console.log('ResetNodeAliasCallback cas 1');
                // Append mode: keep existing aliases, but reset the imported/appended ones
                newNodeAliases = nodeAliases;
                if (aliases?.length) {
                    const currentAliasNames = nodeAliases.map((n) => n.alias);
                    console.log(
                        'ResetNodeAliasCallback cas 1 test',
                        currentAliasNames,
                        aliases.filter((alias) => !currentAliasNames?.includes(alias))
                    );
                    // we add imported alias and set them undefined, only if the alias is not already used
                    const appendedNodeAliases = aliases
                        .filter((alias) => !currentAliasNames?.includes(alias))
                        .map((alias) => {
                            let nodeAlias: NodeAlias = { id: undefined, name: undefined, alias: alias };
                            return nodeAlias;
                        });
                    console.log('ResetNodeAliasCallback cas 1 append', appendedNodeAliases, newNodeAliases);
                    newNodeAliases = newNodeAliases.concat(appendedNodeAliases);
                }
            } else if (aliases?.length) {
                console.log('ResetNodeAliasCallback cas 2');
                // Replace mode: we reset alias list with incoming one, keeping only the 'alias' prop
                newNodeAliases = aliases.map((alias) => {
                    let nodeAlias: NodeAlias = { id: undefined, name: undefined, alias: alias };
                    return nodeAlias;
                });
            }
            console.log('ResetNodeAliasCallback RES=', newNodeAliases);
            updateNodeAliases(newNodeAliases);
        },
        [nodeAliases, updateNodeAliases]
    );

    return { nodeAliases, updateNodeAliases, resetNodeAliases };
};
