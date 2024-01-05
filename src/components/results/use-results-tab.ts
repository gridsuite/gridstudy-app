/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StudyView } from 'components/study-pane';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ComputingStatus, ReduxState } from 'redux/reducer.type';
import { ShortCircuitAnalysisResultTabs } from './shortcircuit/shortcircuit-analysis-result.type';

export enum ResultsTabsRootLevel {
    LOADFLOW = 0,
    SECURITY_ANALYSIS = 1,
    SENSITIVITY_ANALYSIS = 2,
    SHORTCIRCUIT_ANALYSIS = 3,
    DYNAMIC_SIMULATION = 4,
    VOLTAGE_INIT = 5,
}

// to fill with other first level tabs when needed (ex : ShortcircuitAnalysisResultTabs | SensitivityAnalysisResultTabs | ...)
type ResultsTabsLevelOne = ShortCircuitAnalysisResultTabs;

export type ResultTabIndexRedirection =
    | ResultsTabsRootLevel
    | ResultsTabsLevelOne;

/**
 * handles redirection to specific tab
 * @param resultTabIndexRedirection array holding the desired tabs to be redirected to [2, 1] would redirect to tab number 2, subtab number 1
 * @param setTabIndex setter allowing to set the tab in the current component
 * @param tabLevel tab level of the current component
 */
export const useResultsTab = (
    resultTabIndexRedirection: ResultTabIndexRedirection,
    redirectionLock: Boolean,
    setTabIndex: React.Dispatch<React.SetStateAction<number>>,
    view: string
) => {
    useEffect(() => {
        if (view !== StudyView.RESULTS && !redirectionLock) {
            setTabIndex(resultTabIndexRedirection as number);
        }
    }, [resultTabIndexRedirection, setTabIndex, view, redirectionLock]);
};

export const useResultsTabRedirectionLock = (): [
    Boolean,
    Dispatch<SetStateAction<Boolean>>
] => {
    const computationStatus: ComputingStatus = useSelector(
        (state: ReduxState) => state.computingStatus
    );
    const [redirectionLock, setRedirectionLock] = useState<Boolean>(false);

    //we ought to release the redirection lock if the user launch a new computation
    useEffect(() => {
        setRedirectionLock(false);
    }, [computationStatus]);

    return [redirectionLock, setRedirectionLock];
};
