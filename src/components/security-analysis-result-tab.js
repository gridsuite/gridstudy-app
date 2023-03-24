/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import { fetchSecurityAnalysisResult } from '../utils/rest-api';
import WaitingLoader from './util/waiting-loader';
import SecurityAnalysisResult from './security-analysis-result';

const securityAnalysisResultInvalidations = ['securityAnalysisResult'];

export const SecurityAnalysisResultTab = ({
    studyUuid,
    nodeUuid,
    network,
    openVoltageLevelDiagram,
    dormant,
}) => {
    const [securityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResult,
        securityAnalysisResultInvalidations,
        null,
        null,
        dormant
    );

    function onClickNmKConstraint(row, column) {
        if (network) {
            if (column.dataKey === 'subjectId') {
                let vlId;
                let substationId;

                let equipment = network.getLineOrTransformer(row.subjectId);
                if (equipment) {
                    if (row.side) {
                        vlId =
                            row.side === 'ONE'
                                ? equipment.voltageLevelId1
                                : row.side === 'TWO'
                                ? equipment.voltageLevelId2
                                : equipment.voltageLevelId3;
                    } else {
                        vlId = equipment.voltageLevelId1;
                    }
                    const vl = network.getVoltageLevel(vlId);
                    substationId = vl.substationId;
                } else {
                    equipment = network.getVoltageLevel(row.subjectId);
                    if (equipment) {
                        vlId = equipment.id;
                        substationId = equipment.substationId;
                    }
                }
                openVoltageLevelDiagram(vlId, substationId);
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
