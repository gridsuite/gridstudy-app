/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import Grid from '@mui/material/Grid';
import { Box, Tab, Tabs, Theme } from '@mui/material';
import { TabPanel } from '../parameters';
import { useCreateRowDataSensi } from '../../../../hooks/use-create-row-data-sensi';
import * as sensiParam from './columns-definitions';
import { IColumnsDef } from './columns-definitions';
import {
    SensiHvdcs,
    SensiInjection,
    SensiInjectionsSet,
    SensiNodes,
    SensiPsts,
    TAB_VALUES,
} from './columns-definitions';
import SensitivityTable from './sensitivity-table';
import { PARAM_DEVELOPER_MODE } from '../../../../utils/config-params';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useParameterState } from '../use-parameters-state';

const styles = {
    circularProgress: (theme: Theme) => ({
        display: 'flex',
        marginRight: theme.spacing(1),
        color: theme.palette.primary.main,
    }),
    errorOutlineIcon: (theme: Theme) => ({
        marginRight: theme.spacing(1),
        color: theme.palette.error.main,
        display: 'flex',
    }),
    textInfo: (theme: Theme) => ({
        color: theme.palette.primary.main,
        display: 'flex',
    }),
    textInitial: {
        color: 'grey',
    },
    textAlert: (theme: Theme) => ({
        color: theme.palette.error.main,
        display: 'flex',
    }),
    boxContent: {
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'right',
        flex: 'auto',
        flexGrow: '1',
        whiteSpace: 'pre-wrap',
    },
};

interface SensitivityParametersSelectorProps {
    onFormChanged: (hasFormChanged: boolean) => void;
    onChangeParams: (a: any, b: any, c: number) => void; // fixing any on "b" here is not trivial, will need to fix SensitivityTable which is used in another unrelated component
    launchLoader: boolean;
    analysisComputeComplexity: number;
}

interface TabInfo {
    label: string;
    subTabs?: { label: string }[];
}

const SensitivityParametersSelector: FunctionComponent<SensitivityParametersSelectorProps> = ({
    onFormChanged,
    onChangeParams,
    launchLoader,
    analysisComputeComplexity,
}) => {
    const intl = useIntl();

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE) as [boolean];

    const [tabValue, setTabValue] = useState(TAB_VALUES.SensitivityBranches);
    const [subTabValue, setSubTabValue] = useState(TAB_VALUES.SensiInjectionsSet);
    const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, newValue: number) => {
        setTabValue(newValue);
    }, []);
    const handleSubTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, newValue: number) => {
        setSubTabValue(newValue);
    }, []);

    const tabInfo: TabInfo[] = [
        {
            label: 'SensitivityBranches',
            subTabs: [
                { label: 'SensiInjectionsSet' },
                { label: 'SensiInjection' },
                { label: 'SensiHVDC' },
                { label: 'SensiPST' },
            ],
        },
        ...((enableDeveloperMode && [{ label: 'SensitivityNodes' }]) || []),
    ];

    const [rowDataInjectionsSet, useFieldArrayOutputInjectionsSet] = useCreateRowDataSensi(
        sensiParam.SensiInjectionsSet
    );

    const [rowDataInjections, useFieldArrayOutputInjections] = useCreateRowDataSensi(sensiParam.SensiInjection);

    const [rowDataHvdc, useFieldArrayOutputHvdc] = useCreateRowDataSensi(sensiParam.SensiHvdcs);

    const [rowDataPst, useFieldArrayOutputPst] = useCreateRowDataSensi(sensiParam.SensiPsts);

    const [rowDataNodes, useFieldArrayOutputNodes] = useCreateRowDataSensi(sensiParam.SensiNodes);

    const getColumnsDefinition = useCallback(
        (sensiColumns: IColumnsDef[]) => {
            if (sensiColumns) {
                return sensiColumns.map((column) => ({
                    ...column,
                    label: intl.formatMessage({ id: column.label }),
                }));
            }
            return [];
        },
        [intl]
    );

    const renderComputingEventLoading = () => {
        return (
            <Box sx={styles.textInfo}>
                <CircularProgress size={'1em'} sx={styles.circularProgress} />
                <FormattedMessage id={'loadingComputing'} />
            </Box>
        );
    };

    const renderComputingEvent = () => {
        if (analysisComputeComplexity < 999999 && analysisComputeComplexity > 500000) {
            return (
                <Box sx={styles.textAlert}>
                    <ErrorOutlineIcon sx={styles.errorOutlineIcon} />
                    <FormattedMessage
                        id="sensitivityAnalysis.simulatedComputations"
                        values={{
                            count: analysisComputeComplexity.toString(),
                        }}
                    />
                </Box>
            );
        }
        if (analysisComputeComplexity > 999999) {
            return (
                <Box sx={styles.textAlert}>
                    <ErrorOutlineIcon sx={styles.errorOutlineIcon} />
                    <FormattedMessage id="sensitivityAnalysis.moreThanOneMillionComputations" />
                </Box>
            );
        } else if (analysisComputeComplexity === 0) {
            return (
                <Box sx={styles.textInitial}>
                    <FormattedMessage
                        id={'sensitivityAnalysis.simulatedComputations'}
                        values={{
                            count: analysisComputeComplexity.toString(),
                        }}
                    />
                </Box>
            );
        } else {
            return (
                <Box sx={styles.textInfo}>
                    <FormattedMessage
                        id={'sensitivityAnalysis.simulatedComputations'}
                        values={{
                            count: analysisComputeComplexity.toString(),
                        }}
                    />
                </Box>
            );
        }
    };

    useEffect(() => {
        if (!enableDeveloperMode) {
            setTabValue(TAB_VALUES.SensitivityBranches);
        }
    }, [enableDeveloperMode]);

    return (
        <>
            <Grid sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    {tabInfo.map((tab, index) => (
                        <Tab
                            key={tab.label}
                            label={<FormattedMessage id={tab.label} />}
                            value={index}
                            sx={{
                                fontSize: 17,
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                            }}
                        />
                    ))}
                </Tabs>
                {tabInfo.map((tab, index) => (
                    <TabPanel key={tab.label} value={tabValue} index={index} sx={{ paddingTop: 1 }}>
                        {tabValue === TAB_VALUES.SensitivityBranches && tab.subTabs && (
                            <>
                                <Tabs value={subTabValue} onChange={handleSubTabChange}>
                                    {tab.subTabs.map((subTab, subIndex) => (
                                        <Tab
                                            key={subTab.label}
                                            value={subIndex}
                                            sx={{
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize',
                                            }}
                                            label={<FormattedMessage id={subTab.label} />}
                                        ></Tab>
                                    ))}
                                </Tabs>
                                <Box sx={styles.boxContent}>
                                    {launchLoader ? renderComputingEventLoading() : renderComputingEvent()}
                                    <FormattedMessage id="sensitivityAnalysis.separator" />
                                    <FormattedMessage id="sensitivityAnalysis.maximumSimulatedComputations" />
                                </Box>

                                <TabPanel index={TAB_VALUES.SensiInjectionsSet} value={subTabValue}>
                                    <SensitivityTable
                                        arrayFormName={`${SensiInjectionsSet.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_INJECTIONS_SET
                                        )}
                                        useFieldArrayOutput={useFieldArrayOutputInjectionsSet}
                                        createRows={rowDataInjectionsSet}
                                        tableHeight={300}
                                        onFormChanged={onFormChanged}
                                        onChangeParams={onChangeParams}
                                    />
                                </TabPanel>
                                <TabPanel index={TAB_VALUES.SensiInjection} value={subTabValue}>
                                    <SensitivityTable
                                        arrayFormName={`${SensiInjection.name}`}
                                        columnsDefinition={getColumnsDefinition(
                                            sensiParam.COLUMNS_DEFINITIONS_INJECTIONS
                                        )}
                                        useFieldArrayOutput={useFieldArrayOutputInjections}
                                        createRows={rowDataInjections}
                                        tableHeight={300}
                                        onFormChanged={onFormChanged}
                                        onChangeParams={onChangeParams}
                                    />
                                </TabPanel>
                                <TabPanel index={TAB_VALUES.SensiHVDC} value={subTabValue}>
                                    <SensitivityTable
                                        arrayFormName={`${SensiHvdcs.name}`}
                                        columnsDefinition={getColumnsDefinition(sensiParam.COLUMNS_DEFINITIONS_HVDCS)}
                                        useFieldArrayOutput={useFieldArrayOutputHvdc}
                                        createRows={rowDataHvdc}
                                        tableHeight={300}
                                        onFormChanged={onFormChanged}
                                        onChangeParams={onChangeParams}
                                    />
                                </TabPanel>
                                <TabPanel index={TAB_VALUES.SensiPST} value={subTabValue}>
                                    <SensitivityTable
                                        arrayFormName={`${SensiPsts.name}`}
                                        columnsDefinition={getColumnsDefinition(sensiParam.COLUMNS_DEFINITIONS_PSTS)}
                                        useFieldArrayOutput={useFieldArrayOutputPst}
                                        createRows={rowDataPst}
                                        tableHeight={300}
                                        onFormChanged={onFormChanged}
                                        onChangeParams={onChangeParams}
                                    />
                                </TabPanel>
                            </>
                        )}
                        {tabValue === TAB_VALUES.SensitivityNodes && (
                            <SensitivityTable
                                arrayFormName={`${SensiNodes.name}`}
                                columnsDefinition={getColumnsDefinition(sensiParam.COLUMNS_DEFINITIONS_NODES)}
                                useFieldArrayOutput={useFieldArrayOutputNodes}
                                createRows={rowDataNodes}
                                tableHeight={367}
                                onFormChanged={onFormChanged}
                                onChangeParams={onChangeParams}
                            />
                        )}
                    </TabPanel>
                ))}
            </Grid>
        </>
    );
};

export default SensitivityParametersSelector;
