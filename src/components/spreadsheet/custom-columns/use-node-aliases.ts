/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AppState } from '../../../redux/reducer';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getNodeAliases, updateNodeAliases as _updateNodeAlias } from '../../../services/study/node-alias';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeAlias } from './node-alias.type';

export const useNodeAliases = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    // init value is undefined until we have successfully made a fetch
    const [nodeAliases, setNodeAliases] = useState<NodeAlias[]>();

    const { snackError } = useSnackMessage();

    useEffect(() => {
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

    const updateNodeAliases = useCallback(
        (newNodeAliases: NodeAlias[]) => {
            if (studyUuid) {
                _updateNodeAlias(studyUuid, newNodeAliases)
                    .then((r) => setNodeAliases(newNodeAliases))
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

    return { nodeAliases, updateNodeAliases };
};
