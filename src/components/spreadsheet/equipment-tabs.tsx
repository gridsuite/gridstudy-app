/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import { FunctionComponent } from 'react';
import AddNewSpreadsheetConfig from './add-new-spreadsheet/add-new-spreadsheet-config';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

interface EquipmentTabsProps {
    tabIndex: number;
    handleSwitchTab: (value: number) => void;
    disabled: boolean;
}

export const EquipmentTabs: FunctionComponent<EquipmentTabsProps> = ({ tabIndex, handleSwitchTab, disabled }) => {
    const intl = useIntl();
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    return (
        <Grid container direction="row" wrap="nowrap" item>
            <Grid item xs padding={1}>
                <AddNewSpreadsheetConfig disabled={disabled} />
            </Grid>
            <Grid item sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(_event, value) => {
                        handleSwitchTab(value);
                    }}
                    aria-label="tables"
                >
                    {tablesNames.map((table) => (
                        <Tab
                            key={table}
                            label={intl.formatMessage({
                                id: table,
                            })}
                            disabled={disabled}
                        />
                    ))}
                </Tabs>
            </Grid>
        </Grid>
    );
};
