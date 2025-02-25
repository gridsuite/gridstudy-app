/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import BasicModificationDialog from '../../commons/basicModificationDialog';
import { BooleanCellRenderer, DefaultCellRenderer } from '../../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import {
    ANGLE,
    CONNECT,
    LEG_SIDE,
    RATIO_TAP_CHANGER_POSITION,
    RATIO_TAP_CHANGER_TARGET_V,
    REACTIVE_POWER_SET_POINT,
    SECTION_COUNT,
    TARGET_V,
    V,
    VOLTAGE_SET_POINT,
} from '../../../utils/field-constants';
import { CsvExport } from '../../../spreadsheet/csv-export/csv-export';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { FetchStatus } from '../../../../services/utils.type';
import type { ColDef, RowDataUpdatedEvent } from 'ag-grid-community';
import { suppressEventsToPreventEditMode } from '../../commons/utils';

const defaultColDef: ColDef = {
    filter: true,
    sortable: true,
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellRenderer: DefaultCellRenderer,
    suppressKeyboardEvent: suppressEventsToPreventEditMode,
};

function onRowDataUpdated(event: RowDataUpdatedEvent) {
    if (event.api) {
        event.api.sizeColumnsToFit();
    }
}

function check(x: number | undefined) {
    return x != null && 0 <= Math.abs(x);
}

const EquipmentTypeTabs = {
    GENERATOR_TAB: 0,
    TRANSFORMER_TAB: 1,
    STATIC_VAR_COMPENSATOR_TAB: 2,
    VSC_CONVERTER_STATION_TAB: 3,
    SHUNT_COMPENSATOR_TAB: 4,
    BUS_TAB: 5,
};

interface CloseFunction {
    (): void;
}

interface PreviewModeSubmitFunction {
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
    [RATIO_TAP_CHANGER_TARGET_V]: number | undefined;
    [LEG_SIDE]: number | undefined;
}

interface StaticVarCompensatorRowData {
    ID: string;
    [VOLTAGE_SET_POINT]: number | undefined;
    [REACTIVE_POWER_SET_POINT]: number | undefined;
}

interface VscConverterStationRowData {
    ID: string;
    [VOLTAGE_SET_POINT]: number | undefined;
    [REACTIVE_POWER_SET_POINT]: number | undefined;
}

interface ShuntCompensatorRowData {
    ID: string;
    [SECTION_COUNT]: number | undefined;
    [CONNECT]: boolean | undefined;
    [TARGET_V]: number | undefined;
}

interface BusRowData {
    ID: string;
    [V]: number | undefined;
    [ANGLE]: number | undefined;
}

interface GeneratorData {
    generatorId: string;
    targetV: number | undefined;
    targetQ: number | undefined;
}

interface TransformerData {
    transformerId: string;
    ratioTapChangerPosition: number | undefined;
    ratioTapChangerTargetV: number | undefined;
    legSide: number | undefined;
}

interface StaticVarCompensatorData {
    staticVarCompensatorId: string;
    voltageSetpoint: number | undefined;
    reactivePowerSetpoint: number | undefined;
}

interface VscConverterStationData {
    vscConverterStationId: string;
    voltageSetpoint: number | undefined;
    reactivePowerSetpoint: number | undefined;
}

interface ShuntCompensatorData {
    shuntCompensatorId: string;
    sectionCount: number | undefined;
    connect: boolean | undefined;
    targetV: number | undefined;
}

interface BusData {
    busId: string;
    v: number | undefined;
    angle: number | undefined;
}

interface EditData {
    generators: GeneratorData[];
    transformers: TransformerData[];
    staticVarCompensators: StaticVarCompensatorData[];
    vscConverterStations: VscConverterStationData[];
    shuntCompensators: ShuntCompensatorData[];
    buses: BusData[];
}

interface VoltageInitModificationProps {
    editData: EditData;
    onClose: CloseFunction;
    onPreviewModeSubmit?: PreviewModeSubmitFunction;
    editDataFetchStatus: FetchStatus;
    disabledSave: boolean;
    dialogProps: any;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
    },
    grid: {
        flexGrow: '1',
    },
};

const VoltageInitModificationDialog: FunctionComponent<VoltageInitModificationProps> = ({
    editData,
    onClose,
    onPreviewModeSubmit,
    editDataFetchStatus,
    disabledSave,
    dialogProps,
}) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(EquipmentTypeTabs.GENERATOR_TAB);

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const gridRef = useRef<AgGridReact>(null);

    const generatorsColumnDefs = useMemo<ColDef[]>(
        () => [
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
        ],
        [intl]
    );

    const transformersColumnDefs = useMemo<ColDef[]>(
        () => [
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
            {
                headerName: intl.formatMessage({
                    id: 'VoltageSetpointKV',
                }),
                field: RATIO_TAP_CHANGER_TARGET_V,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
        ],
        [intl]
    );

    const staticVarCompensatorsColumnDefs = useMemo<ColDef[]>(
        () => [
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
        ],
        [intl]
    );

    const vscConverterStationsColumnDefs = useMemo<ColDef[]>(
        () => [
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
        ],
        [intl]
    );

    const shuntCompensatorsColumnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: intl.formatMessage({ id: 'ID' }),
                field: 'ID',
                pinned: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'numberOfSections',
                }),
                field: SECTION_COUNT,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'Connect' }),
                field: CONNECT,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'VoltageSetpointKV',
                }),
                field: TARGET_V,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
        ],
        [intl]
    );

    const busColumnDefs = useMemo<ColDef[]>(
        () => [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'ID',
                pinned: true,
            },
            {
                headerName: intl.formatMessage({ id: 'BusVoltage' }),
                field: V,
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'BusAngle' }),
                field: 'angle',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
        ],
        [intl]
    );

    const equipmentTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container>
                <Tabs value={tabIndex} variant="scrollable" onChange={(event, newValue) => handleTabChange(newValue)}>
                    <Tab label={<FormattedMessage id="Generators" />} />
                    <Tab label={<FormattedMessage id="Transformers" />} />
                    <Tab label={<FormattedMessage id="StaticVarCompensators" />} />
                    <Tab label={<FormattedMessage id="VscConverterStations" />} />
                    <Tab label={<FormattedMessage id="ShuntCompensators" />} />
                    <Tab label={<FormattedMessage id="Buses" />} />
                </Tabs>
            </Grid>
        </Box>
    );

    const displayTable = useCallback(
        (currentTab: number) => {
            const prepareGridData = (currentTab: number, editData: EditData) => {
                let rowData: any[] = [];
                let columnDefs: any[] = [];
                let tableName: string = '';
                if (editData) {
                    if (currentTab === EquipmentTypeTabs.GENERATOR_TAB) {
                        columnDefs = generatorsColumnDefs;
                        tableName = 'Generators';
                        editData.generators.forEach((m: GeneratorData) => {
                            let row: GeneratorRowData = {
                                ID: m.generatorId,
                                [VOLTAGE_SET_POINT]: undefined,
                                [REACTIVE_POWER_SET_POINT]: undefined,
                            };
                            if (check(m.targetV)) {
                                row[VOLTAGE_SET_POINT] = m.targetV;
                            }
                            if (check(m.targetQ)) {
                                row[REACTIVE_POWER_SET_POINT] = m.targetQ;
                            }
                            rowData.push(row);
                        });
                    } else if (currentTab === EquipmentTypeTabs.TRANSFORMER_TAB) {
                        columnDefs = transformersColumnDefs;
                        tableName = 'Transformers';
                        editData.transformers.forEach((m: TransformerData) => {
                            let row: TransformerRowData = {
                                ID: m.transformerId,
                                [RATIO_TAP_CHANGER_POSITION]: undefined,
                                [RATIO_TAP_CHANGER_TARGET_V]: undefined,
                                [LEG_SIDE]: undefined,
                            };
                            if (check(m.ratioTapChangerPosition)) {
                                row[RATIO_TAP_CHANGER_POSITION] = m.ratioTapChangerPosition;
                            }
                            if (check(m.ratioTapChangerTargetV)) {
                                row[RATIO_TAP_CHANGER_TARGET_V] = m.ratioTapChangerTargetV;
                            }
                            if (m.legSide) {
                                row[LEG_SIDE] = m.legSide;
                            }
                            rowData.push(row);
                        });
                    } else if (currentTab === EquipmentTypeTabs.STATIC_VAR_COMPENSATOR_TAB) {
                        columnDefs = staticVarCompensatorsColumnDefs;
                        tableName = 'StaticVarCompensators';
                        editData.staticVarCompensators.forEach((m: StaticVarCompensatorData) => {
                            let row: StaticVarCompensatorRowData = {
                                ID: m.staticVarCompensatorId,
                                [VOLTAGE_SET_POINT]: undefined,
                                [REACTIVE_POWER_SET_POINT]: undefined,
                            };
                            if (check(m.voltageSetpoint)) {
                                row[VOLTAGE_SET_POINT] = m.voltageSetpoint;
                            }
                            if (check(m.reactivePowerSetpoint)) {
                                row[REACTIVE_POWER_SET_POINT] = m.reactivePowerSetpoint;
                            }
                            rowData.push(row);
                        });
                    } else if (currentTab === EquipmentTypeTabs.VSC_CONVERTER_STATION_TAB) {
                        columnDefs = vscConverterStationsColumnDefs;
                        tableName = 'VscConverterStations';
                        editData.vscConverterStations.forEach((m: VscConverterStationData) => {
                            let row: VscConverterStationRowData = {
                                ID: m.vscConverterStationId,
                                [VOLTAGE_SET_POINT]: undefined,
                                [REACTIVE_POWER_SET_POINT]: undefined,
                            };
                            if (check(m.voltageSetpoint)) {
                                row[VOLTAGE_SET_POINT] = m.voltageSetpoint;
                            }
                            if (check(m.reactivePowerSetpoint)) {
                                row[REACTIVE_POWER_SET_POINT] = m.reactivePowerSetpoint;
                            }
                            rowData.push(row);
                        });
                    } else if (currentTab === EquipmentTypeTabs.SHUNT_COMPENSATOR_TAB) {
                        columnDefs = shuntCompensatorsColumnDefs;
                        tableName = 'ShuntCompensators';
                        editData.shuntCompensators.forEach((m: ShuntCompensatorData) => {
                            let row: ShuntCompensatorRowData = {
                                ID: m.shuntCompensatorId,
                                [SECTION_COUNT]: undefined,
                                [CONNECT]: false,
                                [TARGET_V]: undefined,
                            };
                            if (check(m.sectionCount)) {
                                row[SECTION_COUNT] = m.sectionCount;
                            }
                            if (m.connect) {
                                row[CONNECT] = m.connect;
                            }
                            if (check(m.targetV)) {
                                row[TARGET_V] = m.targetV;
                            }
                            rowData.push(row);
                        });
                    } else if (currentTab === EquipmentTypeTabs.BUS_TAB) {
                        columnDefs = busColumnDefs;
                        tableName = 'Buses';
                        editData.buses.forEach((m: BusData) => {
                            let row: BusRowData = {
                                ID: m.busId,
                                [V]: undefined,
                                [ANGLE]: undefined,
                            };
                            if (check(m.v)) {
                                row[V] = m.v;
                            }
                            if (check(m.angle)) {
                                row[ANGLE] = m.angle;
                            }
                            rowData.push(row);
                        });
                    }
                }
                return { rowData, columnDefs, tableName };
            };

            const { rowData, columnDefs, tableName } = prepareGridData(currentTab, editData);

            return (
                <Box sx={styles.container}>
                    <Box sx={styles.csvExport}>
                        <Box style={{ flexGrow: 1 }}></Box>
                        <CsvExport
                            gridRef={gridRef}
                            columns={columnDefs}
                            tableName={tableName}
                            tableNamePrefix="VoltageInit_"
                            disabled={rowData.length === 0 || editDataFetchStatus === FetchStatus.RUNNING}
                        />
                    </Box>
                    <Box sx={styles.grid}>
                        <CustomAGGrid
                            ref={gridRef}
                            rowData={rowData}
                            defaultColDef={defaultColDef}
                            columnDefs={columnDefs}
                            rowSelection="single"
                            onRowDataUpdated={onRowDataUpdated}
                        />
                    </Box>
                </Box>
            );
        },
        [
            editData,
            editDataFetchStatus,
            generatorsColumnDefs,
            transformersColumnDefs,
            staticVarCompensatorsColumnDefs,
            vscConverterStationsColumnDefs,
            shuntCompensatorsColumnDefs,
            busColumnDefs,
        ]
    );

    const open: boolean = useOpenShortWaitFetching({
        isDataFetched: editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <BasicModificationDialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
            onClear={handleClear}
            onSave={onPreviewModeSubmit} // we can save/submit in case of preview mode
            disabledSave={disabledSave || onPreviewModeSubmit === undefined || editData === undefined}
            aria-labelledby="dialog-voltage-init-modification"
            subtitle={equipmentTabs}
            PaperProps={{
                sx: {
                    height: '90vh',
                },
            }}
            titleId={'VoltageInitModification'}
            {...dialogProps}
            isDataFetching={editDataFetchStatus === FetchStatus.RUNNING}
        >
            {displayTable(tabIndex)}
        </BasicModificationDialog>
    );
};

export default VoltageInitModificationDialog;
