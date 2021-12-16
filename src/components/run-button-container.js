import RunButton from './run-button';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    startLoadFlow,
    startSecurityAnalysis,
    stopSecurityAnalysis,
} from '../utils/rest-api';
import { RunningStatus } from './util/running-status';
import LoopIcon from '@material-ui/icons/Loop';
import DoneIcon from '@material-ui/icons/Done';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import PlayIcon from '@material-ui/icons/PlayArrow';
import ContingencyListSelector from './contingency-list-selector';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    rotate: {
        animation: 'spin 1000ms infinite',
    },
}));

export function RunButtonContainer({
    studyUuid,
    selectedNodeUuid,
    setSecurityAnalysisResult,
    setRanLoadflow,
    setRanSA,
    loadFlowStatus,
    securityAnalysisStatus,
    setIsComputationRunning,
}) {
    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);
    const [computationStopped, setComputationStopped] = useState(false);

    const intl = useIntl();

    const classes = useStyles();

    const Runnable = {
        LOADFLOW: intl.formatMessage({ id: 'LoadFlow' }),
        SECURITY_ANALYSIS: intl.formatMessage({ id: 'SecurityAnalysis' }),
    };

    const RUNNABLES = [Runnable.LOADFLOW, Runnable.SECURITY_ANALYSIS];

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (runnable) => {
            if (runnable === Runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyUuid, selectedNodeUuid);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(
            studyUuid,
            selectedNodeUuid,
            contingencyListNames
        );

        // clean result
        setSecurityAnalysisResult(null);
    };

    const startComputation = (runnable) => {
        if (runnable === Runnable.LOADFLOW) {
            startLoadFlow(studyUuid, selectedNodeUuid);
            setRanLoadflow(true);
        } else if (runnable === Runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        }
    };

    const getRunningStatus = useCallback(
        (runnable) => {
            if (runnable === Runnable.LOADFLOW) {
                return loadFlowStatus;
            } else if (runnable === Runnable.SECURITY_ANALYSIS) {
                return securityAnalysisStatus;
            }
        },
        [loadFlowStatus, securityAnalysisStatus]
    );

    const getRunningText = (runnable, status) => {
        return runnable;
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

    useEffect(() => {
        setIsComputationRunning(
            RUNNABLES.some(function (runnable) {
                return getRunningStatus(runnable) === RunningStatus.RUNNING;
            })
        );
    }, [setIsComputationRunning, getRunningStatus]);

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
            />
            <ContingencyListSelector
                open={showContingencyListSelector}
                onClose={() => setShowContingencyListSelector(false)}
                onStart={handleStartSecurityAnalysis}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
    );
}
RunButtonContainer.propTypes = {
    runnables: PropTypes.arrayOf(PropTypes.string),
    actionOnRunnable: PropTypes.shape({
        action: PropTypes.func,
        text: PropTypes.string,
    }),
    status: PropTypes.func,
    onStartClick: PropTypes.func,
    text: PropTypes.func,
    startIcon: PropTypes.func,
    computationStopped: PropTypes.bool,
};
