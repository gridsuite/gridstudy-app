import ComputingType from 'components/computing-status/computing-type';
import { IService } from 'components/result-view-tab';
import { ShortCircuitAnalysisResultTabs } from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import {
    ResultsTabsRootLevel,
    ResultTabIndexRedirection,
} from 'components/results/use-results-tab';
import RunningStatus from 'components/utils/running-status';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState, ComputingStatus } from 'redux/reducer.type';

export const useLastLaunchedComputation = (): ComputingType | undefined => {
    const computationStatus: ComputingStatus = useSelector(
        (state: ReduxState) => state.computingStatus
    );
    const [lastRunningComputation, setLastRunningComputation] =
        useState<ComputingType>();
    useEffect(() => {
        const lastLaunchedComputation: ComputingType = Object.keys(
            computationStatus
        ).find(
            (computation) =>
                computationStatus[computation as ComputingType] ===
                RunningStatus.RUNNING
        ) as ComputingType;

        if (lastLaunchedComputation) {
            setLastRunningComputation(lastLaunchedComputation);
        }
    }, [computationStatus]);

    return lastRunningComputation;
};

const getServiceResultTabIndex = (
    computingType: ComputingType,
    availableServices?: IService[]
) => {
    return availableServices
        ? availableServices
              .map((service) => service.computingType)
              .findIndex((computations) => computations.includes(computingType))
        : ResultsTabsRootLevel.LOADFLOW;
};

//function to convert computing type to the index corresponding to the resulting computation tab.
//the list of services must also be passed as parameter because its content is dynamic depending on the state of the application (e.g. developer mode disabled)
export const computingTypeToRootTabRedirection = (
    computingType: ComputingType,
    availableServices?: IService[]
): ResultTabIndexRedirection => {
    const rootResultTabIndex = getServiceResultTabIndex(
        computingType,
        availableServices
    );
    switch (computingType) {
        case ComputingType.LOADFLOW:
        case ComputingType.SECURITY_ANALYSIS:
        case ComputingType.SENSITIVITY_ANALYSIS:
        case ComputingType.DYNAMIC_SIMULATION:
        case ComputingType.VOLTAGE_INIT:
        case ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS:
        case ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS:
            return rootResultTabIndex;
        default:
            return ResultsTabsRootLevel.LOADFLOW;
    }
};

export const computingTypeToShortcircuitTabRedirection = (
    computingType: ComputingType | undefined
): ResultTabIndexRedirection => {
    switch (computingType) {
        case ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS:
            return ShortCircuitAnalysisResultTabs.ALL_BUSES;
        case ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS:
            return ShortCircuitAnalysisResultTabs.ONE_BUS;
        default:
            return ShortCircuitAnalysisResultTabs.ALL_BUSES;
    }
};
