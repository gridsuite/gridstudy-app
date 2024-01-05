import ComputingType from 'components/computing-status/computing-type';
import { IService } from 'components/result-view-tab';
import { ShortCircuitAnalysisResultTabs } from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import {
    DEFAULT_TAB_REDIRECTION,
    ResultsTabsRootLevel,
} from 'components/results/use-results-tab';
import RunningStatus from 'components/utils/running-status';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState, ComputingStatus } from 'redux/reducer.type';

export const useLastLaunchedComputation = (): ComputingType | undefined => {
    const computationStatus: ComputingStatus = useSelector(
        (state: ReduxState) => state.computingStatus
    );
    const lastRunningComputation = useRef<ComputingType>();
    useEffect(() => {
        const lastLaunchedComputation: ComputingType = Object.keys(
            computationStatus
        ).find(
            (computation) =>
                computationStatus[computation as ComputingType] ===
                RunningStatus.RUNNING
        ) as ComputingType;

        if (lastLaunchedComputation) {
            lastRunningComputation.current = undefined;
            lastRunningComputation.current = lastLaunchedComputation;
        }
    }, [computationStatus]);

    return lastRunningComputation.current;
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

//function to convert computing type to the combination of indexes corresponding to the computation results tab.
//the list of services must also be passed as parameter to resolve the index because its content is dynamic
//depending on the state of the application (e.g. developer mode disabled)
export const computingTypeToTabRedirection = (
    computingType: ComputingType,
    availableServices?: IService[]
) => {
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
            return [rootResultTabIndex, null];
        case ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS:
            return [
                rootResultTabIndex,
                ShortCircuitAnalysisResultTabs.ALL_BUSES,
            ];
        case ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS:
            return [rootResultTabIndex, ShortCircuitAnalysisResultTabs.ONE_BUS];
        default:
            return DEFAULT_TAB_REDIRECTION;
    }
};
