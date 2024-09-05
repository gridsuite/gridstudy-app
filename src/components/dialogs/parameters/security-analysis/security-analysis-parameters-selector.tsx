/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, SyntheticEvent, useCallback, useMemo, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import Grid from '@mui/material/Grid';
import { Tab, Tabs } from '@mui/material';
import { TabPanel, useParameterState } from '../parameters';
import { TAB_INFO, TAB_VALUES } from '../common/limitreductions/columns-definitions';
import ViolationsHidingParameters from './security-analysis-violations-hiding';
import LimitReductionsTableForm from '../common/limitreductions/limit-reductions-table-form';
import { PARAM_DEVELOPER_MODE } from '../../../../utils/config-params';

const SecurityAnalysisParametersSelector: FunctionComponent<{
    params: Record<string, any>;
    updateParameters: (value: Record<string, any>) => void;
}> = ({ params, updateParameters }) => {
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [tabSelected, setTabSelected] = useState(TAB_VALUES.General);
    const handleTabChange = useCallback((event: SyntheticEvent, newValue: number) => {
        setTabSelected(newValue);
    }, []);

    const tabValue = useMemo(() => {
        return tabSelected === TAB_VALUES.LimitReductions && params.limitReductions === null
            ? TAB_VALUES.General
            : tabSelected;
    }, [params, tabSelected]);

    return (
        <>
            <Grid sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    {TAB_INFO.filter((t) => enableDeveloperMode || !t.developerModeOnly).map(
                        (tab, index) =>
                            (tab.label !== TAB_VALUES[TAB_VALUES.LimitReductions] || params.limitReductions) && (
                                <Tab
                                    key={tab.label}
                                    label={<FormattedMessage id={tab.label} />}
                                    value={index}
                                    sx={{
                                        fontSize: 17,
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize',
                                    }}
                                />
                            )
                    )}
                </Tabs>

                {TAB_INFO.filter((t) => enableDeveloperMode || !t.developerModeOnly).map((tab, index) => (
                    <TabPanel key={tab.label} value={tabValue} index={index}>
                        {tabValue === TAB_VALUES.General && (
                            <ViolationsHidingParameters params={params} updateParameters={updateParameters} />
                        )}
                        {tabValue === TAB_VALUES.LimitReductions && params.limitReductions && (
                            <Grid sx={{ width: '85%' }}>
                                <LimitReductionsTableForm limits={params.limitReductions} />
                            </Grid>
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default SecurityAnalysisParametersSelector;
