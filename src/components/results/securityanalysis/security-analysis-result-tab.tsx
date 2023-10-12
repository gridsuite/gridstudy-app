/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    SyntheticEvent,
    FunctionComponent,
    useEffect,
    useState,
} from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ReduxState } from '../../../redux/reducer.type';
import { Box } from '@mui/system';
import { Tabs, Tab, Select, MenuItem, LinearProgress } from '@mui/material';
import { NMK_TYPE, RESULT_TYPE } from './security-analysis-content';
import { fetchSecurityAnalysisResult } from '../../../services/study/security-analysis';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputingType } from '../../computing-status/computing-type';
import { SecurityAnalysisResultN } from './security-analysis-result-n';
import { SecurityAnalysisResultNmk } from './security-analysis-result-nmk';
import {
    SecurityAnalysisResultType,
    SecurityAnalysisTabProps,
} from './security-analysis.type';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    nmkResultSelect: {
        position: 'absolute',
        right: '16px',
    },
    loader: {
        height: '4px',
    },
    resultContainer: {
        flexGrow: 1,
    },
};

export const SecurityAnalysisResultTab: FunctionComponent<
    SecurityAnalysisTabProps
> = ({ studyUuid, nodeUuid, openVoltageLevelDiagram }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [nmkType, setNmkType] = useState(
        NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
    );
    const [result, setResult] = useState<SecurityAnalysisResultType>(null);
    const [isLoadingResult, setIsLoadingResult] = useState(false);

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const handleChangeNmkType = () => {
        setResult(null);
        setNmkType(
            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    const handleTabChange = (event: SyntheticEvent, newTabIndex: number) => {
        setResult(null);
        setTabIndex(newTabIndex);
    };

    useEffect(() => {
        setIsLoadingResult(true);

        const resultType =
            tabIndex === 0
                ? RESULT_TYPE.N
                : nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                ? RESULT_TYPE.NMK_CONTINGENCIES
                : RESULT_TYPE.NMK_CONSTRAINTS;

        fetchSecurityAnalysisResult(studyUuid, nodeUuid, resultType)
            .then(setResult)
            .catch((error) => console.error(error))
            .finally(() => setIsLoadingResult(false));
    }, [tabIndex, nmkType, nodeUuid, studyUuid]);

    const shouldOpenLoader = useOpenLoaderShortWait({
        isLoading:
            securityAnalysisStatus === RunningStatus.RUNNING || isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

    return (
        <>
            <Box sx={styles.container}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="N" />
                        <Tab label="N-K" />
                    </Tabs>
                </Box>
                {tabIndex === 1 && (
                    <Box sx={styles.nmkResultSelect}>
                        <Select
                            labelId="nmk-type-label"
                            value={nmkType}
                            onChange={handleChangeNmkType}
                            autoWidth={true}
                            size="small"
                        >
                            <MenuItem
                                value={NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES}
                            >
                                <FormattedMessage id="ConstraintsFromContingencies" />
                            </MenuItem>
                            <MenuItem
                                value={NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS}
                            >
                                <FormattedMessage id="ContingenciesFromConstraints" />
                            </MenuItem>
                        </Select>
                    </Box>
                )}
            </Box>
            <Box sx={styles.loader}>
                {shouldOpenLoader && <LinearProgress />}
            </Box>
            <Box sx={styles.resultContainer}>
                {tabIndex === 0 ? (
                    <SecurityAnalysisResultN
                        result={result}
                        isLoadingResult={isLoadingResult}
                    />
                ) : (
                    <SecurityAnalysisResultNmk
                        result={result}
                        isLoadingResult={isLoadingResult}
                        isFromContingency={
                            nmkType === NMK_TYPE.CONSTRAINTS_FROM_CONTINGENCIES
                        }
                        openVoltageLevelDiagram={openVoltageLevelDiagram}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                    />
                )}
            </Box>
        </>
    );
};
