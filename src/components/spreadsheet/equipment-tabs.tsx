/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import CustomSpreadsheetConfig from './custom-spreadsheet/custom-spreadsheet-config';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';

interface EquipmentTabsProps {
    tabIndex: number;
    handleSwitchTab: (value: number) => void;
    disabled: boolean;
}

export const EquipmentTabs: FunctionComponent<EquipmentTabsProps> = ({ tabIndex, handleSwitchTab, disabled }) => {
    const intl = useIntl();
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);

    return (
        <Grid container direction="row" wrap="nowrap" item>
            {developerMode && (
                <Grid item xs padding={1}>
                    <CustomSpreadsheetConfig disabled={disabled} />
                </Grid>
            )}
            <Grid item sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(_event, value) => {
                        handleSwitchTab(value);
                    }}
                    aria-label="tables"
                >
                    {tablesDefinitions
                        .map((def) => def.name)
                        .map((tabName) => (
                            <Tab
                                key={tabName}
                                label={intl.formatMessage({
                                    id: tabName,
                                })}
                                disabled={disabled}
                            />
                        ))}
                </Tabs>
            </Grid>
        </Grid>
    );
};
