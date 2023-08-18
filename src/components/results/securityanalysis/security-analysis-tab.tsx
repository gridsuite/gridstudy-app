import { FunctionComponent } from 'react';
import {
    NmKConstraintRow,
    SecurityAnalysisResultProps,
    SecurityAnalysisTabProps,
} from './security-analysis.type';
import { useNodeData } from '../../study-container';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { fetchLineOrTransformer } from '../../../utils/rest-api';
import WaitingLoader from '../../utils/waiting-loader';
import SecurityAnalysisResult from '../../security-analysis-result';
import { SecurityAnalusisResult } from './security-analysis-result';
import { IRowNode } from 'ag-grid-community';
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';

export const SecurityAnalysisTab: FunctionComponent<
    SecurityAnalysisTabProps
> = ({ studyUuid, nodeUuid, openVoltageLevelDiagram }) => {
    const securityAnalysisResultInvalidations = ['securityAnalysisResult'];

    const [securityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSecurityAnalysisResult,
        securityAnalysisResultInvalidations
    );

    function onClickNmKConstraint(row: NmKConstraintRow, column?: ColDef) {
        if (studyUuid && nodeUuid) {
            if (column?.field === 'subjectId') {
                let vlId: any;
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
                            //todo: add snack error
                            /* snackError({
                                messageId: 'NetworkElementNotFound',
                                messageValues: { elementId: row.subjectId },
                            });*/
                        } else {
                            openVoltageLevelDiagram(vlId);
                        }
                    });
            }
        }
    }
    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <SecurityAnalusisResult
                result={securityAnalysisResult}
                onClickNmKConstraint={onClickNmKConstraint}
            />
        </WaitingLoader>
    );
};
