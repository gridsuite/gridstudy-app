/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ComputingType from 'components/computing-status/computing-type';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ShortCircuitAnalysisResultTabs } from './shortcircuit/shortcircuit-analysis-result.type';
import { StudyView } from 'components/utils/utils';
import { IService } from '../result-view-tab.type';

export enum ResultsTabsRootLevel {
    LOAD_FLOW = 0,
    SECURITY_ANALYSIS = 1,
    SENSITIVITY_ANALYSIS = 2,
    NON_EVACUATED_ENERGY = 3,
    SHORTCIRCUIT_ANALYSIS = 4,
    DYNAMIC_SIMULATION = 5,
    VOLTAGE_INITIALIZATION = 6,
    STATE_ESTIMATION = 7,
}

// to fill with other first level tabs when needed (ex : ShortcircuitAnalysisResultTabs | SensitivityAnalysisResultTabs | ...)
type ResultsTabsLevelOne = ShortCircuitAnalysisResultTabs;

export type ResultTabIndexRedirection = ResultsTabsRootLevel | ResultsTabsLevelOne;

/**
 * handles redirection to specific tab
 * @param resultTabIndexRedirection array holding the desired tabs to be redirected to [2, 1] would redirect to tab number 2, subtab number 1
 * @param setTabIndex setter allowing to set the tab in the current component
 * @param view display context (cf StudyView)
 */
export const useResultsTab = (
    resultTabIndexRedirection: ResultTabIndexRedirection,
    setTabIndex: React.Dispatch<React.SetStateAction<number>>,
    view: string
): Dispatch<SetStateAction<boolean>> => {
    const [redirectionLock, setRedirectionLock] = useResultsTabRedirectionLock();

    useEffect(() => {
        if (view !== StudyView.RESULTS && !redirectionLock) {
            setTabIndex(resultTabIndexRedirection);
        }
    }, [resultTabIndexRedirection, setTabIndex, view, redirectionLock]);

    return setRedirectionLock;
};

const useResultsTabRedirectionLock = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const lastCompletedComputation = useSelector((state: AppState) => state.lastCompletedComputation);
    const [redirectionLock, setRedirectionLock] = useState<boolean>(false);

    useEffect(() => {
        //we ought to release the redirection lock if the user launches a new computation
        setRedirectionLock(false);
    }, [lastCompletedComputation]);

    return [redirectionLock, setRedirectionLock];
};

//function to convert computing type to the index corresponding to the resulting computation tab.
//the list of services must also be passed as parameter because its content is dynamic depending on the state of the application (e.g. developer mode disabled)
export const computingTypeToRootTabRedirection = (
    computingType: ComputingType,
    availableServices?: IService[]
): ResultTabIndexRedirection => {
    return availableServices
        ? availableServices
              .map((service) => service.computingType)
              .findIndex((computations) => computations.includes(computingType))
        : ResultsTabsRootLevel.LOAD_FLOW;
};

export const computingTypeToShortcircuitTabRedirection = (
    computingType: ComputingType | undefined
): ResultTabIndexRedirection => {
    switch (computingType) {
        case ComputingType.SHORT_CIRCUIT:
            return ShortCircuitAnalysisResultTabs.ALL_BUSES;
        case ComputingType.SHORT_CIRCUIT_ONE_BUS:
            return ShortCircuitAnalysisResultTabs.ONE_BUS;
        default:
            return ShortCircuitAnalysisResultTabs.ALL_BUSES;
    }
};
