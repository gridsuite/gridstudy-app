/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import { TABLES_NAMES } from './utils/config-tables';
import { FunctionComponent } from 'react';

interface EquipmentTabsProps {
    tabIndex: number;
    handleSwitchTab: (value: number) => void;
    disabled: boolean;
}

export const EquipmentTabs: FunctionComponent<EquipmentTabsProps> = ({ tabIndex, handleSwitchTab, disabled }) => {
    const intl = useIntl();
    return (
        <Grid container justifyContent={'space-between'} item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(_event, value) => {
                    handleSwitchTab(value);
                }}
                aria-label="tables"
            >
                {TABLES_NAMES.map((table) => (
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
    );
};
