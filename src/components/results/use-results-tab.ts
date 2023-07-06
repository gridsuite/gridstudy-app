import { useEffect } from 'react';
import { ShortcircuitAnalysisResultTabs } from './shortcircuit/shortcircuit-analysis-result.type';

export enum ResultsTabsLevel {
    ROOT = 0,
    ONE = 1,
}

export enum ResultsTabsRootLevel {
    LOADFLOW = 0,
    SECURITY_ANALYSIS = 1,
    SENSITIVITY_ANALYSIS = 2,
    SHORTCIRCUIT_ANALYSIS = 3,
    DYNAMIC_SIMULATION = 4,
    VOLTAGE_INIT = 5,
}

// to fill with other first level tabs when needed (ex : ShortcircuitAnalysisResultTabs | SensitivityAnalysisResultTabs | ...)
type ResultsTabsLevelOne = ShortcircuitAnalysisResultTabs;

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
