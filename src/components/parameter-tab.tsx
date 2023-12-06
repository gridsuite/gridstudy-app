/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    Theme,
    List,
    ListItemButton,
    ListItemText,
    ListItem,
    Box,
    darken,
    lighten,
    Divider,
} from '@mui/material';

import {
    useParameterState,
    useParametersBackend,
} from './dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { useOptionalServiceStatus } from 'hooks/use-optional-service-status';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from './utils/optional-services';
import { ReduxState } from 'redux/reducer.type';
import {
    getLoadFlowProviders,
    getLoadFlowSpecificParametersDescription,
} from 'services/loadflow';
import {
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowParameters,
    setLoadFlowProvider,
} from 'services/study/loadflow';
import { fetchSecurityAnalysisProviders } from 'services/security-analysis';
import {
    fetchDefaultSecurityAnalysisProvider,
    fetchSecurityAnalysisProvider,
    getSecurityAnalysisParameters,
    setSecurityAnalysisParameters,
    updateSecurityAnalysisProvider,
} from 'services/study/security-analysis';
import {
    fetchDefaultSensitivityAnalysisProvider,
    fetchSensitivityAnalysisProvider,
    updateSensitivityAnalysisProvider,
} from 'services/study/sensitivity-analysis';
import { fetchSensitivityAnalysisProviders } from 'services/sensitivity-analysis';
import {
    SensitivityAnalysisParameters,
    useGetSensitivityAnalysisParameters,
} from './dialogs/parameters/sensi/sensitivity-analysis-parameters';
import {
    ShortCircuitParameters,
    useGetShortCircuitParameters,
} from './dialogs/parameters/short-circuit-parameters';
import {
    VoltageInitParameters,
    useGetVoltageInitParameters,
} from './dialogs/parameters/voltageinit/voltage-init-parameters';
import {
    SingleLineDiagramParameters,
    useGetAvailableComponentLibraries,
} from './dialogs/parameters/single-line-diagram-parameters';
import { MapParameters } from './dialogs/parameters/map-parameters';
import { LoadFlowParameters } from './dialogs/parameters/load-flow-parameters';
import { SecurityAnalysisParameters } from './dialogs/parameters/security-analysis-parameters';
import DynamicSimulationParameters from './dialogs/parameters/dynamicsimulation/dynamic-simulation-parameters';
import { NetworkParameters } from './dialogs/parameters/network-parameters';

export const styles = {
    title: (theme: Theme) => ({
        padding: theme.spacing(4),
    }),
    panel: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    tab: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
    },
    listDisplay: (theme: Theme) => ({
        displat: 'flex',
        width: '20%',
        height: '100%',
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
    }),
    listItemDisplay: (theme: Theme) => ({
        paddingLeft: theme.spacing(4),
    }),
    parametersBox: (theme: Theme) => ({
        width: '80%',
        height: '100%',
        backgroundColor:
            theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : lighten(theme.palette.background.paper, 0.2),
        padding: theme.spacing(8),
    }),
};

const TAB_VALUES = {
    sldParamsTabValue: 'SingleLineDiagram',
    mapParamsTabValue: 'Map',
    lfParamsTabValue: 'LoadFlow',
    securityAnalysisParamsTabValue: 'SecurityAnalysis',
    sensitivityAnalysisParamsTabValue: 'SensitivityAnalysis',
    shortCircuitParamsTabValue: 'ShortCircuit',
    dynamicSimulationParamsTabValue: 'DynamicSimulation',
    advancedParamsTabValue: 'Advanced',
    voltageInitParamsTabValue: 'VoltageInit',
};

interface OwnProps {
    studyId: string;
}

function ParametersTab(props: OwnProps) {
    const intl = useIntl();

    const user = useSelector((state: ReduxState) => state.user);

    const [tabValue, setTabValue] = useState<string>(
        TAB_VALUES.sldParamsTabValue
    );

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const securityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SecurityAnalysis
    );
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SensitivityAnalysis
    );
    const dynamicSimulationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicSimulation
    );
    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );
    const shortCircuitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.ShortCircuit
    );

    const loadFlowParametersBackend = useParametersBackend(
        user,
        'LoadFlow',
        OptionalServicesStatus.Up,
        getLoadFlowProviders,
        getLoadFlowProvider,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters,
        setLoadFlowParameters,
        getLoadFlowSpecificParametersDescription
    );

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        'SecurityAnalysis',
        securityAnalysisAvailability,
        fetchSecurityAnalysisProviders,
        fetchSecurityAnalysisProvider,
        fetchDefaultSecurityAnalysisProvider,
        updateSecurityAnalysisProvider,
        getSecurityAnalysisParameters,
        setSecurityAnalysisParameters
    );

    const sensitivityAnalysisBackend = useParametersBackend(
        user,
        'SensitivityAnalysis',
        sensitivityAnalysisAvailability,
        fetchSensitivityAnalysisProviders,
        fetchSensitivityAnalysisProvider,
        fetchDefaultSensitivityAnalysisProvider,
        updateSensitivityAnalysisProvider
    );

    const useSensitivityAnalysisParameters =
        useGetSensitivityAnalysisParameters();

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const useVoltageInitParameters = useGetVoltageInitParameters();

    const componentLibraries = useGetAvailableComponentLibraries(user);

    useEffect(() => {
        setTabValue((oldValue) => {
            if (
                !enableDeveloperMode &&
                (oldValue === TAB_VALUES.sensitivityAnalysisParamsTabValue ||
                    oldValue === TAB_VALUES.shortCircuitParamsTabValue ||
                    oldValue === TAB_VALUES.dynamicSimulationParamsTabValue)
            ) {
                return TAB_VALUES.securityAnalysisParamsTabValue;
            }
            return oldValue;
        });
    }, [enableDeveloperMode]);

    const displayTab = useCallback(() => {
        switch (tabValue) {
            case TAB_VALUES.sldParamsTabValue:
                return (
                    <SingleLineDiagramParameters
                        componentLibraries={componentLibraries}
                    />
                );
            case TAB_VALUES.mapParamsTabValue:
                return <MapParameters />;
            case TAB_VALUES.lfParamsTabValue:
                return (
                    <LoadFlowParameters
                        parametersBackend={loadFlowParametersBackend}
                    />
                );
            case TAB_VALUES.securityAnalysisParamsTabValue:
                return (
                    <SecurityAnalysisParameters
                        parametersBackend={securityAnalysisParametersBackend}
                    />
                );
            case TAB_VALUES.sensitivityAnalysisParamsTabValue:
                return (
                    <SensitivityAnalysisParameters
                        parametersBackend={sensitivityAnalysisBackend}
                        useSensitivityAnalysisParameters={
                            useSensitivityAnalysisParameters
                        }
                    />
                );
            case TAB_VALUES.shortCircuitParamsTabValue:
                return (
                    <ShortCircuitParameters
                        useShortCircuitParameters={useShortCircuitParameters}
                    />
                );
            case TAB_VALUES.dynamicSimulationParamsTabValue:
                return <DynamicSimulationParameters user={user} />;
            case TAB_VALUES.voltageInitParamsTabValue:
                return (
                    <VoltageInitParameters
                        useVoltageInitParameters={useVoltageInitParameters}
                    />
                );
            case TAB_VALUES.advancedParamsTabValue:
                return <NetworkParameters />;
        }
    }, [
        componentLibraries,
        loadFlowParametersBackend,
        securityAnalysisParametersBackend,
        sensitivityAnalysisBackend,
        tabValue,
        useSensitivityAnalysisParameters,
        useShortCircuitParameters,
        useVoltageInitParameters,
        user,
    ]);

    return (
        <Box sx={styles.tab}>
            <List sx={styles.listDisplay}>
                <ListItem sx={styles.title}>
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'parameters',
                        })}
                    />
                </ListItem>

                <ListItemButton
                    sx={styles.listItemDisplay}
                    disabled={!props.studyId}
                    selected={tabValue === TAB_VALUES.lfParamsTabValue}
                    onClick={() => setTabValue(TAB_VALUES.lfParamsTabValue)}
                >
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'LoadFlow',
                        })}
                    />
                </ListItemButton>
                {securityAnalysisAvailability === OptionalServicesStatus.Up && (
                    <ListItemButton
                        sx={styles.listItemDisplay}
                        disabled={!props.studyId}
                        selected={
                            tabValue ===
                            TAB_VALUES.securityAnalysisParamsTabValue
                        }
                        onClick={() =>
                            setTabValue(
                                TAB_VALUES.securityAnalysisParamsTabValue
                            )
                        }
                    >
                        <ListItemText
                            primary={intl.formatMessage({
                                id: 'SecurityAnalysis',
                            })}
                        />
                    </ListItemButton>
                )}
                {sensitivityAnalysisAvailability ===
                    OptionalServicesStatus.Up && (
                    <ListItemButton
                        sx={styles.listItemDisplay}
                        disabled={!props.studyId}
                        selected={
                            tabValue ===
                            TAB_VALUES.sensitivityAnalysisParamsTabValue
                        }
                        onClick={() =>
                            setTabValue(
                                TAB_VALUES.sensitivityAnalysisParamsTabValue
                            )
                        }
                    >
                        <ListItemText
                            primary={intl.formatMessage({
                                id: 'SensitivityAnalysis',
                            })}
                        />
                    </ListItemButton>
                )}
                {shortCircuitAvailability === OptionalServicesStatus.Up && (
                    <ListItemButton
                        sx={styles.listItemDisplay}
                        disabled={!props.studyId}
                        selected={
                            tabValue === TAB_VALUES.shortCircuitParamsTabValue
                        }
                        onClick={() =>
                            setTabValue(TAB_VALUES.shortCircuitParamsTabValue)
                        }
                    >
                        <ListItemText
                            primary={intl.formatMessage({
                                id: 'ShortCircuit',
                            })}
                        />
                    </ListItemButton>
                )}

                {dynamicSimulationAvailability === OptionalServicesStatus.Up &&
                    enableDeveloperMode && (
                        <ListItemButton
                            sx={styles.listItemDisplay}
                            disabled={!props.studyId}
                            selected={
                                tabValue ===
                                TAB_VALUES.dynamicSimulationParamsTabValue
                            }
                            onClick={() =>
                                setTabValue(
                                    TAB_VALUES.dynamicSimulationParamsTabValue
                                )
                            }
                        >
                            <ListItemText
                                primary={intl.formatMessage({
                                    id: 'DynamicSimulation',
                                })}
                            />
                        </ListItemButton>
                    )}
                {voltageInitAvailability === OptionalServicesStatus.Up && (
                    <ListItemButton
                        sx={styles.listItemDisplay}
                        disabled={!props.studyId}
                        selected={
                            tabValue === TAB_VALUES.voltageInitParamsTabValue
                        }
                        onClick={() =>
                            setTabValue(TAB_VALUES.voltageInitParamsTabValue)
                        }
                    >
                        <ListItemText
                            primary={intl.formatMessage({
                                id: 'VoltageInit',
                            })}
                        />
                    </ListItemButton>
                )}
                <Divider />
                <ListItemButton
                    sx={styles.listItemDisplay}
                    selected={tabValue === TAB_VALUES.sldParamsTabValue}
                    onClick={() => setTabValue(TAB_VALUES.sldParamsTabValue)}
                >
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'SingleLineDiagram',
                        })}
                    />
                </ListItemButton>
                <ListItemButton
                    sx={styles.listItemDisplay}
                    selected={tabValue === TAB_VALUES.mapParamsTabValue}
                    onClick={() => setTabValue(TAB_VALUES.mapParamsTabValue)}
                >
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'Map',
                        })}
                    />
                </ListItemButton>
                <ListItemButton
                    sx={styles.listItemDisplay}
                    selected={tabValue === TAB_VALUES.advancedParamsTabValue}
                    onClick={() =>
                        setTabValue(TAB_VALUES.advancedParamsTabValue)
                    }
                >
                    <ListItemText
                        primary={intl.formatMessage({
                            id: 'Advanced',
                        })}
                    />
                </ListItemButton>
            </List>
            <Box sx={styles.parametersBox}>{displayTab()}</Box>
        </Box>
    );
}

export default ParametersTab;
