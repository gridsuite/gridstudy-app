/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { ShortCircuitAnalysisResultTabs } from './shortcircuit/shortcircuit-analysis-result.type';

export enum ResultsTabsLevel {
    ROOT = 0,
    ONE = 1,
}

export enum ResultsTabsRootLevel {
    LOADFLOW = 0,
    SECURITY_ANALYSIS = 1,
    SENSITIVITY_ANALYSIS = 2,
    NON_EVACUATED_ENERGY,
    SHORTCIRCUIT_ANALYSIS = 4,
    DYNAMIC_SIMULATION = 5,
    VOLTAGE_INIT = 6,
}

// to fill with other first level tabs when needed (ex : ShortcircuitAnalysisResultTabs | SensitivityAnalysisResultTabs | ...)
type ResultsTabsLevelOne = ShortCircuitAnalysisResultTabs;

export type ResultTabIndexRedirection =
    | [ResultsTabsRootLevel, ResultsTabsLevelOne]
    | null;

/**
 * handles redirection to specific tab
 * @param resultTabIndexRedirection array holding the desired tabs to be redirected to [2, 1] would redirect to tab number 2, subtab number 1
 * @param setTabIndex setter allowing to set the tab in the current component
 * @param tabLevel tab level of the current component
 */
export const useResultsTab = (
    resultTabIndexRedirection: ResultTabIndexRedirection,
    setTabIndex: (index: number) => void,
    tabLevel: ResultsTabsLevel
) => {
    useEffect(() => {
        resultTabIndexRedirection?.[tabLevel] &&
            setTabIndex(resultTabIndexRedirection[tabLevel]);
    }, [tabLevel, resultTabIndexRedirection, setTabIndex]);
};
