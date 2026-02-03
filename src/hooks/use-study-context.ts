/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo } from 'react';
import { StudyContext } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { PARAM_USE_NAME } from '../utils/config-params';

export function useStudyContext() {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const useName = useSelector((state: AppState) => state[PARAM_USE_NAME]);

    const studyContext: StudyContext | undefined = useMemo(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            return {
                studyId: studyUuid,
                nodeId: currentNode.id,
                rootNetworkId: currentRootNetworkUuid,
                useNameParam: useName,
            };
        }
    }, [currentNode?.id, currentRootNetworkUuid, studyUuid, useName]);

    return studyContext;
}
