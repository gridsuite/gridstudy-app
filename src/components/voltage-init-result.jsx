/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    cloneVoltageInitModifications,
    getVoltageInitModifications,
    getVoltageInitStudyParameters,
} from '../services/study/voltage-init';
import CircularProgress from '@mui/material/CircularProgress';
import VoltageInitModificationDialog from './dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import { FetchStatus } from '../services/utils';
import { ComputationReportViewer } from './results/common/computation-report-viewer';
import { useOpenLoaderShortWait } from './dialogs/commons/handle-loader';
import { RunningStatus } from './utils/running-status';
import { RESULTS_LOADING_DELAY } from './network/constants';
import { RenderTableAndExportCsv } from './utils/renderTable-ExportCsv';
import ComputingType from './computing-status/computing-type';

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
    succeed: (theme) => ({
        color: theme.palette.success.main,
    }),
    fail: (theme) => ({
        color: theme.palette.error.main,
    }),
    buttonApplyModifications: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
    }),
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
    reactiveSlacksOverThresholdTypography: {
        marginLeft: '80px',
        fontWeight: 'bold',
        color: 'orange',
    },
};

const VoltageInitResult = ({ result, status }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);
    const { snackError } = useSnackMessage();

    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !result || !result.modificationsGroupUuid
    );
    const [applyingModifications, setApplyingModifications] = useState(false);
    const [previewModificationsDialogOpen, setPreviewModificationsDialogOpen] = useState(false);
    const [voltageInitModification, setVoltageInitModification] = useState();

    const intl = useIntl();

    const openLoader = useOpenLoaderShortWait({
        isLoading: status === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const closePreviewModificationsDialog = () => {
        setPreviewModificationsDialogOpen(false);
    };
    const gridRef = useRef();
    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: false,
            lockPinned: true,
            wrapHeaderText: true,
            lockVisible: true,
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
        cloneVoltageInitModifications(studyUuid, currentNode.id, currentRootNetworkUuid)
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errCloneVoltageInitModificationMsg',
                });
                setDisableApplyModifications(false);
            })
            .finally(() => {
                setApplyingModifications(false);
            });
    };

    const previewModifications = useCallback(() => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        getVoltageInitModifications(studyUuid, currentNode.id, currentRootNetworkUuid)
            .then((modificationList) => {
                // this endpoint returns a list, but we are expecting a single modification here
                setVoltageInitModification(modificationList.at(0));
                setPreviewModificationsDialogOpen(true);
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'errPreviewVoltageInitModificationMsg',
                });
            })
            .finally(() => {
                setDisableApplyModifications(false);
                setApplyingModifications(false);
            });
    }, [
        currentNode?.id,
        currentRootNetworkUuid,
        snackError,
        studyUuid,
        setVoltageInitModification,
        setPreviewModificationsDialogOpen,
    ]);

    const [autoApplyModifications, setAutoApplyModifications] = useState(false);

    useEffect(() => {
        getVoltageInitStudyParameters(studyUuid).then((voltageInitParameters) => {
            setAutoApplyModifications(voltageInitParameters?.applyModifications ?? false);
        });
    }, [studyUuid]);

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
                disabledSave={autoApplyModifications}
            />
        );
    };
    const indicatorsColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'Key' }),
                field: 'key',
                colId: 'key',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Key' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                colId: 'value',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Value' }) },
            },
        ];
    }, [intl]);

    function renderHeaderReactiveSlacks(result) {
        const calculateTotal = (reactiveSlacks, isPositive) => {
            return reactiveSlacks
                ? reactiveSlacks
                      .filter((reactiveSlack) => (isPositive ? reactiveSlack.slack > 0 : reactiveSlack.slack < 0))
                      .reduce((sum, reactiveSlack) => sum + reactiveSlack.slack, 0)
                : 0;
        };

        const totalInjection = calculateTotal(result.reactiveSlacks, false);
        const totalConsumption = calculateTotal(result.reactiveSlacks, true);
        return (
            <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                <Typography sx={styles.typography}>
                    <FormattedMessage id="TotalInjection" />
                </Typography>
                <Typography sx={styles.totalTypography}>{totalInjection.toFixed(2)} MVar</Typography>

                <Typography sx={styles.secondTypography}>
                    <FormattedMessage id="TotalConsumption" />
                </Typography>
                <Typography sx={styles.totalTypography}>{totalConsumption.toFixed(2)} MVar</Typography>

                {result.reactiveSlacksOverThreshold && (
                    <Typography sx={styles.reactiveSlacksOverThresholdTypography}>
                        <FormattedMessage
                            id={'REACTIVE_SLACKS_OVER_THRESHOLD'}
                            values={{
                                threshold: result.reactiveSlacksThreshold,
                            }}
                        />
                    </Typography>
                )}
            </Stack>
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
                <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                    <Typography style={{ fontWeight: 'bold' }}>
                        <FormattedMessage id="VoltageInitStatus" />
                        <span style={{ marginLeft: '4px' }}>{statusToShow}</span>
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
                    skipColumnHeaders={false}
                />
            </>
        );
    }

    const reactiveSlacksColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'busId',
                colId: 'busId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'BusId' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'Slack' }),
                field: 'slack',
                colId: 'slack',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'Slack' }) },
                numeric: true,
            },
        ];
    }, [intl]);

    function renderReactiveSlacksTable(result) {
        return (
            <>
                {renderHeaderReactiveSlacks(result)}

                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={reactiveSlacksColumnDefs}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({ id: 'ReactiveSlacks' })}
                    rows={result.reactiveSlacks}
                    onRowDataUpdated={onRowDataUpdated}
                    skipColumnHeaders={false}
                />
            </>
        );
    }

    const formatValue = (value, precision, intl) => {
        return isNaN(value) ? intl.formatMessage({ id: 'Undefined' }) : value.toFixed(precision);
    };

    const busVoltagesColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'busId',
                colId: 'busId',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'BusId' }) },
            },
            {
                headerName: intl.formatMessage({ id: 'BusVoltage' }),
                field: 'v',
                colId: 'v',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'BusVoltage' }) },
                numeric: true,
                valueFormatter: (params) => formatValue(params.value, 2, intl),
            },
            {
                headerName: intl.formatMessage({ id: 'BusAngle' }),
                field: 'angle',
                colId: 'angle',
                headerComponentParams: { displayName: intl.formatMessage({ id: 'BusAngle' }) },
                numeric: true,
                valueFormatter: (params) => formatValue(params.value, 2, intl),
            },
        ];
    }, [intl]);

    function renderBusVoltagesTable(busVoltages) {
        return (
            <>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={busVoltagesColumnDefs}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({ id: 'BusVoltages' })}
                    rows={busVoltages}
                    onRowDataUpdated={onRowDataUpdated}
                    skipColumnHeaders={false}
                />
            </>
        );
    }

    const renderReportViewer = () => {
        return (
            <>
                <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
                {(status === RunningStatus.SUCCEED || status === RunningStatus.FAILED) && (
                    <ComputationReportViewer reportType={ComputingType.VOLTAGE_INITIALIZATION} />
                )}
            </>
        );
    };

    function renderTabs() {
        return (
            <>
                <Box sx={styles.container}>
                    <Box sx={styles.tabs}>
                        <Tabs value={tabIndex} onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}>
                            <Tab label={intl.formatMessage({ id: 'ReactiveSlacks' })} />
                            <Tab label={intl.formatMessage({ id: 'Indicators' })} />
                            <Tab label={intl.formatMessage({ id: 'BusVoltages' })} />
                            <Tab label={intl.formatMessage({ id: 'ComputationResultsLogs' })} />
                        </Tabs>
                    </Box>

                    <Box sx={styles.buttonApplyModifications}>
                        <Button
                            variant="outlined"
                            onClick={previewModifications}
                            disabled={!result || !result.modificationsGroupUuid || disabledApplyModifications}
                        >
                            <FormattedMessage id="previewModifications" />
                        </Button>
                        {previewModificationsDialogOpen && renderPreviewModificationsDialog()}
                        {result && !result.modificationsGroupUuid && status === RunningStatus.SUCCEED && (
                            <Box sx={{ paddingLeft: 2 }}>
                                <FormattedMessage id="modificationsAlreadyApplied" />
                            </Box>
                        )}
                        {applyingModifications && <CircularProgress sx={{ paddingLeft: 2 }} size={'1em'} />}
                    </Box>
                </Box>
                <div style={{ flexGrow: 1 }}>
                    {result && tabIndex === 0 && renderReactiveSlacksTable(result)}
                    {result && tabIndex === 1 && renderIndicatorsTable(result.indicators)}
                    {result && tabIndex === 2 && renderBusVoltagesTable(result.busVoltages)}
                    {tabIndex === 3 && renderReportViewer()}
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
