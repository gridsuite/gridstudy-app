/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    useCallback,
    useState,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Stack, Typography } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    cloneVoltageInitModifications,
    getVoltageInitModifications,
} from '../services/study/voltage-init';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import VoltageInitModificationDialog from './dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import { FetchStatus } from '../services/utils';
import { CustomAGGrid } from './custom-aggrid/custom-aggrid';
import { CsvExport } from './spreadsheet/export-csv';

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    succeed: {
        color: green[500],
    },
    fail: {
        color: red[500],
    },
    buttonApplyModifications: {
        display: 'flex',
        position: 'relative',
    },
    labelAppliedModifications: {
        display: 'flex',
        position: 'relative',
        marginTop: '12px',
        marginLeft: '20px',
    },
    gridContainer: {
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

const VoltageInitResult = ({ result, status }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { snackError } = useSnackMessage();

    const [resultToShow, setResultToShow] = useState(result);

    const [tabIndex, setTabIndex] = useState(0);
    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !resultToShow || !resultToShow.modificationsGroupUuid
    );
    const [applyingModifications, setApplyingModifications] = useState(false);
    const [previewModificationsDialogOpen, setPreviewModificationsDialogOpen] =
        useState(false);
    const [voltageInitModification, setVoltageInitModification] = useState();

    const intl = useIntl();

    const viNotif = useSelector((state) => state.voltageInitNotif);

    useEffect(() => {
        setDisableApplyModifications(
            !resultToShow || !resultToShow.modificationsGroupUuid
        );
    }, [resultToShow, setDisableApplyModifications]);

    const closePreviewModificationsDialog = () => {
        setPreviewModificationsDialogOpen(false);
    };
    const gridRef = useRef();
    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: false,
            lockPinned: true,
            wrapHeaderText: true,
        }),
        []
    );
    const onRowDataUpdated = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const applyModifications = () => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        cloneVoltageInitModifications(studyUuid, currentNode.id)
            .then(() => {
                setApplyingModifications(false);
                setResultToShow({
                    ...resultToShow,
                    modificationsGroupUuid: null,
                });
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCloneVoltageInitModificationMsg',
                });
                setDisableApplyModifications(false);
                setApplyingModifications(false);
            });
    };

    const previewModifications = useCallback(() => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        getVoltageInitModifications(studyUuid, currentNode.id)
            .then((modificationList) => {
                // this endpoint returns a list, but we are expecting a single modification here
                setVoltageInitModification(modificationList.at(0));
                setPreviewModificationsDialogOpen(true);
                setDisableApplyModifications(false);
                setApplyingModifications(false);
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errPreviewVoltageInitModificationMsg',
                });
                setDisableApplyModifications(false);
                setApplyingModifications(false);
            });
    }, [
        currentNode?.id,
        snackError,
        studyUuid,
        setVoltageInitModification,
        setPreviewModificationsDialogOpen,
    ]);

    const renderPreviewModificationsDialog = () => {
        return (
            <VoltageInitModificationDialog
                currentNode={currentNode.id}
                studyUuid={studyUuid}
                editData={voltageInitModification}
                onClose={() => closePreviewModificationsDialog(false)}
                onPreviewModeSubmit={applyModifications}
                editDataFetchStatus={FetchStatus.IDLE}
                dialogProps={undefined}
            />
        );
    };
    const indicatorsColumnDefs = useMemo(() => {
        return [
            {
                field: 'key',
            },
            {
                field: 'value',
            },
        ];
    }, []);

    const renderTableAndExportCSV = (
        gridRef,
        columns,
        tableName,
        rows,
        headerHeight,
        skipColumnHeaders
    ) => {
        return (
            <Box sx={styles.gridContainer}>
                <Box sx={styles.csvExport}>
                    <Box style={{ flexGrow: 1 }}></Box>
                    <CsvExport
                        gridRef={gridRef}
                        columns={columns}
                        tableName={tableName}
                        disabled={rows.length === 0}
                        skipColumnHeaders={skipColumnHeaders}
                    />
                </Box>
                <Box sx={styles.grid}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rows}
                        headerHeight={headerHeight}
                        defaultColDef={defaultColDef}
                        columnDefs={columns}
                        onRowDataUpdated={onRowDataUpdated}
                    />
                </Box>
            </Box>
        );
    };
    function renderIndicatorsTable(indicators) {
        const rows = indicators
            ? Object.entries(indicators).map((i) => {
                  return { key: i[0], value: i[1] };
              })
            : null;
        const color = status === 'SUCCEED' ? styles.succeed : styles.fail;
        const statusToShow = status === 'SUCCEED' ? 'OK' : 'KO';
        return (
            <>
                <Stack
                    direction={'row'}
                    gap={1}
                    marginBottom={-4.5}
                    marginTop={1.5}
                    marginLeft={2}
                >
                    <Typography style={{ fontWeight: 'bold' }}>
                        <FormattedMessage id="VoltageInitStatus" />
                        <span style={{ marginLeft: '4px' }}>
                            {statusToShow}
                        </span>
                    </Typography>
                    <Lens fontSize={'medium'} sx={color} />
                </Stack>
                {renderTableAndExportCSV(
                    gridRef,
                    indicatorsColumnDefs,
                    intl.formatMessage({ id: 'Indicators' }),
                    rows,
                    0,
                    true
                )}
            </>
        );
    }

    const reactiveSlacksColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'busId',
            },
            {
                headerName: intl.formatMessage({ id: 'Slack' }),
                field: 'slack',
                numeric: true,
            },
        ];
    }, [intl]);

    function renderReactiveSlacksTable(reactiveSlacks) {
        return renderTableAndExportCSV(
            gridRef,
            reactiveSlacksColumnDefs,
            intl.formatMessage({ id: 'ReactiveSlacks' }),
            reactiveSlacks
        );
    }

    function renderTabs() {
        return (
            <>
                <Box sx={styles.container}>
                    <Box sx={styles.tabs}>
                        <Tabs
                            value={tabIndex}
                            onChange={(event, newTabIndex) =>
                                setTabIndex(newTabIndex)
                            }
                        >
                            <Tab
                                label={intl.formatMessage({ id: 'Indicators' })}
                            />
                            <Tab
                                label={intl.formatMessage({
                                    id: 'ReactiveSlacks',
                                })}
                            />
                        </Tabs>
                    </Box>

                    <Box sx={styles.buttonApplyModifications}>
                        <Button
                            variant="outlined"
                            onClick={previewModifications}
                            disabled={disabledApplyModifications}
                        >
                            <FormattedMessage id="previewModifications" />
                        </Button>
                        {previewModificationsDialogOpen &&
                            renderPreviewModificationsDialog()}
                        {resultToShow &&
                            !resultToShow.modificationsGroupUuid && (
                                <div style={styles.labelAppliedModifications}>
                                    <FormattedMessage id="modificationsAlreadyApplied" />
                                </div>
                            )}
                        {applyingModifications && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '5px',
                                    marginLeft: '20px',
                                }}
                            >
                                <CircularProgress />
                            </div>
                        )}
                    </Box>
                </Box>
                <div style={{ flexGrow: 1 }}>
                    {viNotif &&
                        resultToShow &&
                        tabIndex === 0 &&
                        renderIndicatorsTable(resultToShow.indicators)}
                    {viNotif &&
                        resultToShow &&
                        tabIndex === 1 &&
                        renderReactiveSlacksTable(resultToShow.reactiveSlacks)}
                </div>
            </>
        );
    }

    return renderTabs();
};

VoltageInitResult.defaultProps = {
    result: null,
};

VoltageInitResult.propTypes = {
    result: PropTypes.object,
};

export default VoltageInitResult;
