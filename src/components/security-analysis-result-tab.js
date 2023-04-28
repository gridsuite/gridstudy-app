/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import {
    fetchLineOrTransformer,
    fetchSecurityAnalysisResult,
    fetchVoltageLevel,
} from '../utils/rest-api';
import WaitingLoader from './utils/waiting-loader';
import SecurityAnalysisResult from './security-analysis-result';

const securityAnalysisResultInvalidations = ['securityAnalysisResult'];

export const SecurityAnalysisResultTab = ({
    studyUuid,
    nodeUuid,
    openVoltageLevelDiagram,
}) => {
    const [securityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResult,
        securityAnalysisResultInvalidations
    );

    function onClickNmKConstraint(row, column) {
        if (studyUuid && nodeUuid) {
            if (column.dataKey === 'subjectId') {
                let vlId;
                let substationId;
                // TODO ideally we would have the type of the equipment but we don't, that's why we do these calls
                fetchLineOrTransformer(studyUuid, nodeUuid, row.subjectId)
                    .then((equipment) => {
                        if (row.side) {
                            if (row.side === 'ONE') {
                                vlId = equipment.voltageLevel1.id;
                                substationId =
                                    equipment.voltageLevel1.substationId;
                            } else if (row.side === 'TWO') {
                                vlId = equipment.voltageLevel2.id;
                                substationId =
                                    equipment.voltageLevel2.substationId;
                            } else {
                                vlId = equipment.voltageLevel3.id;
                                substationId =
                                    equipment.voltageLevel3.substationId;
                            }
                        } else {
                            vlId = equipment.voltageLevel1.id;
                            substationId = equipment.voltageLevel1.substationId;
                        }
                    })
                    // if we didnt find a line or transformer, it's a voltage level
                    .catch(() => {
                        return fetchVoltageLevel(
                            studyUuid,
                            nodeUuid,
                            row.subjectId
                        ).then((vl) => {
                            vlId = vl.id;
                            substationId = vl.substationId;
                        });
                    })
                    .finally(() => {
                        if (!vlId) {
                            console.error(
                                "Impossible to open the SLD for equipment ID '" +
                                    row.subjectId +
                                    "'"
                            );
                        } else {
                            openVoltageLevelDiagram(vlId, substationId);
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
