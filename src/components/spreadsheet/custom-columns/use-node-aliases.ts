/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AppState } from '../../../redux/reducer';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases } from '../../../services/study/node-alias';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from './node-alias.type';

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [nodeAliases, _setNodeAliases] = useState<NodeAlias[]>([]);

    const { snackError } = useSnackMessage();

    useEffect(() => {
        if (!!studyUuid && !!currentNode?.id) {
            getNodeAliases(studyUuid, currentNode.id)
                .then((_nodeAliases) => _setNodeAliases(_nodeAliases))
                .catch((error) => {
                    _setNodeAliases([]);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'nodeAliasesRetrievingError',
                    });
                });
        } else {
            _setNodeAliases([]);
        }
    }, [currentNode?.id, snackError, studyUuid]);

    const setNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (!!studyUuid && !!currentNode?.id) {
                updateNodeAliases(studyUuid, currentNode.id, newNodeAliases)
                    .then((r) => _setNodeAliases(newNodeAliases))
                    .catch((error) =>
                        snackError({
                            messageTxt: error.message,
                            headerId: 'nodeAliasesUpdateError',
                        })
                    );
            }
        },
        [currentNode?.id, snackError, studyUuid]
    );

    return { nodeAliases, setNodeAliases };
};
