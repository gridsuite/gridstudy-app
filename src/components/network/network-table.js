/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Network from './network';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { IconButton, TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { updateConfigParameter } from '../../utils/rest-api';

import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import { SelectOptionsDialog } from '../../utils/dialogs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import {
    COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_COLUMNS_NAMES,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
} from './config-tables';
import { EquipmentTable } from './equipment-table';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';

const useStyles = makeStyles(() => ({
    searchSection: {
        paddingRight: '10px',
        alignItems: 'center',
    },
    table: {
        marginTop: '20px',
    },
    containerInputSearch: {
        marginTop: '15px',
        marginLeft: '10px',
    },
    checkboxSelectAll: {
        padding: '0 32px 15px 15px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    checkboxItem: {
        cursor: 'pointer',
    },
    selectColumns: {
        marginTop: '12px',
        marginLeft: '50px',
    },
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const { enqueueSnackbar } = useSnackbar();

    const allDisplayedColumnsNames = useSelector(
        (state) => state.allDisplayedColumnsNames
    );
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);
    const [rowFilter, setRowFilter] = useState(undefined);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const intl = useIntl();

    const intlRef = useIntlRef();

    useEffect(() => {
        setSelectedColumnsNames(
            new Set(JSON.parse(allDisplayedColumnsNames[tabIndex]))
        );
    }, [tabIndex, allDisplayedColumnsNames]);

    useEffect(() => {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (!props.network) return;
        props.network.useEquipment(resource);
    }, [props.network, tabIndex]);

    const getRows = useCallback(
        (index) => {
            const tableDefinition = TABLES_DEFINITION_INDEXES.get(index);
            return tableDefinition.getter
                ? tableDefinition.getter(props.network)
                : props.network[TABLES_DEFINITION_INDEXES.get(index).resource];
        },
        [props.network]
    );

    function getTabIndexFromEquipementType(equipmentType) {
        const definition = Object.values(TABLES_DEFINITIONS).find(
            (d) => d.name.toLowerCase() === equipmentType.toLowerCase()
        );
        return definition ? definition.index : 0;
    }

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    useEffect(() => {
        if (
            props.equipmentId !== null &&
            props.equipmentType !== null &&
            !manualTabSwitch
        ) {
            const newIndex = getTabIndexFromEquipementType(props.equipmentType);
            setTabIndex(newIndex); // select the right table type
            // calculate row index to scroll to
            const rows = getRows(newIndex);
            let index = rows.findIndex((r) => r.id === props.equipmentId);
            setScrollToIndex(index !== undefined ? index : 0);
        }
    }, [
        props.network,
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        getRows,
        manualTabSwitch,
    ]);

    function renderTable() {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        const rows = getRows(tabIndex);
        return (
            <EquipmentTable
                studyUuid={props.studyUuid}
                rows={rows}
                selectedColumnsNames={selectedColumnsNames}
                tableDefinition={TABLES_DEFINITION_INDEXES.get(tabIndex)}
                filter={filter}
                fetched={props.network.isResourceFetched(resource)}
                scrollToIndex={scrollToIndex}
                scrollToAlignment="start"
            />
        );
    }

    function setFilter(event) {
        const value = event.target.value;
        setRowFilter(
            !value || value === '' ? undefined : new RegExp(value, 'i')
        );
    }

    const filter = useCallback(
        (cell) => {
            if (!rowFilter) return true;
            let ok = false;
            Object.values(cell).forEach((value) => {
                if (rowFilter.test(value)) {
                    ok = true;
                }
            });

            return ok;
        },
        [rowFilter]
    );

    const handleOpenPopupSelectColumnNames = () => {
        setPopupSelectColumnNames(true);
    };

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        setSelectedColumnsNames(
            new Set(JSON.parse(allDisplayedColumnsNames[tabIndex]))
        );
        setPopupSelectColumnNames(false);
    }, [tabIndex, allDisplayedColumnsNames]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        updateConfigParameter(
            COLUMNS_PARAMETER_PREFIX_IN_DATABASE + TABLES_NAMES[tabIndex],
            JSON.stringify([...selectedColumnsNames])
        ).catch((errorMessage) => {
            setSelectedColumnsNames(
                new Set(JSON.parse(allDisplayedColumnsNames[tabIndex]))
            );
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsChangingError',
                    intlRef: intlRef,
                },
            });
        });

        setPopupSelectColumnNames(false);
    }, [
        tabIndex,
        selectedColumnsNames,
        allDisplayedColumnsNames,
        enqueueSnackbar,
        intlRef,
    ]);

    const handleToggle = (value) => () => {
        const newChecked = new Set(selectedColumnsNames.values());
        if (selectedColumnsNames.has(value)) {
            newChecked.delete(value);
        } else {
            newChecked.add(value);
        }
        setSelectedColumnsNames(newChecked);
    };

    const handleToggleAll = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        setSelectedColumnsNames(
            isAllChecked ? new Set() : TABLES_COLUMNS_NAMES[tabIndex]
        );
    };

    const checkListColumnsNames = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        let isSomeChecked = selectedColumnsNames.size !== 0 && !isAllChecked;
        return (
            <List>
                <ListItem
                    className={classes.checkboxSelectAll}
                    onClick={handleToggleAll}
                >
                    <Checkbox
                        checked={isAllChecked}
                        indeterminate={isSomeChecked}
                        color="primary"
                    />
                    <FormattedMessage id="CheckAll" />
                </ListItem>
                {[...TABLES_COLUMNS_NAMES[tabIndex]].map((value, index) => (
                    <ListItem
                        key={tabIndex + '-' + index}
                        className={classes.checkboxItem}
                        onClick={handleToggle(value)}
                        style={{ padding: '0 16px' }}
                    >
                        <ListItemIcon>
                            <Checkbox
                                checked={selectedColumnsNames.has(value)}
                                color="primary"
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={intl.formatMessage({ id: `${value}` })}
                        />
                    </ListItem>
                ))}
            </List>
        );
    };

    return (
        props.network && (
            <>
                <Grid container justify={'space-between'}>
                    <Grid container justify={'space-between'} item>
                        <Tabs
                            value={tabIndex}
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            onChange={(event, newValue) => {
                                setTabIndex(newValue);
                                setManualTabSwitch(true);
                            }}
                            aria-label="tables"
                        >
                            {Object.values(TABLES_DEFINITIONS).map((table) => (
                                <Tab
                                    key={table.name}
                                    label={intl.formatMessage({
                                        id: table.name,
                                    })}
                                />
                            ))}
                        </Tabs>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.containerInputSearch}>
                            <TextField
                                className={classes.textField}
                                size="small"
                                placeholder={
                                    intl.formatMessage({ id: 'filter' }) + '...'
                                }
                                onChange={setFilter}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    classes: {
                                        input: classes.searchSection,
                                    },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item className={classes.selectColumns}>
                            <span>
                                <FormattedMessage id="LabelSelectList" />
                            </span>
                            <IconButton
                                aria-label="dialog"
                                onClick={handleOpenPopupSelectColumnNames}
                            >
                                <ViewColumnIcon />
                            </IconButton>
                            <SelectOptionsDialog
                                open={popupSelectColumnNames}
                                onClose={handleCancelPopupSelectColumnNames}
                                onClick={handleSaveSelectedColumnNames}
                                title={intl.formatMessage({
                                    id: 'ColumnsList',
                                })}
                                child={checkListColumnsNames()}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.table} style={{ flexGrow: 1 }}>
                    {/*This render is fast, rerender full dom everytime*/}
                    {renderTable()}
                </div>
            </>
        )
    );
};

NetworkTable.defaultProps = {
    network: null,
    studyUuid: '',
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
};

export default NetworkTable;
