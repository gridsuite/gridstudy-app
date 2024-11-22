/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, LinearProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Lens } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    cloneVoltageInitModifications,
    getVoltageInitModifications,
    getVoltageInitStudyParameters,
} from '../../../services/study/voltage-init';
import VoltageInitModificationDialog from '../../dialogs/network-modifications/voltage-init-modification/voltage-init-modification-dialog';
import { FetchStatus } from '../../../services/utils.type';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { useParameterState } from '../../dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import ComputingType from '../../computing-status/computing-type';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { LOADFLOW_RESULT_STORE_FILTER, LOADFLOW_RESULT_STORE_SORT } from '../../../utils/store-sort-filter-fields';
import { mappingTabs } from '../loadflow/load-flow-result-utils';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';

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

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    lockVisible: true,
};

function calculateTotal(reactiveSlacks, isPositive) {
    return (
        reactiveSlacks
            ?.filter((reactiveSlack) => (isPositive ? reactiveSlack.slack > 0 : reactiveSlack.slack < 0))
            .reduce((sum, reactiveSlack) => sum + reactiveSlack.slack, 0) ?? 0
    );
}

const VoltageInitResult = ({ result, status }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { snackError } = useSnackMessage();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const [disabledApplyModifications, setDisableApplyModifications] = useState(
        !result || !result.modificationsGroupUuid
    );
    const [applyingModifications, setApplyingModifications] = useState(false);
    const [previewModificationsDialogOpen, setPreviewModificationsDialogOpen] = useState(false);
    const [voltageInitModification, setVoltageInitModification] = useState();

    const intl = useIntl();

    // @ts-expect-error TODO: split component between results and logs to explictly limit tabIndex possible values
    const { onSortChanged, sortConfig } = useAgGridSort(LOADFLOW_RESULT_STORE_SORT, mappingTabs(tabIndex));
    // @ts-expect-error TODO: split component between results and logs to explictly limit tabIndex possible values
    const { updateFilter, filterSelector } = useAggridRowFilter(LOADFLOW_RESULT_STORE_FILTER, mappingTabs(tabIndex));

    const openLoader = useOpenLoaderShortWait({
        isLoading: status === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const closePreviewModificationsDialog = useCallback(() => setPreviewModificationsDialogOpen(false), []);
    const gridRef = useRef();
    const onRowDataUpdated = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const applyModifications = useCallback(() => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        cloneVoltageInitModifications(studyUuid, currentNode.id)
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
    }, [currentNode.id, snackError, studyUuid]);

    const previewModifications = useCallback(() => {
        setApplyingModifications(true);
        setDisableApplyModifications(true);
        getVoltageInitModifications(studyUuid, currentNode.id)
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
    }, [currentNode?.id, snackError, studyUuid, setVoltageInitModification, setPreviewModificationsDialogOpen]);

    const [autoApplyModifications, setAutoApplyModifications] = useState(false);

    useEffect(() => {
        getVoltageInitStudyParameters(studyUuid).then((voltageInitParameters) => {
            setAutoApplyModifications(voltageInitParameters?.applyModifications ?? false);
        });
    }, [studyUuid]);

    /**
     * @type {import('ag-grid-community').ColDef[]}
     */
    const indicatorsColumnDefs = useMemo(() => {
        return [
            {
                field: 'key',
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
            {
                field: 'value',
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
        ];
    }, [filterSelector, onSortChanged, sortConfig, updateFilter]);

    const reactiveSlacksColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'busId',
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
            {
                headerName: intl.formatMessage({ id: 'Slack' }),
                field: 'slack',
                numeric: true,
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
        ];
    }, [filterSelector, intl, onSortChanged, sortConfig, updateFilter]);

    const busVoltagesColumnDefs = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'BusId' }),
                field: 'busId',
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
            {
                headerName: intl.formatMessage({ id: 'BusVoltage' }),
                field: 'v',
                numeric: true,
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
            {
                headerName: intl.formatMessage({ id: 'BusAngle' }),
                field: 'angle',
                numeric: true,
                sortProps: { sortConfig, onSortChanged },
                filterProps: { updateFilter, filterSelector },
            },
        ];
    }, [filterSelector, intl, onSortChanged, sortConfig, updateFilter]);

    const csvIndicators = useMemo(
        () => (result?.indicators ? Object.entries(result.indicators).map(([key, value]) => ({ key, value })) : null),
        [result?.indicators]
    );

    return (
        <>
            <Box sx={styles.container}>
                <Box sx={styles.tabs}>
                    <Tabs value={tabIndex} onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}>
                        <Tab label={intl.formatMessage({ id: 'ReactiveSlacks' })} />
                        <Tab label={intl.formatMessage({ id: 'Indicators' })} />
                        {enableDeveloperMode && <Tab label={intl.formatMessage({ id: 'BusVoltages' })} />}
                        <Tab label={<FormattedMessage id={'ComputationResultsLogs'} />} />
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
                    {previewModificationsDialogOpen && (
                        <VoltageInitModificationDialog
                            currentNode={currentNode.id}
                            studyUuid={studyUuid}
                            editData={voltageInitModification}
                            onClose={closePreviewModificationsDialog}
                            onPreviewModeSubmit={applyModifications}
                            editDataFetchStatus={FetchStatus.IDLE}
                            dialogProps={undefined}
                            disabledSave={autoApplyModifications}
                        />
                    )}
                    {result && !result.modificationsGroupUuid && status === RunningStatus.SUCCEED && (
                        <Box sx={{ paddingLeft: 2 }}>
                            <FormattedMessage id="modificationsAlreadyApplied" />
                        </Box>
                    )}
                    {applyingModifications && <CircularProgress sx={{ paddingLeft: 2 }} size={'1em'} />}
                </Box>
            </Box>
            <div style={{ flexGrow: 1 }}>
                {result && tabIndex === 0 && (
                    <>
                        <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                            <Typography sx={styles.typography}>
                                <FormattedMessage id="TotalInjection" />
                            </Typography>
                            <Typography sx={styles.totalTypography}>
                                {calculateTotal(result.reactiveSlacks, false).toFixed(2)} MVar
                            </Typography>

                            <Typography sx={styles.secondTypography}>
                                <FormattedMessage id="TotalConsumption" />
                            </Typography>
                            <Typography sx={styles.totalTypography}>
                                {calculateTotal(result.reactiveSlacks, true).toFixed(2)} MVar
                            </Typography>

                            {result.reactiveSlacksOverThreshold && (
                                <Typography sx={styles.reactiveSlacksOverThresholdTypography}>
                                    <FormattedMessage
                                        id={'REACTIVE_SLACKS_OVER_THRESHOLD'}
                                        values={{ threshold: result.reactiveSlacksThreshold }}
                                    />
                                </Typography>
                            )}
                        </Stack>

                        <RenderTableAndExportCsv
                            gridRef={gridRef}
                            columns={reactiveSlacksColumnDefs}
                            defaultColDef={defaultColDef}
                            tableName={intl.formatMessage({ id: 'ReactiveSlacks' })}
                            rows={result.reactiveSlacks}
                            onRowDataUpdated={onRowDataUpdated}
                            skipColumnHeaders={true}
                        />
                    </>
                )}
                {result && tabIndex === 1 && (
                    <>
                        <Stack direction={'row'} gap={1} marginBottom={2} marginTop={1.5} marginLeft={2}>
                            <Typography style={{ fontWeight: 'bold' }}>
                                <FormattedMessage id="VoltageInitStatus" />
                                <span style={{ marginLeft: '4px' }}>{status === 'SUCCEED' ? 'OK' : 'KO'}</span>
                            </Typography>
                            <Lens fontSize={'medium'} sx={status === 'SUCCEED' ? styles.succeed : styles.fail} />
                        </Stack>
                        <RenderTableAndExportCsv
                            gridRef={gridRef}
                            columns={indicatorsColumnDefs}
                            defaultColDef={defaultColDef}
                            tableName={intl.formatMessage({ id: 'Indicators' })}
                            rows={csvIndicators}
                            onRowDataUpdated={onRowDataUpdated}
                            skipColumnHeaders={true}
                        />
                    </>
                )}
                {result && tabIndex === 2 && enableDeveloperMode && (
                    <RenderTableAndExportCsv
                        gridRef={gridRef}
                        columns={busVoltagesColumnDefs}
                        defaultColDef={defaultColDef}
                        tableName={intl.formatMessage({ id: 'BusVoltages' })}
                        rows={result.busVoltages}
                        onRowDataUpdated={onRowDataUpdated}
                        skipColumnHeaders={true}
                    />
                )}
                {((tabIndex === 3 && enableDeveloperMode) || (tabIndex === 2 && !enableDeveloperMode)) && (
                    <>
                        <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
                        {(status === RunningStatus.SUCCEED || status === RunningStatus.FAILED) && (
                            <ComputationReportViewer reportType={ComputingType.VOLTAGE_INITIALIZATION} />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

VoltageInitResult.defaultProps = {
    result: null,
};

VoltageInitResult.propTypes = {
    result: PropTypes.object,
};

export default VoltageInitResult;
