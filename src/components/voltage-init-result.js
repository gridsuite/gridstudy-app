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
import { LinearProgress, Stack, Typography } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    cloneVoltageInitModifications,
    fetchVoltageInitResult,
    getVoltageInitModifications,
} from '../services/study/voltage-init';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import VoltageInitModificationDialog from './dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import { FetchStatus } from '../services/utils';
import { ComputationReportViewer } from './results/common/computation-report-viewer';
import { REPORT_TYPES } from './utils/report-type';
import { useOpenLoaderShortWait } from './dialogs/commons/handle-loader';
import { RunningStatus } from './utils/running-status';
import { RESULTS_LOADING_DELAY } from './network/constants';
import { RenderTableAndExportCsv } from './utils/renderTable-ExportCsv';

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
        marginLeft: '5px',
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
    typography: {
        fontWeight: 'bold',
    },
    secondTypography: {
        marginLeft: '5em',
        fontWeight: 'bold',
    },
    totalTypography: {
        marginLeft: '10px',
    },
};

const VoltageInitResult = ({ result, status, tabIndex, setTabIndex }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { snackError } = useSnackMessage();

    const [resultToShow, setResultToShow] = useState(result);
    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !resultToShow || !resultToShow.modificationsGroupUuid
    );
    const [applyingModifications, setApplyingModifications] = useState(false);
    const [previewModificationsDialogOpen, setPreviewModificationsDialogOpen] =
        useState(false);
    const [voltageInitModification, setVoltageInitModification] = useState();

    const intl = useIntl();

    const viNotif = useSelector((state) => state.voltageInitNotif);

    const openLoader = useOpenLoaderShortWait({
        isLoading: status === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    useEffect(() => {
        fetchVoltageInitResult(studyUuid, currentNode.id).then((res) => {
            setResultToShow(res);
        });
    }, [viNotif, disabledApplyModifications, studyUuid, currentNode.id]);

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

    function renderTotalReactiveSlacks(reactiveSlacks) {
        const calculateTotal = (reactiveSlacks, isPositive) => {
            return reactiveSlacks
                ? reactiveSlacks
                      .filter((reactiveSlack) =>
                          isPositive
                              ? reactiveSlack.slack > 0
                              : reactiveSlack.slack < 0
                      )
                      .reduce(
                          (sum, reactiveSlack) => sum + reactiveSlack.slack,
                          0
                      )
                : 0;
        };

        const totalInjection = calculateTotal(reactiveSlacks, false);
        const totalConsumption = calculateTotal(reactiveSlacks, true);
        return (
            <>
                <Stack
                    direction={'row'}
                    gap={1}
                    marginBottom={2}
                    marginTop={1.5}
                    marginLeft={2}
                >
                    <>
                        <Typography sx={styles.typography}>
                            <FormattedMessage id="TotalInjection" />
                        </Typography>
                        <Typography sx={styles.totalTypography}>
                            {totalInjection.toFixed(2)}
                        </Typography>

                        <Typography sx={styles.secondTypography}>
                            <FormattedMessage id="TotalConsumption" />
                        </Typography>
                        <Typography sx={styles.totalTypography}>
                            {totalConsumption.toFixed(2)}
                        </Typography>
                    </>
                </Stack>
            </>
        );
    }

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
                    marginBottom={2}
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
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={indicatorsColumnDefs}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({ id: 'Indicators' })}
                    rows={rows}
                    onRowDataUpdated={onRowDataUpdated}
                    skipColumnHeaders={true}
                />
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
        return (
            <>
                {renderTotalReactiveSlacks(reactiveSlacks)}

                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={reactiveSlacksColumnDefs}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({ id: 'ReactiveSlacks' })}
                    rows={reactiveSlacks}
                    onRowDataUpdated={onRowDataUpdated}
                    skipColumnHeaders={true}
                />
            </>
        );
    }

    const renderReportViewer = () => {
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoader && <LinearProgress />}
                </Box>
                {(status === RunningStatus.SUCCEED ||
                    status === RunningStatus.FAILED) && (
                    <ComputationReportViewer
                        reportType={REPORT_TYPES.VOLTAGE_INIT}
                    />
                )}
            </>
        );
    };

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
                            <Tab
                                label={
                                    <FormattedMessage
                                        id={'ComputationResultsLogs'}
                                    />
                                }
                            />
                        </Tabs>
                    </Box>

                    <Box sx={styles.buttonApplyModifications}>
                        <Button
                            variant="outlined"
                            onClick={previewModifications}
                            disabled={
                                !resultToShow ||
                                !resultToShow.modificationsGroupUuid ||
                                disabledApplyModifications
                            }
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
                    {tabIndex === 2 && renderReportViewer()}
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
