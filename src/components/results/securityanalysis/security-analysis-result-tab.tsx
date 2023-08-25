/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import {
    NmKConstraintRow,
    SecurityAnalysisTabProps,
} from './security-analysis.type';
import { useNodeData } from '../../study-container';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import WaitingLoader from '../../utils/waiting-loader';
import { SecurityAnalysisResult } from './security-analysis-result';
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { fetchLineOrTransformer } from '../../../services/study/network-map';

export const SecurityAnalysisResultTab: FunctionComponent<
    SecurityAnalysisTabProps
> = ({ studyUuid, nodeUuid, openVoltageLevelDiagram }) => {
    const securityAnalysisResultInvalidations = ['securityAnalysisResult'];
    const { snackError } = useSnackMessage();

    const [securityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResult,
        securityAnalysisResultInvalidations
    );

    function onClickNmKConstraint(row: NmKConstraintRow, column?: ColDef) {
        if (studyUuid && nodeUuid) {
            if (column?.field === 'subjectId') {
                let vlId: string;
                // ideally we would have the type of the network element but we don't
                fetchLineOrTransformer(studyUuid, nodeUuid, row.subjectId)
                    .then((equipment) => {
                        if (!equipment) {
                            // if we didnt find a line or transformer, it's a voltage level
                            vlId = row.subjectId;
                        } else if (row.side) {
                            if (row.side === 'ONE') {
                                vlId = equipment.voltageLevelId1;
                            } else if (row.side === 'TWO') {
                                vlId = equipment.voltageLevelId2;
                            } else {
                                vlId = equipment.voltageLevelId3;
                            }
                        } else {
                            vlId = equipment.voltageLevelId1;
                        }
                    })
                    .finally(() => {
                        if (!vlId) {
                            console.error(
                                "Impossible to open the SLD for equipment ID '" +
                                    row.subjectId +
                                    "'"
                            );
                            snackError({
                                messageId: 'NetworkElementNotFound',
                                messageValues: { elementId: row.subjectId },
                            });
                        } else {
                            openVoltageLevelDiagram(vlId);
                        }
                    });
            }
        }
    }
    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <SecurityAnalysisResult
                result={securityAnalysisResult}
                onClickNmKConstraint={onClickNmKConstraint}
            />
        </WaitingLoader>
    );
};
