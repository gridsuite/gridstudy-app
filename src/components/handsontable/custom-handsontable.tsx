import { FunctionComponent, RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { useSpreadsheetEquipments } from '../network/use-spreadsheet-equipments';
import { formatFetchedEquipments } from '../spreadsheet/utils/equipment-table-utils';
import { TABLES_DEFINITION_INDEXES } from '../spreadsheet/utils/config-tables';
import { Box, Theme } from '@mui/material';
import { registerAllModules } from 'handsontable/registry';
import { useIntl } from 'react-intl';
import { HyperFormula } from 'hyperformula';
import { ChangeSource } from 'handsontable/common';
import { GlobalFilterHandsontable } from './global-filter-handsontable';
import { FilterTableDialog } from './table-filter';
import Button from '@mui/material/Button';
import {
    DirectoryItemSelector,
    DirectoryItemsInput,
    ElementType,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { evaluateFilter, evaluateJsonFilter } from '../../services/study/filter';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { UUID } from 'crypto';

const styles = {
    table: (theme: Theme) => ({
        marginTop: theme.spacing(2.5),
        marginLeft: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
        overflow: 'auto',
    }),
};

const GENERATOR_INDEX = 5;

interface CustomHandsontableProps {}

registerAllModules();

const isDataAltered = (hotTableComponent: RefObject<HotTableClass>) => {
    const initialColumnCount: number = TABLES_DEFINITION_INDEXES?.get(GENERATOR_INDEX)?.columns?.length as number;
    return (hotTableComponent?.current?.hotInstance?.countCols() as number) > initialColumnCount;
};

function toLetters(num: number): string {
    var mod = num % 26,
        pow = (num / 26) | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
}

const CustomHandsontable: FunctionComponent<CustomHandsontableProps> = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const intl = useIntl();
    const hotTableComponent = useRef<HotTableClass>(null);
    const [customColumnsIndexes, setCustomColumnsIndexes] = useState<number[]>([]);

    const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);

    const equipmentDefinition = useMemo(
        () => ({
            type: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.type,
            fetchers: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.fetchers,
        }),
        []
    );

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            return formatFetchedEquipments(equipmentDefinition.type!, fetchedEquipments);
        },
        [equipmentDefinition.type]
    );

    const { equipments } = useSpreadsheetEquipments(equipmentDefinition, formatFetchedEquipmentsHandler);

    const hyperformulaInstance = HyperFormula.buildEmpty({
        licenseKey: 'internal-use-in-handsontable',
    });

    const getColHeaders = useCallback(() => {
        const headers = isDataAltered(hotTableComponent)
            ? (hotTableComponent.current?.hotInstance?.getColHeader() as string[])
            : TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.columns.map((column, index) =>
                  intl.formatMessage({ id: column.id })
              ) ?? [];

        const columnLabel = 'Custom column';
        hotTableComponent.current?.hotInstance
            ?.getCellMetaAtRow(0)
            .filter((cellMeta) => cellMeta?.hasOwnProperty('addedColumn') && cellMeta?.hasOwnProperty('col'))
            .map((cellMeta) => cellMeta?.col)
            .forEach((customColumnIndex, index) => {
                if (headers[customColumnIndex] !== columnLabel) {
                    headers.splice(customColumnIndex, 0, columnLabel);
                }
            });
        return headers ?? [];
    }, [intl]);

    const getNestedHeaders = useCallback(() => {
        const letters =
            hotTableComponent.current?.hotInstance?.getColHeader()?.map((column, index) => {
                return toLetters(index + 1);
            }) ?? [];

        return [letters, getColHeaders()];
    }, [getColHeaders]);

    const data = useMemo(() => {
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
    }, [equipments]);

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
            console.log(filter);
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

    return (
        <Box sx={styles.table}>
            {/*<NodePicker
                value={selectedCompareNodeId ?? ''}
                handleSelectedNode={handleSelectedNode}
            />*/}
            <Button onClick={handleOpenFilterDialog} variant="text">
                Open filter configuration
            </Button>

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

            {/*            <FilterTableDialog
                open={openFilterDialog}
                onClose={handleCloseFilterDialog}
            />*/}
            <GlobalFilterHandsontable hotTableComponent={hotTableComponent} />
            <HotTable
                ref={hotTableComponent}
                height="auto"
                data={data}
                rowHeaders={true}
                filters={true}
                dropdownMenu={true}
                nestedHeaders={getNestedHeaders()}
                formulas={{
                    engine: hyperformulaInstance,
                    sheetName: 'Sheet1',
                }}
                autoWrapRow={true}
                autoWrapCol={true}
                contextMenu={true}
                allowInsertColumn={true}
                allowRemoveColumn={true}
                afterCreateCol={tagCustomColumn}
                afterSetCellMeta={(row, column, key, value) => {
                    const previousIndexes =
                        hotTableComponent.current?.hotInstance
                            ?.getCellMetaAtRow(0)
                            .filter(
                                (cellMeta) => cellMeta?.hasOwnProperty('addedColumn') && cellMeta?.hasOwnProperty('col')
                            )
                            .map((cellMeta) => {
                                console.log(cellMeta);
                                return cellMeta?.col;
                            }) ?? [];

                    setCustomColumnsIndexes(() => [...previousIndexes, column]);
                }}
                licenseKey="non-commercial-and-evaluation"
                viewportRowRenderingOffset={10}
                /*beforeOnCellMouseDown={(event, coords, TD, controller) => {
const activeEditor =
hotTableComponent.current?.hotInstance?.getActiveEditor();
hotTableComponent.current?.hotInstance
?.getFocusManager()
.setFocusMode('cell');
if (activeEditor && activeEditor.isOpened()) {
controller.cell = true;
activeEditor.setValue(
activeEditor.getValue() +
hotTableComponent.current?.hotInstance?.getColHeader(
coords.col
) +
(coords.row + 1)
);
activeEditor.focus();
}
}}*/
                afterOnCellMouseDown={(event, coords, TD) => {
                    /*const activeEditor =
hotTableComponent.current?.hotInstance?.getActiveEditor();
if (activeEditor && activeEditor.isOpened()) {
console.log(activeEditor.getValue());
}
activeEditor?.focus();*/
                }}
                fillHandle={'vertical'}
            />
        </Box>
    );
};

export default CustomHandsontable;
