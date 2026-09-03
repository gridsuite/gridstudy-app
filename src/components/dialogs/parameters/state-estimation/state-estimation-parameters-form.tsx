/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SyntheticEvent } from 'react';
import { type MuiStyles, parametersStyles, TabPanel } from '@gridsuite/commons-ui';
import { Grid, Stack, Tab, Tabs, Theme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TabValue } from './state-estimation-parameters-utils';
import StateEstimationGeneralParameters from './state-estimation-general-parameters';
import { StateEstimationWeightsParameters } from './state-estimation-weights-parameters';
import { StateEstimationQualityParameters } from './state-estimation-quality-parameters';
import { StateEstimationLoadboundsParameters } from './state-estimation-loadbounds-parameters';
import { getTabStyle } from '../../../utils/tab-utils';

interface StateEstimationParametersFormProps {
    tabValue: TabValue;
    handleTabChange: (event: SyntheticEvent, newValue: TabValue) => void;
    tabIndexesWithError: TabValue[];
}

const styles = {
    container: (theme: Theme) => ({
        ...parametersStyles.scrollableGrid(theme),
        maxHeight: '100%',
        flexGrow: 1,
        overflow: 'auto',
        paddingLeft: 1,
    }),
    maxWidth: {
        width: '100%',
    },
} as const satisfies MuiStyles;

export const StateEstimationParametersForm = ({
    tabValue,
    handleTabChange,
    tabIndexesWithError,
}: StateEstimationParametersFormProps) => {
    return (
        <Stack>
            <Tabs
                value={tabValue}
                variant="scrollable"
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab
                    label={<FormattedMessage id="StateEstimationParametersGeneralTabLabel" />}
                    value={TabValue.GENERAL}
                    sx={getTabStyle(tabIndexesWithError, TabValue.GENERAL)}
                />
                <Tab
                    label={<FormattedMessage id="StateEstimationParametersWeightsTabLabel" />}
                    value={TabValue.WEIGHTS}
                    sx={getTabStyle(tabIndexesWithError, TabValue.WEIGHTS)}
                />
                <Tab
                    label={<FormattedMessage id="StateEstimationParametersQualityTabLabel" />}
                    value={TabValue.QUALITY}
                    sx={getTabStyle(tabIndexesWithError, TabValue.QUALITY)}
                />
                <Tab
                    label={<FormattedMessage id="StateEstimationParametersLoadboundsTabLabel" />}
                    value={TabValue.LOADBOUNDS}
                    sx={getTabStyle(tabIndexesWithError, TabValue.LOADBOUNDS)}
                />
            </Tabs>
            <Grid container sx={styles.container}>
                <Grid sx={styles.maxWidth}>
                    <TabPanel value={tabValue} index={TabValue.GENERAL}>
                        <StateEstimationGeneralParameters />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TabValue.WEIGHTS}>
                        <StateEstimationWeightsParameters />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TabValue.QUALITY}>
                        <StateEstimationQualityParameters />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TabValue.LOADBOUNDS}>
                        <StateEstimationLoadboundsParameters />
                    </TabPanel>
                </Grid>
            </Grid>
        </Stack>
    );
};
