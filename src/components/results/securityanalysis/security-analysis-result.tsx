/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { SecurityAnalysisResultProps } from './security-analysis.type';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage } from 'react-intl';

import { SecurityAnalysisTableN } from './security-analysis-result-tableN';
import { SecurityAnalysisResultTableNmK } from './security-analysis-result-tableNmK';
import { NMK_TYPE_RESULT } from './security-analysis-result-utils';
import { Box } from '@mui/system';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { ComputingType } from '../../computing-status/computing-type';
import { LinearProgress } from '@mui/material';

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
};

export const SecurityAnalysisResult: FunctionComponent<
    SecurityAnalysisResultProps
> = ({ result, onClickNmKConstraint, isWaiting }) => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const [nmkTypeResult, setNmkTypeResult] = React.useState(
        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
    );

    const switchNmkTypeResult = () => {
        setNmkTypeResult(
            nmkTypeResult === NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const openLoader = useOpenLoaderShortWait({
        isLoading:
            securityAnalysisStatus === RunningStatus.RUNNING || isWaiting,
        delay: RESULTS_LOADING_DELAY,
    });

    return (
        <>
            <Box sx={styles.container}>
                <Box sx={styles.tabs}>
                    <Tabs
                        value={tabIndex}
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
                    >
                        <Tab label="N" />
                        <Tab label="N-K" />
                    </Tabs>
                </Box>
                {tabIndex === 1 && (
                    <Box sx={styles.nmkResultSelect}>
                        <Select
                            labelId="nmk-type-result-label"
                            value={nmkTypeResult}
                            onChange={switchNmkTypeResult}
                            autoWidth={true}
                            size="small"
                        >
                            <MenuItem
                                value={
                                    NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                                }
                            >
                                <FormattedMessage id="ConstraintsFromContingencies" />
                            </MenuItem>
                            <MenuItem
                                value={
                                    NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                                }
                            >
                                <FormattedMessage id="ContingenciesFromConstraints" />
                            </MenuItem>
                        </Select>
                    </Box>
                )}
            </Box>
            <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
            <div style={{ flexGrow: 1 }}>
                {tabIndex === 0 && (
                    <SecurityAnalysisTableN
                        limitViolationsResult={
                            result?.preContingencyResult?.limitViolationsResult
                        }
                        isWaiting={isWaiting}
                    />
                )}
                {tabIndex === 1 &&
                    nmkTypeResult ===
                        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES && (
                        <SecurityAnalysisResultTableNmK
                            postContingencyResults={
                                result?.postContingencyResults
                            }
                            onClickNmKConstraint={onClickNmKConstraint}
                            nmkTypeResult={
                                NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                            }
                            isWaiting={isWaiting}
                        />
                    )}

                {tabIndex === 1 &&
                    nmkTypeResult ===
                        NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS && (
                        <SecurityAnalysisResultTableNmK
                            postContingencyResults={
                                result?.postContingencyResults
                            }
                            onClickNmKConstraint={onClickNmKConstraint}
                            nmkTypeResult={
                                NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                            }
                            isWaiting={isWaiting}
                        />
                    )}
            </div>
        </>
    );
};
