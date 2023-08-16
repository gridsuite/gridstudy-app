/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { CustomAGGrid } from '../../../custom-aggrid/custom-aggrid';
import BasicModificationDialog from '../../commons/basicModificationDialog';
import { DefaultCellRenderer } from '../../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import {
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_SET_POINT,
    RATIO_TAP_CHANGER_POSITION,
    LEG_SIDE,
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
    TRANSFORMER_TAB: 1,
};

enum FetchStatus {
    SUCCEED = 'SUCCEED',
    FAILED = 'FAILED',
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
}

interface CloseFunction {
    (): void;
}

interface GeneratorRowData {
    ID: string;
    [VOLTAGE_SET_POINT]: number | undefined;
    [REACTIVE_POWER_SET_POINT]: number | undefined;
}

interface TransformerRowData {
    ID: string;
    [RATIO_TAP_CHANGER_POSITION]: number | undefined;
    [LEG_SIDE]: number | undefined;
}

interface GeneratorData {
    generatorId: string;
    voltageSetpoint: number | undefined;
    reactivePowerSetpoint: number | undefined;
}

interface TransformerData {
    transformerId: string;
    ratioTapChangerPosition: number | undefined;
    legSide: number | undefined;
}

interface EditData {
    generators: GeneratorData[];
    transformers: TransformerData[];
}

interface VoltageInitModificationProps {
    editData: EditData;
    onClose: CloseFunction;
    editDataFetchStatus: FetchStatus;
    dialogProps: any;
}

const VoltageInitModificationDialog: FunctionComponent<
    VoltageInitModificationProps
> = ({ editData, onClose, editDataFetchStatus, dialogProps }) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(EquipmentTypeTabs.GENERATOR_TAB);

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const generatorsColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                field: 'ID',
                pinned: true,
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

    const transformersColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                field: 'ID',
                pinned: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'RatioTapChangerPosition',
                }),
                field: RATIO_TAP_CHANGER_POSITION,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'Leg' }),
                field: LEG_SIDE,
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
                    <Tab label={<FormattedMessage id="Transformers" />} />
                </Tabs>
            </Grid>
        </Box>
    );

    const suppressKeyEvent = (params: any) => {
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
            suppressKeyboardEvent: (params: any) => suppressKeyEvent(params),
        }),
        []
    );

    const onGridReady = useCallback((params: any) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const displayTable = useCallback(
        (currentTab: number) => {
            if (currentTab === EquipmentTypeTabs.GENERATOR_TAB) {
                let rowData: GeneratorRowData[] = [];
                if (editData) {
                    editData.generators.forEach((m: GeneratorData) => {
                        let row: GeneratorRowData = {
                            ID: m.generatorId,
                            [VOLTAGE_SET_POINT]: undefined,
                            [REACTIVE_POWER_SET_POINT]: undefined,
                        };
                        if (m.voltageSetpoint) {
                            row[VOLTAGE_SET_POINT] = m.voltageSetpoint;
                        }
                        if (m.reactivePowerSetpoint) {
                            row[REACTIVE_POWER_SET_POINT] =
                                m.reactivePowerSetpoint;
                        }
                        rowData.push(row);
                    });
                }

                return (
                    <CustomAGGrid
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        columnDefs={generatorsColumnDefs}
                        rowSelection="single"
                        onGridReady={onGridReady}
                    />
                );
            } else if (currentTab === EquipmentTypeTabs.TRANSFORMER_TAB) {
                let rowData: TransformerRowData[] = [];
                if (editData) {
                    editData.transformers.forEach((m: TransformerData) => {
                        let row: TransformerRowData = {
                            ID: m.transformerId,
                            [RATIO_TAP_CHANGER_POSITION]: undefined,
                            [LEG_SIDE]: undefined,
                        };
                        if (m.ratioTapChangerPosition) {
                            row[RATIO_TAP_CHANGER_POSITION] =
                                m.ratioTapChangerPosition;
                        }
                        if (m.legSide) {
                            row[LEG_SIDE] = m.legSide;
                        }
                        rowData.push(row);
                    });
                }

                return (
                    <CustomAGGrid
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        columnDefs={transformersColumnDefs}
                        rowSelection="single"
                        onGridReady={onGridReady}
                    />
                );
            }
        },
        [
            editData,
            generatorsColumnDefs,
            transformersColumnDefs,
            defaultColDef,
            onGridReady,
        ]
    );

    const open: boolean = useOpenShortWaitFetching({
        isDataFetched:
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <BasicModificationDialog
            fullWidth
            open={open}
            onClose={onClose}
            onClear={handleClear}
            onSave={() => {}} // no modifications
            aria-labelledby="dialog-voltage-init-modification"
            subtitle={equipmentTabs}
            PaperProps={{
                sx: {
                    height: '90vh',
                },
            }}
            titleId={'VoltageInitModification'}
            {...dialogProps}
            disabledSave={true}
            isDataFetching={editDataFetchStatus === FetchStatus.RUNNING}
        >
            <div style={{ height: '100%' }}>{displayTable(tabIndex)}</div>
        </BasicModificationDialog>
    );
};

export default VoltageInitModificationDialog;
