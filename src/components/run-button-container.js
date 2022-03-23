import RunButton from './run-button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import ContingencyListSelector from './dialogs/contingency-list-selector';
import { makeStyles } from '@material-ui/core/styles';
import { addLoadflowNotif, addSANotif } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    rotate: {
        animation: 'spin 1000ms infinite',
    },
}));

export function RunButtonContainer({
    studyUuid,
    workingNode,
    loadFlowStatus,
    securityAnalysisStatus,
    setIsComputationRunning,
    runnable,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);
    const [computationStopped, setComputationStopped] = useState(false);

    const [ranLoadflow, setRanLoadflow] = useState(false);

    const [ranSA, setRanSA] = useState(false);

    const intl = useIntl();

    const classes = useStyles();

    const dispatch = useDispatch();

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
        }
    }, [dispatch, studyUpdatedForce, ranSA, ranLoadflow]);

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (action) => {
            if (action === runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyUuid, workingNode?.id);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(studyUuid, workingNode?.id, contingencyListNames);
    };

    const startComputation = (action) => {
        if (action === runnable.LOADFLOW) {
            startLoadFlow(studyUuid, workingNode?.id);
            setRanLoadflow(true);
        } else if (action === runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        }
    };

    const getRunningStatus = useCallback(
        (runnableType) => {
            if (runnableType === runnable.LOADFLOW) {
                return loadFlowStatus;
            } else if (runnableType === runnable.SECURITY_ANALYSIS) {
                return securityAnalysisStatus;
            }
        },
        [loadFlowStatus, securityAnalysisStatus, runnable]
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

    const RUNNABLES = useMemo(
        () => [runnable.LOADFLOW, runnable.SECURITY_ANALYSIS],
        [runnable]
    );

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
                disabled={workingNode?.readOnly}
            />
            <ContingencyListSelector
                open={showContingencyListSelector}
                onClose={() => setShowContingencyListSelector(false)}
                onStart={handleStartSecurityAnalysis}
                selectedNodeUuid={workingNode?.id}
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
    workingNode: PropTypes.object,
    status: PropTypes.func,
    onStartClick: PropTypes.func,
    text: PropTypes.func,
    startIcon: PropTypes.func,
    computationStopped: PropTypes.bool,
};
