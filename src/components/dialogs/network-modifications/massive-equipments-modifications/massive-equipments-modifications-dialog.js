/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { CustomAGGrid } from '../../../custom-aggrid/custom-aggrid';
import BasicModificationDialog from '../../commons/basicModificationDialog';
import { DefaultCellRenderer } from '../../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FetchStatus } from '../../../../utils/rest-api';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import {
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_SET_POINT,
} from '../../../utils/field-constants';

export const ALLOWED_KEYS = [
    'Escape',
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
];

export const EquipmentTypeTabs = {
    GENERATOR_TAB: 0,
};

const MassiveEquipmentsModificationDialog = ({
    editData,
    onClose,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(EquipmentTypeTabs.GENERATOR_TAB);

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);

    const handleTabChange = useCallback((newValue) => {
        setTabIndex(newValue);
    }, []);

    const generatorsColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                field: 'ID',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'VoltageSetpointKV' }),
                field: VOLTAGE_SET_POINT,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'ReactivePowerSetpointMVAR',
                }),
                field: REACTIVE_POWER_SET_POINT,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
        ];
    }, [intl]);

    const equipmentTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newValue) => handleTabChange(newValue)}
                >
                    <Tab label={<FormattedMessage id="Generators" />} />
                </Tabs>
            </Grid>
        </Box>
    );

    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: false,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
        }),
        []
    );

    const displayTable = useCallback(
        (currentTab) => {
            let rowData = [];
            if (editData) {
                if (currentTab === EquipmentTypeTabs.GENERATOR_TAB) {
                    editData.modifications.forEach((m) => {
                        let row = { ID: m.equipmentId };
                        if (m.voltageSetpoint) {
                            row[VOLTAGE_SET_POINT] = m.voltageSetpoint.value;
                        }
                        if (m.reactivePowerSetpoint) {
                            row[REACTIVE_POWER_SET_POINT] =
                                m.reactivePowerSetpoint.value;
                        }
                        rowData.push(row);
                    });
                }
            }

            return (
                <CustomAGGrid
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={generatorsColumnDefs}
                    rowSelection="single"
                />
            );
        },
        [editData, generatorsColumnDefs, defaultColDef]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <BasicModificationDialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
            onClear={handleClear}
            onSave={() => {}} // no modifications
            aria-labelledby="dialog-massive-modifications"
            subtitle={equipmentTabs}
            PaperProps={{
                sx: {
                    height: '90vh',
                },
            }}
            titleId={'MassiveEquipmentsModifications'}
            {...dialogProps}
            disabledSave={true}
            isDataFetching={editDataFetchStatus === FetchStatus.RUNNING}
        >
            <div style={{ height: '100%' }}>{displayTable(tabIndex)}</div>
        </BasicModificationDialog>
    );
};

MassiveEquipmentsModificationDialog.propTypes = {
    onClose: PropTypes.func,
    editData: PropTypes.array,
};

export default MassiveEquipmentsModificationDialog;
