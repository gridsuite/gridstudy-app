import {
    FunctionComponent,
    RefObject,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { useSpreadsheetEquipments } from '../network/use-spreadsheet-equipments';
import { formatFetchedEquipments } from '../spreadsheet/utils/equipment-table-utils';
import { TABLES_DEFINITION_INDEXES } from '../spreadsheet/utils/config-tables';
import { Box, Theme } from '@mui/material';
import { registerAllModules } from 'handsontable/registry';
import { useIntl } from 'react-intl';
import { HyperFormula } from 'hyperformula';
import { ChangeSource } from 'handsontable/common';

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
    const initialColumnCount: number = TABLES_DEFINITION_INDEXES?.get(
        GENERATOR_INDEX
    )?.columns?.length as number;
    return (
        (hotTableComponent?.current?.hotInstance?.countCols() as number) >
        initialColumnCount
    );
};

const customColumnsIndexes = (hotTableComponent: RefObject<HotTableClass>) => {
    return (
        hotTableComponent.current?.hotInstance
            ?.getCellMetaAtRow(0)
            .filter((cellMeta) => cellMeta.hasOwnProperty('addedColumn'))
            .map((cellMeta) => cellMeta.col) ?? []
    );
};

const CustomHandsontable: FunctionComponent<CustomHandsontableProps> = () => {
    const intl = useIntl();
    const hotTableComponent = useRef<HotTableClass>(null);

    const equipmentDefinition = useMemo(
        () => ({
            type: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.type,
            fetchers: TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.fetchers,
        }),
        []
    );

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(
                equipmentDefinition.type as string,
                fetchedEquipments
            );
        },
        [equipmentDefinition.type]
    );

    const { equipments } = useSpreadsheetEquipments(
        equipmentDefinition,
        formatFetchedEquipmentsHandler
    );

    const hyperformulaInstance = HyperFormula.buildEmpty({
        licenseKey: 'internal-use-in-handsontable',
    });

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
                  equipment.properties
                      ? Object.values(equipment.properties).toString()
                      : '',
              ])
            : [];

        if (isDataAltered(hotTableComponent)) {
            customColumnsIndexes(hotTableComponent).forEach((index) => {
                initialData.map((row: any[], rowIndex: number) =>
                    row.splice(
                        index,
                        0,
                        hotTableComponent.current?.hotInstance?.getDataAtCell(
                            rowIndex,
                            index
                        )
                    )
                );
            });
        }
        return initialData;
    }, [equipments]);

    const getColHeaders = useCallback(() => {
        return isDataAltered(hotTableComponent)
            ? (hotTableComponent.current?.hotInstance?.getColHeader() as Array<string>)
            : TABLES_DEFINITION_INDEXES.get(GENERATOR_INDEX)?.columns.map(
                  (column, index) => intl.formatMessage({ id: column.id })
              );
    }, [intl]);

    const tagCustomColumn = useCallback(
        (index: number, amount: number, source?: ChangeSource) => {
            if (
                source &&
                ['ContextMenu.columnLeft', 'ContextMenu.columnRight'].includes(
                    source
                )
            ) {
                hotTableComponent.current?.hotInstance?.setCellMeta(
                    0,
                    index,
                    'addedColumn',
                    true
                );
            }
        },
        []
    );

    return (
        <Box sx={styles.table}>
            <HotTable
                ref={hotTableComponent}
                height="auto"
                data={data}
                rowHeaders={true}
                colHeaders={getColHeaders()}
                formulas={{
                    engine: hyperformulaInstance,
                    sheetName: 'Sheet1',
                }}
                autoWrapRow={true}
                autoWrapCol={true}
                contextMenu={true}
                allowInsertColumn={true}
                afterCreateCol={tagCustomColumn}
                licenseKey="non-commercial-and-evaluation"
                viewportRowRenderingOffset={10}
                viewportColumnRenderingOffset={2}
                beforeOnCellMouseDown={(event, coords, TD, controller) => {
                    const activeEditor =
                        hotTableComponent.current?.hotInstance?.getActiveEditor();
                    /*                    if (!activeEditor || !activeEditor?.isOpened()) {
                                  return;
                              }
                              const spreadsheetAddress = `${Handsontable.helper.spreadsheetColumnLabel(
                                  coords.col
                              )}${coords.row + 1}`;
          
                              hotTableComponent.current?.hotInstance?.getCellMeta()
          
                              activeEditor.value += spreadsheetAddress;*/
                }}
            />
        </Box>
    );
};

export default CustomHandsontable;
