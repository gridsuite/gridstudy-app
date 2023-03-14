/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import { TABLES_NAMES } from './config-tables';

export const EquipmentTabs = ({ tabIndex, handleSwitchTab, disabled }) => {
    const intl = useIntl();
    return (
        <Grid container justifyContent={'space-between'} item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, value) => {
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
