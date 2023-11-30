/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';
import { ComputingType } from '../components/computing-status/computing-type';
import { useEffect } from 'react';
import { isNodeBuilt } from '../components/graph/util/model-functions';
import { RunningStatus } from '../components/utils/running-status';
import {
    addAllBusesShortCircuitNotif,
    addDynamicSimulationNotif,
    addLoadflowNotif,
    addNonEvacuatedEnergyNotif,
    addOneBusShortCircuitNotif,
    addSANotif,
    addSensiNotif,
    addVoltageInitNotif,
    resetAllBusesShortCircuitNotif,
    resetDynamicSimulationNotif,
    resetLoadflowNotif,
    resetNonEvacuatedEnergyNotif,
    resetOneBusShortCircuitNotif,
    resetSANotif,
    resetSensiNotif,
    resetVoltageInitNotif,
} from '../redux/actions';

export const useComputationNotification = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: ReduxState) => state.user);

    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const nonEvacuatedEnergyAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const oneBusallBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const allBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );

    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const voltageInitStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.VOLTAGE_INIT]
    );

    useEffect(() => {
        isNodeBuilt(currentNode) &&
        (loadFlowStatus === RunningStatus.SUCCEED ||
            loadFlowStatus === RunningStatus.FAILED)
            ? dispatch(addLoadflowNotif())
            : dispatch(resetLoadflowNotif());

        isNodeBuilt(currentNode) &&
        (securityAnalysisStatus === RunningStatus.SUCCEED ||
            securityAnalysisStatus === RunningStatus.FAILED)
            ? dispatch(addSANotif())
            : dispatch(resetSANotif());

        isNodeBuilt(currentNode) &&
        sensitivityAnalysisStatus === RunningStatus.SUCCEED
            ? dispatch(addSensiNotif())
            : dispatch(resetSensiNotif());

        isNodeBuilt(currentNode) &&
        (nonEvacuatedEnergyAnalysisStatus === RunningStatus.SUCCEED ||
            nonEvacuatedEnergyAnalysisStatus === RunningStatus.FAILED)
            ? dispatch(addNonEvacuatedEnergyNotif())
            : dispatch(resetNonEvacuatedEnergyNotif());

        isNodeBuilt(currentNode) &&
        allBusesShortCircuitStatus === RunningStatus.SUCCEED
            ? dispatch(addAllBusesShortCircuitNotif())
            : dispatch(resetAllBusesShortCircuitNotif());

        isNodeBuilt(currentNode) &&
        oneBusallBusesShortCircuitStatus === RunningStatus.SUCCEED
            ? dispatch(addOneBusShortCircuitNotif())
            : dispatch(resetOneBusShortCircuitNotif());

        isNodeBuilt(currentNode) &&
        (dynamicSimulationStatus === RunningStatus.SUCCEED ||
            dynamicSimulationStatus === RunningStatus.FAILED)
            ? dispatch(addDynamicSimulationNotif())
            : dispatch(resetDynamicSimulationNotif());

        isNodeBuilt(currentNode) &&
        (voltageInitStatus === RunningStatus.SUCCEED ||
            voltageInitStatus === RunningStatus.FAILED)
            ? dispatch(addVoltageInitNotif())
            : dispatch(resetVoltageInitNotif());
    }, [
        currentNode,
        dispatch,
        loadFlowStatus,
        user,
        securityAnalysisStatus,
        sensitivityAnalysisStatus,
        nonEvacuatedEnergyAnalysisStatus,
        allBusesShortCircuitStatus,
        oneBusallBusesShortCircuitStatus,
        dynamicSimulationStatus,
        voltageInitStatus,
    ]);
};
