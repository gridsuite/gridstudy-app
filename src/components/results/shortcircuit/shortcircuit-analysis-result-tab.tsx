/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tab, Tabs } from '@mui/material';
import { UUID } from 'crypto';
import { FunctionComponent, useCallback, useState } from 'react';
import {
    ShortcircuitAnalysisResultTabs,
    ShortcircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import {
    ResultTabIndexRedirection,
    ResultsTabsLevel,
    useResultsTab,
} from '../use-results-tab';
import { ShortCircuitAnalysisGlobalResult } from './shortcircuit-analysis-global-result';

interface ShortCircuitAnalysisResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    resultTabIndexRedirection: ResultTabIndexRedirection;
}

export const ShortCircuitAnalysisResultTab: FunctionComponent<
    ShortCircuitAnalysisResultTabProps
> = ({ resultTabIndexRedirection }) => {
    const [tabIndex, setTabIndex] = useState(
        resultTabIndexRedirection?.[ResultsTabsLevel.ONE] ?? 0
    );

    useResultsTab(resultTabIndexRedirection, setTabIndex, ResultsTabsLevel.ONE);

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
        },
        [setTabIndex]
    );

    return (
        <>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label={'Global'} />
                <Tab label={'Selectif'} />
            </Tabs>
            {tabIndex === ShortcircuitAnalysisResultTabs.GLOBAL && (
                <ShortCircuitAnalysisGlobalResult
                    analysisType={ShortcircuitAnalysisType.GLOBAL}
                />
            )}
            {tabIndex === ShortcircuitAnalysisResultTabs.SELECTIVE && (
                <ShortCircuitAnalysisGlobalResult
                    analysisType={ShortcircuitAnalysisType.SELECTIVE}
                />
            )}
        </>
    );
};
