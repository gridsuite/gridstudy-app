import { FunctionComponent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { useSpreadsheetEquipments } from '../network/use-spreadsheet-equipments';
import { formatFetchedEquipments } from '../spreadsheet/utils/equipment-table-utils';
import { TABLES_DEFINITION_INDEXES } from '../spreadsheet/utils/config-tables';
import { Box, Grid, Theme } from '@mui/material';
import { registerAllModules } from 'handsontable/registry';
import { useIntl } from 'react-intl';
import { HyperFormula } from 'hyperformula';
import { ChangeSource } from 'handsontable/common';
import { GlobalFilterHandsontable } from './global-filter-handsontable';
import Button from '@mui/material/Button';
import { DirectoryItemSelector, ElementType } from '@gridsuite/commons-ui';
import { evaluateFilter } from '../../services/study/filter';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { UUID } from 'crypto';
import { RawCellContent } from 'hyperformula/typings/CellContentParser';
import ColumnConfig1 from './column_config1.json';
import ColumnConfig2 from './column_config2.json';
import ColumnConfig3 from './column_config3.json';

import { CellCoords, CellRange } from 'handsontable';
import TextField from '@mui/material/TextField';
import { RowNode } from 'ag-grid-community';

const styles = {
    table: (theme: Theme) => ({
        marginTop: theme.spacing(2.5),
        marginLeft: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
        overflow: 'auto',
    }),
};

const GENERATOR_INDEX = 1;

interface CustomHandsontableProps {}

registerAllModules();

const propertiesGetter = (params: RowNode) => {
    const properties = params?.data?.properties;
    if (properties && Object.keys(properties).length) {
        return Object.keys(properties)
            .map((property) => property + ' : ' + properties[property])
            .join(' | ');
    } else {
        return null;
    }
};

const initialConfiguration = TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)!.columns.map((column) => {
    return {
        header: column.header ?? column.id,
        readOnly: true,
        width: 100,
        height: 40,
        data: column.field,
    };
});

const isDataAltered = (hotTableComponent: RefObject<HotTableClass>) => {
    const initialColumnCount: number = TABLES_DEFINITION_INDEXES?.get(GENERATOR_INDEX)?.columns?.length as number;
    return (hotTableComponent?.current?.hotInstance?.countCols() as number) > initialColumnCount;
};

export function toLetters(num: number): string {
    var mod = num % 26,
        pow = (num / 26) | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
}

const pick = (obj: any, arr: any) => Object.fromEntries(Object.entries(obj).filter(([k]) => arr.includes(k)));

const CustomHandsontable: FunctionComponent<CustomHandsontableProps> = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const intl = useIntl();
    const hotTableComponent = useRef<HotTableClass>(null);

    const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);

    const equipmentDefinition = useMemo(
        () => ({
            type: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.type,
            fetchers: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.fetchers,
        }),
        []
    );

    const [columns, setColumns] = useState<any>(ColumnConfig1);

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            return formatFetchedEquipments(equipmentDefinition.type!, fetchedEquipments);
        },
        [equipmentDefinition.type]
    );

    const { equipments } = useSpreadsheetEquipments(equipmentDefinition, formatFetchedEquipmentsHandler);

    const getColHeaders = useCallback(() => {
        const headers = isDataAltered(hotTableComponent)
            ? (hotTableComponent.current?.hotInstance?.getColHeader() as string[])
            : columns.map((column: any, index: any) => intl.formatMessage({ id: column.header })) ?? [];

        return headers ?? [];
    }, [columns, intl]);

    const getNestedHeaders = useCallback(() => {
        const letters =
            columns?.map((column: any, index: any) => {
                return toLetters(index + 1);
            }) ?? [];

        return [letters, getColHeaders()];
    }, [columns, getColHeaders]);

    //NEEDED IF WE KEEP CUSTOM COLUMN ADDITION THROUGH COLUMN CONTEXT MENU
    /*    const data = useMemo(() => {
let initialData = equipments
? equipments?.map((equipment: any) => [
equipment.id,
equipment.name,
equipment.voltageLevelId,
equipment.country,
equipment.nominalVoltage,
equipment.energySource,
equipment.p,
equipment.q,
equipment.activePowerControl?.participate,
equipment.activePowerControl?.droop,
equipment.minP,
equipment.maxP,
equipment.targetP,
equipment.targetQ,
equipment.voltageRegulatorOn,
equipment.targetV,
equipment.coordinatedReactiveControl?.qPercent,
equipment.generatorShortCircuit?.directTransX,
equipment.generatorShortCircuit?.stepUpTransformerX,
equipment.generatorStartup?.plannedActivePowerSetPoint,
equipment.generatorStartup?.marginalCost,
equipment.generatorStartup?.plannedOutageRate,
equipment.generatorStartup?.forcedOutageRate,
equipment.terminalConnected,
equipment.RegulationTypeText,
equipment.RegulatingTerminalGenerator,
equipment.properties ? Object.values(equipment.properties).toString() : '',
])
: [];

if (isDataAltered(hotTableComponent)) {
hotTableComponent.current?.hotInstance
?.getCellMetaAtRow(0)
.filter((cellMeta) => cellMeta?.hasOwnProperty('addedColumn') && cellMeta?.hasOwnProperty('col'))
.map((cellMeta) => cellMeta?.col)
.forEach((index) => {
initialData.map((row: any[], rowIndex: number) => {
return row.splice(
index,
0,
hotTableComponent.current?.hotInstance?.getDataAtCell(rowIndex, index)
);
});
});
}
return initialData;
}, [equipments]);*/

    const hyperformulaInstance = HyperFormula.buildEmpty({
        licenseKey: 'internal-use-in-handsontable',
        useArrayArithmetic: true,
    });

    const tagCustomColumn = useCallback((index: number, amount: number, source?: ChangeSource) => {
        if (source && ['ContextMenu.columnLeft', 'ContextMenu.columnRight'].includes(source)) {
            hotTableComponent.current?.hotInstance?.setCellMeta(0, index, 'addedColumn', true);
        }
    }, []);

    const handleOpenFilterDialog = useCallback(() => {
        setOpenFilterDialog(true);
    }, []);

    const filtersPlugin = hotTableComponent.current?.hotInstance?.getPlugin('filters');

    const applyFilter = useCallback(
        (filter: any) => {
            evaluateFilter(studyUuid as UUID, currentNode?.id as UUID, filter.id).then((response) => {
                filtersPlugin?.clearConditions();
                const filterIds = response.map((equipment: any) => equipment.id);
                filtersPlugin?.addCondition(0, 'by_value', [filterIds]);
                filtersPlugin?.filter();
            });
        },
        [currentNode?.id, filtersPlugin, studyUuid]
    );

    const handleCloseFilterDialog = useCallback(
        (nodes: any) => {
            if (nodes.length === 1) {
                const filterData = nodes[0];
                applyFilter(filterData);
            }
            setOpenFilterDialog(false);
        },
        [applyFilter]
    );

    const swapColumnConfiguration = useCallback((columnConfig: any) => {
        setColumns(columnConfig);
    }, []);

    useEffect(() => {
        const equipmentData = equipments?.map((equipment: any) => {
            const mergedData = pick(
                equipment,
                columns.map((column: any) => column.data)
            );
            columns
                .filter((column: any) => {
                    return !Object.keys(equipment).includes(column.data);
                })
                .forEach((column: any) => {
                    mergedData[column.data] = undefined;
                });
            return mergedData;
        });

        if (equipmentData?.length > 0) {
            columns
                .filter((column: any) => column.formula)
                .forEach((column: any) => {
                    equipmentData[0][column.data] = column?.formula;
                });
        }

        hotTableComponent.current?.hotInstance?.loadData(equipmentData ?? []);
    }, [columns, equipments]);

    const customColumnName = useRef<any>();

    const saveConfiguration = useCallback(() => {
        const columnConfiguration = JSON.stringify(columns);
        const blob = new Blob([columnConfiguration], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'column_config3.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [columns]);

  console.log('HMA', columns, equipments);

    return (
        <>
            <Box>
                <Button onClick={handleOpenFilterDialog}>Open filter configuration</Button>
                <Button
                    onClick={() => {
                        filtersPlugin?.clearConditions();
                        filtersPlugin?.filter();
                    }}
                >
                    Clear filters
                </Button>
                <Button onClick={() => swapColumnConfiguration(initialConfiguration)}>Display all columns</Button>
                <Button onClick={() => swapColumnConfiguration(ColumnConfig1)}>Load column template 1</Button>
                <Button onClick={() => swapColumnConfiguration(ColumnConfig2)}>Load column template 2</Button>

                {openFilterDialog && (
                    <DirectoryItemSelector
                        open={openFilterDialog}
                        onClose={handleCloseFilterDialog}
                        types={[ElementType.FILTER]}
                        equipmentTypes={[equipmentDefinition.type as string]}
                        onlyLeaves={true}
                        multiSelect={false}
                        validationButtonText={intl.formatMessage({
                            id: 'validate',
                        })}
                        title={intl.formatMessage({
                            id: 'showSelectDirectoryDialog',
                        })}
                    />
                )}
                <GlobalFilterHandsontable
                    hotTableComponent={hotTableComponent}
                    hyperformulaInstance={hyperformulaInstance}
                    filtersPlugin={filtersPlugin}
                />

                <Grid container>
                    <Grid item xs={2}>
                        <TextField
                            margin="dense"
                            id="customColumnName"
                            label="customColumnName"
                            fullWidth
                            inputRef={customColumnName}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <Button
                            onClick={() => {
                                setColumns((prevColumns: any) => {
                                    return [
                                        ...prevColumns,
                                        {
                                            data: customColumnName.current?.value,
                                            header: customColumnName.current?.value,
                                            readOnly: false,
                                            width: 100,
                                            height: 40,
                                        },
                                    ];
                                });
                                hotTableComponent.current?.hotInstance?.updateSettings({
                                    nestedHeaders: getNestedHeaders(),
                                });
                            }}
                        >
                            Add custom column
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={saveConfiguration}>Save configuration</Button>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={styles.table}>
                <HotTable
                    ref={hotTableComponent}
                    height={'100%'}
                    rowHeaders={true}
                    filters={true}
                    dropdownMenu={true}
                    nestedHeaders={getNestedHeaders()}
                    formulas={{
                        engine: hyperformulaInstance,
                        sheetName: 'Sheet1',
                    }}
                    columns={columns}
                    autoWrapRow={false}
                    autoWrapCol={false}
                    autoRowSize={false}
                    autoColumnSize={false}
                    manualColumnResize={true}
                    manualRowResize={true}
                    contextMenu={true}
                    renderAllColumns={false}
                    renderAllRows={false}
                    viewportRowRenderingOffset={10}
                    viewportColumnRenderingOffset={5}
                    allowInsertColumn={true}
                    allowRemoveColumn={true}
                    afterCreateCol={tagCustomColumn}
                    afterLoadData={(sourceData, initialLoad, source) => {
                        let sheetId = hyperformulaInstance.getSheetId('Sheet1');
                        if (!Number.isInteger(sheetId)) {
                            const sheetName = hyperformulaInstance.addSheet('Sheet1');
                            sheetId = hyperformulaInstance.getSheetId(sheetName);
                        }
                        const data = hotTableComponent.current?.hotInstance?.getData();
                        if (data) {
                            hyperformulaInstance.setSheetContent(sheetId!, data);
                        }

                        columns
                            .filter((column: any) => column.formula)
                            .forEach((column: any) => {
                                const initialFormula = hotTableComponent?.current?.hotInstance?.getData(
                                    0,
                                    columns.indexOf(column)
                                );
                                if (initialFormula) {
                                    const autofillRes = hotTableComponent.current?.hotInstance?.runHooks(
                                        'beforeAutofill',
                                        initialFormula,
                                        new CellRange(
                                            new CellCoords(0, 6),
                                            new CellCoords(0, 6),
                                            new CellCoords(0, columns.indexOf(column))
                                        ),
                                        new CellRange(
                                            new CellCoords(1, columns.indexOf(column)),
                                            new CellCoords(
                                                hotTableComponent.current?.hotInstance?.countRows() - 1,
                                                columns.indexOf(column)
                                            ),
                                            new CellCoords(1, columns.indexOf(column))
                                        ),
                                        'down'
                                    );
                                    if (autofillRes) {
                                        hotTableComponent.current?.hotInstance?.populateFromArray(
                                            1,
                                            columns.indexOf(column),
                                            autofillRes
                                        );
                                        hyperformulaInstance.setCellContents(
                                            {
                                                sheet: 0,
                                                row: 1,
                                                col: columns.indexOf(column),
                                            },
                                            autofillRes
                                        );
                                    }
                                }
                            });
                    }}
                    licenseKey="non-commercial-and-evaluation"
                    fillHandle={'vertical'}
                    outsideClickDeselects={false}
                />
            </Box>
        </>
    );
};

export default CustomHandsontable;
