/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import SensiParametersSelector from './dialogs/sensi/sensi-parameters-selector';
import RunButton from './run-button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    startLoadFlow,
    startSecurityAnalysis,
    startSensitivityAnalysis,
    startShortCircuitAnalysis,
    startDynamicSimulation,
    stopSecurityAnalysis,
    stopSensitivityAnalysis,
    stopShortCircuitAnalysis,
    stopDynamicSimulation,
} from '../utils/rest-api';
import { RunningStatus } from './util/running-status';
import LoopIcon from '@mui/icons-material/Loop';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayIcon from '@mui/icons-material/PlayArrow';
import ContingencyListSelector from './dialogs/contingency-list-selector';
import makeStyles from '@mui/styles/makeStyles';
import {
    addLoadflowNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addDynamicSimulationNotif,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from './dialogs/parameters/parameters';
import DynamicSimulationParametersSelector, {
    checkDynamicSimulationParameters,
} from './dialogs/dynamicsimulation/dynamic-simulation-parameters-selector';

const useStyles = makeStyles((theme) => ({
    rotate: {
        animation: 'spin 1000ms infinite',
    },
}));

export function RunButtonContainer({
    studyUuid,
    currentNode,
    loadFlowStatus,
    securityAnalysisStatus,
    sensiStatus,
    shortCircuitStatus,
    dynamicSimulationStatus,
    setIsComputationRunning,
    runnable,
    disabled,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);

    const [showSensiParametersSelector, setShowSensiParametersSelector] =
        useState(false);

    const [
        showDynamicSimulationParametersSelector,
        setShowDynamicSimulationParametersSelector,
    ] = useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const [ranLoadflow, setRanLoadflow] = useState(false);

    const [ranSA, setRanSA] = useState(false);

    const [ranSensi, setRanSensi] = useState(false);

    const [ranShortCircuit, setRanShortCircuit] = useState(false);

    const [ranDynamicSimulation, setRanDynamicSimulation] = useState(false);

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const classes = useStyles();

    const dispatch = useDispatch();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );
    useEffect(() => {
        if (
            ranLoadflow &&
            studyUpdatedForce?.eventData?.headers?.updateType === 'loadflow'
        ) {
            dispatch(addLoadflowNotif());
        } else if (
            ranSA &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'securityAnalysisResult'
        ) {
            dispatch(addSANotif());
        } else if (
            ranSensi &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'sensitivityAnalysisResult'
        ) {
            dispatch(addSensiNotif());
        } else if (
            ranShortCircuit &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'shortCircuitAnalysisResult'
        ) {
            dispatch(addShortCircuitNotif());
        } else if (
            ranDynamicSimulation &&
            studyUpdatedForce?.eventData?.headers?.updateType ===
                'dynamicSimulationResult'
        ) {
            dispatch(addDynamicSimulationNotif());
        }
    }, [
        dispatch,
        studyUpdatedForce,
        ranSA,
        ranLoadflow,
        ranSensi,
        ranShortCircuit,
        ranDynamicSimulation,
    ]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            if (action === runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SENSITIVITY_ANALYSIS) {
                stopSensitivityAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.SHORT_CIRCUIT_ANALYSIS) {
                stopShortCircuitAnalysis(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            } else if (action === runnable.DYNAMIC_SIMULATION) {
                stopDynamicSimulation(studyUuid, currentNode?.id);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(studyUuid, currentNode?.id, contingencyListNames);
    };

    const handleStartSensi = (sensiConfiguration) => {
        // close the contingency list selection window
        setShowSensiParametersSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSensitivityAnalysis(
            studyUuid,
            currentNode?.id,
            sensiConfiguration
        );
    };

    const handleStartDynamicSimulation = ({
        mappingName,
        dynamicSimulationConfiguration,
    }) => {
        // close the dialog
        setShowDynamicSimulationParametersSelector(false);

        setComputationStopped(false);

        // start server side dynamic simulation
        startDynamicSimulation(
            studyUuid,
            currentNode?.id,
            mappingName,
            dynamicSimulationConfiguration
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'DynamicSimulationRunError',
            });
        });
    };

    const startComputation = (action) => {
        if (action === runnable.LOADFLOW) {
            startLoadFlow(studyUuid, currentNode?.id)
                .then(setRanLoadflow(true))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startLoadFlowError',
                    });
                });
        } else if (action === runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        } else if (action === runnable.SENSITIVITY_ANALYSIS) {
            setShowSensiParametersSelector(true);
            setRanSensi(true);
        } else if (action === runnable.SHORT_CIRCUIT_ANALYSIS) {
            startShortCircuitAnalysis(studyUuid, currentNode?.id)
                .then(setRanShortCircuit(true))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                });
        } else if (action === runnable.DYNAMIC_SIMULATION) {
            checkDynamicSimulationParameters(studyUuid)
                .then((isValid) => {
                    if (!isValid) {
                        // open parameters selector to configure mandatory params
                        setShowDynamicSimulationParametersSelector(true);
                        setRanDynamicSimulation(true);
                    } else {
                        // start server side dynamic simulation directly
                        startDynamicSimulation(
                            studyUuid,
                            currentNode?.id
                        ).catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'DynamicSimulationRunError',
                            });
                        });
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationRunError',
                    });
                });
        }
    };

    const getRunningStatus = useCallback(
        (runnableType) => {
            if (runnableType === runnable.LOADFLOW) {
                return loadFlowStatus;
            } else if (runnableType === runnable.SECURITY_ANALYSIS) {
                return securityAnalysisStatus;
            } else if (runnableType === runnable.SENSITIVITY_ANALYSIS) {
                return sensiStatus;
            } else if (runnableType === runnable.SHORT_CIRCUIT_ANALYSIS) {
                return shortCircuitStatus;
            } else if (runnableType === runnable.DYNAMIC_SIMULATION) {
                return dynamicSimulationStatus;
            }
        },
        [
            loadFlowStatus,
            securityAnalysisStatus,
            sensiStatus,
            shortCircuitStatus,
            dynamicSimulationStatus,
            runnable,
        ]
    );

    const getRunningText = (runnableName, runnableStatus) => {
        return runnableName;
    };

    const getRunningIcon = (status) => {
        switch (status) {
            case RunningStatus.RUNNING:
                return <LoopIcon className={classes.rotate} />;
            case RunningStatus.SUCCEED:
                return <DoneIcon />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const RUNNABLES = useMemo(() => {
        let runnables = [runnable.LOADFLOW, runnable.SECURITY_ANALYSIS];
        if (enableDeveloperMode) {
            // SHORTCIRCUIT is currently a dev feature
            runnables.push(runnable.SHORT_CIRCUIT_ANALYSIS);
            // SENSI is currently a dev feature
            runnables.push(runnable.SENSITIVITY_ANALYSIS);
            // DYNAMICSIMULATION is currently a dev feature
            runnables.push(runnable.DYNAMIC_SIMULATION);
        }
        return runnables;
    }, [runnable, enableDeveloperMode]);

    useEffect(() => {
        setIsComputationRunning(
            RUNNABLES.some(function (runnable) {
                return getRunningStatus(runnable) === RunningStatus.RUNNING;
            })
        );
    }, [setIsComputationRunning, getRunningStatus, RUNNABLES]);

    return (
        <>
            <RunButton
                runnables={RUNNABLES}
                actionOnRunnable={ACTION_ON_RUNNABLES}
                getStatus={getRunningStatus}
                onStartClick={startComputation}
                getText={getRunningText}
                getStartIcon={getRunningIcon}
                computationStopped={computationStopped}
                disabled={isModificationsInProgress || disabled}
            />
            {!disabled && (
                <div>
                    <ContingencyListSelector
                        open={showContingencyListSelector}
                        onClose={() => setShowContingencyListSelector(false)}
                        onStart={handleStartSecurityAnalysis}
                        currentNodeUuid={currentNode?.id}
                    />
                    {showSensiParametersSelector && (
                        <SensiParametersSelector
                            open={showSensiParametersSelector}
                            onClose={() =>
                                setShowSensiParametersSelector(false)
                            }
                            onStart={handleStartSensi}
                            currentNodeUuid={currentNode?.id}
                        />
                    )}
                    {showDynamicSimulationParametersSelector && (
                        <DynamicSimulationParametersSelector
                            open={showDynamicSimulationParametersSelector}
                            onClose={() =>
                                setShowDynamicSimulationParametersSelector(
                                    false
                                )
                            }
                            onStart={handleStartDynamicSimulation}
                            studyUuid={studyUuid}
                            currentNodeUuid={currentNode?.id}
                        />
                    )}
                </div>
            )}
        </>
    );
}

RunButtonContainer.propTypes = {
    runnable: PropTypes.object,
    actionOnRunnable: PropTypes.shape({
        action: PropTypes.func,
        text: PropTypes.string,
    }),
    currentNode: PropTypes.object,
    status: PropTypes.func,
    onStartClick: PropTypes.func,
    text: PropTypes.func,
    startIcon: PropTypes.func,
    computationStopped: PropTypes.bool,
    disabled: PropTypes.bool,
    dynamicSimulationStatus: PropTypes.string,
};
