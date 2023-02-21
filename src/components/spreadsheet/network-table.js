/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Network from '../network/network';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@mui/material/InputAdornment';
import { IconButton, TextField, Grid, Alert } from '@mui/material';
import {
    modifyGenerator,
    modifyLoad,
    requestNetworkChange,
    updateConfigParameter,
} from '../../utils/rest-api';
import {
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
} from './config-tables';
import { EquipmentTable } from './equipment-table';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import GetAppIcon from '@mui/icons-material/GetApp';
import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import {
    DefaultCellRenderer,
    NumericDefaultCellRenderer,
} from './cell-renderers';
import { ColumnsSettingsDialog } from './columns-settings-dialog';

const useStyles = makeStyles((theme) => ({
    searchSection: {
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    },
    table: {
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
    },
    containerInputSearch: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    selectColumns: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
    },
    exportCsv: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        position: 'absolute',
        right: 0,
    },
    blink: {
        animation: '$blink 2s infinite',
    },
    '@keyframes blink': {
        '0%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.1,
        },
    },
    disabledLabel: {
        color: theme.palette.text.disabled,
    },
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
}));

const NetworkTable = (props) => {
    const gridRef = useRef();

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const allDisplayedColumnsNames = useSelector(
        (state) => state.allDisplayedColumnsNames
    );
    const allLockedColumnsNames = useSelector(
        (state) => state.allLockedColumnsNames
    );
    const allReorderedTableDefinitionIndexes = useSelector(
        (state) => state.allReorderedTableDefinitionIndexes
    );

    const fluxConvention = useSelector((state) => state[PARAM_FLUX_CONVENTION]);

    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [
        reorderedTableDefinitionIndexes,
        setReorderedTableDefinitionIndexes,
    ] = useState([]);
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const searchTextInput = useRef(null);

    const intl = useIntl();

    const generateTableColumns = useCallback(
        (tabIndex) => {
            const generatedTableColumns = TABLES_DEFINITION_INDEXES.get(
                tabIndex
            )
                .columns.filter((c) => {
                    return selectedColumnsNames.has(c.id);
                })
                .map((column) => {
                    column.headerName = intl.formatMessage({ id: column.id });

                    if (!column.cellRenderer && column.numeric) {
                        column.cellRenderer = NumericDefaultCellRenderer;
                        column.cellRendererParams = {
                            loadFlowStatus: props.loadFlowStatus,
                            network: props.network,
                        };

                        if (column.normed) {
                            column.cellRendererParams.fluxConvention =
                                fluxConvention;
                        }
                    }

                    if (lockedColumnsNames.has(column.id)) {
                        column.pinned = 'left';
                        column.lockPinned = true;
                    } else {
                        column.pinned = undefined;
                        column.lockPinned = undefined;
                    }
                    return column;
                });

            if (generatedTableColumns.length) {
                function sortByIndex(a, b) {
                    if (reorderedTableDefinitionIndexes) {
                        if (
                            reorderedTableDefinitionIndexes.indexOf(a.id) <
                            reorderedTableDefinitionIndexes.indexOf(b.id)
                        ) {
                            return -1;
                        }
                        if (
                            reorderedTableDefinitionIndexes.indexOf(a.id) >
                            reorderedTableDefinitionIndexes.indexOf(b.id)
                        )
                            return 1;
                    }
                    return 0;
                }
                generatedTableColumns.sort(sortByIndex);
            }
            return generatedTableColumns;
        },
        [
            fluxConvention,
            intl,
            lockedColumnsNames,
            props.loadFlowStatus,
            props.network,
            reorderedTableDefinitionIndexes,
            selectedColumnsNames,
        ]
    );

    useEffect(() => {
        setColumnData(generateTableColumns(tabIndex));
    }, [tabIndex, generateTableColumns]);

    const getRows = useCallback(
        (index) => {
            if (props.disabled) {
                return [];
            }
            const tableDefinition = TABLES_DEFINITION_INDEXES.get(index);
            const datasourceRows = tableDefinition.getter
                ? tableDefinition.getter(props.network)
                : props.network[TABLES_DEFINITION_INDEXES.get(index).resource];

            if (!datasourceRows) return [];

            return datasourceRows;
        },
        [props.disabled, props.network]
    );

    const [rowData, setRowData] = useState(getRows(tabIndex));
    const [columnData, setColumnData] = useState(
        generateTableColumns(tabIndex)
    );

    const onTabChange = useCallback(() => {
        // when we change Tab, we dont want to keep/apply the search criteria
        if (
            !searchTextInput.current.value ||
            searchTextInput.current.value !== ''
        ) {
            searchTextInput.current.value = '';
        }
        gridRef?.current?.api.setFilterModel(null);
        gridRef?.current?.columnApi.applyColumnState({
            defaultState: { sort: null },
        });
    }, []);

    useEffect(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        const newSelectedColumns = new Set(
            allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []
        );
        setSelectedColumnsNames(newSelectedColumns);
    }, [tabIndex, allDisplayedColumnsNames]);

    useEffect(() => {
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(
            new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
        );
    }, [tabIndex, allLockedColumnsNames]);

    useEffect(() => {
        const allReorderedTemp = allReorderedTableDefinitionIndexes[tabIndex];
        setReorderedTableDefinitionIndexes(
            allReorderedTemp
                ? JSON.parse(allReorderedTemp)
                : TABLES_DEFINITION_INDEXES.get(tabIndex).columns.map(
                      (item) => item.id
                  )
        );
    }, [allReorderedTableDefinitionIndexes, tabIndex]);

    useEffect(() => {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (!props.network || props.disabled) return;
        props.network.useEquipment(resource);
    }, [props.network, props.disabled, tabIndex]);

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    function getTabIndexFromEquipementType(equipmentType) {
        const definition = Object.values(TABLES_DEFINITIONS).find(
            (d) => d.name.toLowerCase() === equipmentType.toLowerCase()
        );
        return definition ? definition.index : 0;
    }

    useEffect(() => {
        if (
            props.equipmentId !== null && // TODO always equals to true. Maybe this function is broken ?
            props.equipmentType !== null &&
            !manualTabSwitch
        ) {
            const newIndex = getTabIndexFromEquipementType(props.equipmentType);
            setTabIndex(newIndex); // select the right table type
            // calculate row index to scroll to
            const rows = getRows(newIndex);
            let index = rows.findIndex((r) => r.id === props.equipmentId);
            setScrollToIndex(index !== undefined ? index : -1);
        } else if (manualTabSwitch) {
            setScrollToIndex(-1);
        }
    }, [
        props.network,
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        getRows,
        manualTabSwitch,
    ]);

    function setFilter(event) {
        gridRef.current.api.setQuickFilter(event.target.value); // Value from the user's input
    }

    useEffect(() => {
        const tmpDataKeySet = new Set();
        TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((col) => selectedColumnsNames.has(col.id))
            .forEach((col) => tmpDataKeySet.add(col.dataKey));
        setRowData(getRows(tabIndex));
    }, [tabIndex, selectedColumnsNames, getRows]);

    useEffect(() => {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (props.network.isResourceFetched(resource)) {
            const rows = props.network[resource];
            rows.forEach((row, index) => {
                if (!row.id) row.id = index;
            });

            setRowData(rows);
        }
    }, [props.network, tabIndex]);

    const handleOpenPopupSelectColumnNames = () => {
        setPopupSelectColumnNames(true);
    };

    const handleColumnDrag = useCallback(
        (event) => {
            if (event.finished && event.column) {
                console.log(event);

                let reorderedTableDefinitionIndexesTemp = [
                    ...reorderedTableDefinitionIndexes,
                ];
                const [reorderedItem] =
                    reorderedTableDefinitionIndexesTemp.splice(
                        reorderedTableDefinitionIndexesTemp.indexOf(
                            event.column.colDef.id
                        ),
                        1
                    );
                reorderedTableDefinitionIndexesTemp.splice(
                    event.toIndex,
                    0,
                    reorderedItem
                );

                setReorderedTableDefinitionIndexes(
                    reorderedTableDefinitionIndexesTemp
                );

                updateConfigParameter(
                    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                        TABLES_NAMES[tabIndex],
                    JSON.stringify(reorderedTableDefinitionIndexesTemp)
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });

                const columnDataTemp = columnData;
                const [reorderedColDef] = columnData.splice(
                    columnData.indexOf(
                        columnData.find((obj) => {
                            return obj.id === event.column.colDef.id;
                        })
                    ),
                    1
                );
                columnDataTemp.splice(event.toIndex, 0, reorderedColDef);
                setColumnData(columnDataTemp);
            }
        },
        [columnData, reorderedTableDefinitionIndexes, snackError, tabIndex]
    );

    const getCSVFilename = useCallback(() => {
        const tabName = TABLES_DEFINITION_INDEXES.get(tabIndex).name;
        const localisedTabName = intl.formatMessage({ id: tabName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tabIndex]);

    const downloadCSVData = useCallback(() => {
        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            fileName: getCSVFilename(),
        });
    }, [getCSVFilename]);

    const onCellEditRequest = useCallback((event) => {
        const oldData = event.data;
        const field = event.colDef.field;

        const newValue = event.newValue;
        const newData = { ...oldData };

        if (event.colDef.valueSetter) {
            event.colDef.valueSetter(event);
        } else {
            newData[field] = event.newValue;
        }
        console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);
        const tx = {
            update: [newData],
        };
        event.api.applyTransaction(tx);
    }, []);

    function commitChanges(event) {
        function capitaliseFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        // TODO: generic groovy updates should be replaced by specific hypothesis creations, like modifyLoad() below
        // TODO: when no more groovy, remove changeCmd everywhere, remove requestNetworkChange()
        let groovyCr =
            'equipment = network.get' +
            capitaliseFirst(
                TABLES_DEFINITION_INDEXES.get(tabIndex).modifiableEquipmentType
            ) +
            "('" +
            event.data.id.replace(/'/g, "\\'") +
            "')\n";

        const isTransformer =
            event.data?.equipmentType ===
                TABLES_DEFINITIONS.TWO_WINDINGS_TRANSFORMERS
                    .modifiableEquipmentType ||
            event.data?.equipmentType ===
                TABLES_DEFINITIONS.THREE_WINDINGS_TRANSFORMERS
                    .modifiableEquipmentType;

        Object.values(event.data.data).forEach((cr) => {
            //TODO this is when we change transformer, in case we want to change the tap position from spreadsheet, we set it inside
            // tapChanger object. so we extract the value from the object before registering a change request.
            // this part should be removed if we don't pass tapPosition inside another Object anymore

            const val =
                isTransformer && cr.value?.tapPosition
                    ? cr.value?.tapPosition
                    : cr.value;

            groovyCr += cr.changeCmd.replace(/\{\}/g, val) + '\n';
        });

        Promise.resolve(
            event.data.equipmentType === 'load'
                ? modifyLoad(
                      props.studyUuid,
                      props.currentNode?.id,
                      event.data.id,
                      event.data.name?.value,
                      event.data.type?.value,
                      event.data.p0?.value,
                      event.data.q0?.value,
                      undefined,
                      undefined,
                      false,
                      undefined
                  )
                : event.data.equipmentType === 'generator'
                ? modifyGenerator(
                      props.studyUuid,
                      props.currentNode?.id,
                      event.data.id,
                      event.data.name?.value,
                      event.data.energySource?.value,
                      event.data.minP?.value,
                      event.data.maxP?.value,
                      undefined,
                      event.data.targetP?.value,
                      event.data.targetQ?.value,
                      event.data.voltageRegulatorOn?.value,
                      event.data.targetV?.value,
                      undefined,
                      undefined,
                      undefined
                  )
                : requestNetworkChange(
                      props.studyUuid,
                      props.currentNode?.id,
                      groovyCr
                  )
        )
            .then(() => {})
            .catch((promiseErrorMsg) => {
                console.error(promiseErrorMsg);
                let message = intl.formatMessage({
                    id: 'paramsChangingDenied',
                });
                snackError({
                    messageTxt: message,
                    headerId: 'paramsChangingError',
                });
            });
    }

    return (
        props.network && (
            <>
                <Grid container justifyContent={'space-between'}>
                    <Grid container justifyContent={'space-between'} item>
                        <Tabs
                            value={tabIndex}
                            variant="scrollable"
                            onChange={(event, newValue) => {
                                setTabIndex(newValue);
                                setManualTabSwitch(true);
                                onTabChange(newValue);
                            }}
                            aria-label="tables"
                        >
                            {Object.values(TABLES_DEFINITIONS).map((table) => (
                                <Tab
                                    key={table.name}
                                    label={intl.formatMessage({
                                        id: table.name,
                                    })}
                                    disabled={props.disabled}
                                />
                            ))}
                        </Tabs>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.containerInputSearch}>
                            <TextField
                                disabled={props.disabled}
                                className={classes.textField}
                                size="small"
                                placeholder={
                                    intl.formatMessage({ id: 'filter' }) + '...'
                                }
                                onChange={setFilter}
                                inputRef={searchTextInput}
                                fullWidth
                                InputProps={{
                                    classes: {
                                        input: classes.searchSection,
                                    },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon
                                                color={
                                                    props.disabled
                                                        ? 'disabled'
                                                        : 'inherit'
                                                }
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item className={classes.selectColumns}>
                            <span
                                className={clsx({
                                    [classes.disabledLabel]: props.disabled,
                                })}
                            >
                                <FormattedMessage id="LabelSelectList" />
                            </span>
                            <IconButton
                                disabled={props.disabled}
                                className={
                                    selectedColumnsNames.size === 0
                                        ? classes.blink
                                        : ''
                                }
                                aria-label="dialog"
                                onClick={handleOpenPopupSelectColumnNames}
                            >
                                <ViewColumnIcon />
                            </IconButton>
                        </Grid>
                        {props.disabled && (
                            <Alert
                                className={classes.invalidNode}
                                severity="warning"
                            >
                                <FormattedMessage id="InvalidNode" />
                            </Alert>
                        )}
                        <Grid item className={classes.exportCsv}>
                            <span
                                className={clsx({
                                    [classes.disabledLabel]:
                                        props.disabled || rowData.length === 0,
                                })}
                            >
                                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                            </span>
                            <span>
                                <IconButton
                                    disabled={
                                        props.disabled || rowData.length === 0
                                    }
                                    aria-label="exportCSVButton"
                                    onClick={downloadCSVData}
                                >
                                    <GetAppIcon />
                                </IconButton>
                            </span>
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.table} style={{ flexGrow: 1 }}>
                    <EquipmentTable
                        gridRef={gridRef}
                        currentNode={props.currentNode}
                        rows={rowData}
                        columns={columnData}
                        fetched={props.network.isResourceFetched(
                            TABLES_DEFINITION_INDEXES.get(tabIndex).resource
                        )}
                        scrollTop={scrollToIndex}
                        visible={props.visible}
                        handleColumnDrag={handleColumnDrag}
                        commitChanges={commitChanges}
                        onCellEditRequest={onCellEditRequest}
                    />
                </div>

                <ColumnsSettingsDialog
                    popupSelectColumnNames={popupSelectColumnNames}
                    tabIndex={tabIndex}
                    handleClose={() => {
                        setPopupSelectColumnNames(false);
                    }}
                    reorderedTableDefinitionIndexes={
                        reorderedTableDefinitionIndexes
                    }
                    selectedColumnsNames={selectedColumnsNames}
                    setSelectedColumnsNames={setSelectedColumnsNames}
                    lockedColumnsNames={lockedColumnsNames}
                    setLockedColumnsNames={setLockedColumnsNames}
                />
            </>
        )
    );
};

NetworkTable.defaultProps = {
    network: null,
    studyUuid: '',
    currentNode: null,
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
    loadFlowStatus: RunningStatus.IDLE,
    disabled: false,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    disabled: PropTypes.bool,
};

export default NetworkTable;
