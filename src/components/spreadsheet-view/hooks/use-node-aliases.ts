/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../../redux/reducer';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases as _updateNodeAlias } from '../../../services/study/node-alias';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from '../types/node-alias.type';
import { updateNodeAliases as updateNodeAliasesInStore } from 'redux/actions';

// NodeAlias may have invalid id/name, in error cases
export const validAlias = (alias: NodeAlias) => alias.id != null && alias.name != null;

export type ResetNodeAliasCallback = (appendMode: boolean, aliases?: string[]) => void;

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const nodeAliases = useSelector((state: AppState) => state.nodeAliases);
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    const fetchNodeAliases = useCallback(() => {
        if (studyUuid) {
            getNodeAliases(studyUuid)
                .then((_nodeAliases) => dispatch(updateNodeAliasesInStore(_nodeAliases)))
                .catch((error) => {
                    dispatch(updateNodeAliasesInStore([]));
                    snackWithFallback(snackError, error, { headerId: 'nodeAliasesRetrievingError' });
                });
        } else {
            dispatch(updateNodeAliasesInStore([]));
        }
    }, [dispatch, snackError, studyUuid]);

    const updateNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (studyUuid) {
                _updateNodeAlias(studyUuid, newNodeAliases).catch((error) =>
                    snackWithFallback(snackError, error, { headerId: 'nodeAliasesUpdateError' })
                );
            }
        },
        [snackError, studyUuid]
    );

    const resetNodeAliases: ResetNodeAliasCallback = useCallback(
        (appendMode: boolean, aliases?: string[]) => {
            let newNodeAliases: NodeAlias[] = [];
            if (appendMode && nodeAliases?.length) {
                // Append mode: keep existing study aliases, but import+reset the appended ones
                newNodeAliases = nodeAliases;
                if (aliases?.length) {
                    const currentAliases = nodeAliases.map((n) => n.alias);
                    // we add imported aliases and set them undefined, only if an alias is not already defined in the study
                    const appendedNodeAliases = aliases
                        .filter((alias) => !currentAliases?.includes(alias))
                        .map((alias) => {
                            let nodeAlias: NodeAlias = { id: undefined, name: undefined, alias: alias };
                            return nodeAlias;
                        });
                    newNodeAliases = newNodeAliases.concat(appendedNodeAliases);
                }
            } else if (aliases?.length) {
                // Replace mode: we reset alias list with incoming one, keeping only the 'alias' prop
                newNodeAliases = aliases.map((alias) => {
                    let nodeAlias: NodeAlias = { id: undefined, name: undefined, alias: alias };
                    return nodeAlias;
                });
            }
            updateNodeAliases(newNodeAliases);
        },
        [nodeAliases, updateNodeAliases]
    );

    return { nodeAliases, fetchNodeAliases, updateNodeAliases, resetNodeAliases };
};
