/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Box, Grid, Tabs, Tab } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TAB_VALUES } from './load-flow-parameters-utils';
import { getTabStyle } from 'components/utils/tab-utils';
import { PROVIDER } from 'components/utils/field-constants';
import LineSeparator from 'components/dialogs/commons/line-separator';
import { MuiSelectInput } from '@gridsuite/commons-ui';
import { styles } from '../parameters-style';

const LoadFlowParametersHeader = ({
    selectedTab,
    handleTabChange,
    tabIndexesWithError,
    formattedProviders,
}: {
    selectedTab: string;
    handleTabChange: (event: React.SyntheticEvent, newValue: TAB_VALUES) => void;
    tabIndexesWithError: TAB_VALUES[];
    formattedProviders: { id: string; label: string }[];
}) => (
    <Box sx={{ flexGrow: 0, paddingLeft: 1, paddingTop: 1 }}>
        <Grid
            container
            spacing={1}
            sx={{
                padding: 0,
                paddingBottom: 0,
                height: 'fit-content',
            }}
            justifyContent={'space-between'}
        >
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id="Provider" />
            </Grid>
            <Grid item xs={'auto'} sx={styles.controlItem}>
                <MuiSelectInput name={PROVIDER} size="small" options={Object.values(formattedProviders)} />
            </Grid>
            <LineSeparator />
            <Grid item sx={{ width: '100%' }}>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab
                        label={<FormattedMessage id={TAB_VALUES.GENERAL} />}
                        value={TAB_VALUES.GENERAL}
                        sx={getTabStyle(tabIndexesWithError, TAB_VALUES.GENERAL)}
                    />
                    <Tab
                        label={<FormattedMessage id={TAB_VALUES.LIMIT_REDUCTIONS} />}
                        value={TAB_VALUES.LIMIT_REDUCTIONS}
                        sx={getTabStyle(tabIndexesWithError, TAB_VALUES.LIMIT_REDUCTIONS)}
                    />
                </Tabs>
            </Grid>
        </Grid>
    </Box>
);

export default LoadFlowParametersHeader;
