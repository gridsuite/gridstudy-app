/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    darken,
    DialogContentText,
    Divider,
    Grid,
    lighten,
    Tab,
    Tabs,
    Theme,
    Typography,
} from '@mui/material';

import {
    useParametersBackend,
    useParameterState,
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
    setLoadFlowParameters,
    setLoadFlowProvider,
} from 'services/study/loadflow';
import { fetchSecurityAnalysisProviders } from 'services/security-analysis';
import {
    fetchDefaultSecurityAnalysisProvider,
    getSecurityAnalysisParameters,
    setSecurityAnalysisParameters,
    updateSecurityAnalysisProvider,
} from 'services/study/security-analysis';
import {
    fetchDefaultSensitivityAnalysisProvider,
    getSensitivityAnalysisParameters,
} from 'services/study/sensitivity-analysis';
import { fetchSensitivityAnalysisProviders } from 'services/sensitivity-analysis';
import { SensitivityAnalysisParameters } from './dialogs/parameters/sensi/sensitivity-analysis-parameters';
import {
    ShortCircuitParameters,
    useGetShortCircuitParameters,
} from './dialogs/parameters/short-circuit-parameters';
import {
    useGetVoltageInitParameters,
    VoltageInitParameters,
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
import { SelectOptionsDialog } from 'utils/dialogs';
import {
    fetchDefaultNonEvacuatedEnergyProvider,
    fetchNonEvacuatedEnergyProvider,
    updateNonEvacuatedEnergyProvider,
} from 'services/study/non-evacuated-energy';
import {
    NonEvacuatedEnergyParameters,
    useGetNonEvacuatedEnergyParameters,
} from './dialogs/parameters/non-evacuated-energy/non-evacuated-energy-parameters';

const stylesLayout = {
    // <Tabs/> need attention with parents flex
    rootContainer: {
        width: '100%',
        height: '100%',
    },
    columnContainer: {
        height: '100%',
    },
    listDisplayContainer: {
        overflow: 'auto',
        flex: 1,
    },
    listDisplay: {
        height: '100%',
    },
};
const styles = {
    listTitleDisplay: (theme: Theme) => ({
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: theme.spacing(2),
        width: '100%',
        fontSize: '1.1rem',
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
    }),
    listDisplay: (theme: Theme) => ({
        ...stylesLayout.listDisplay,
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
        '.MuiTab-root.MuiButtonBase-root': {
            textTransform: 'none', //tab text not upper-case
            textAlign: 'left',
            alignItems: 'stretch',
        },
        '.MuiTabs-scrollButtons.Mui-disabled': {
            opacity: 0.3,
        },
        '.MuiTabScrollButton-root:nth-of-type(1)': {
            height: '30px', //40px by default
        },
    }),
    parametersBox: (theme: Theme) => ({
        backgroundColor:
            theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : lighten(theme.palette.background.paper, 0.2),
        height: '100%',
        paddingTop: 6,
        paddingBottom: 2,
        paddingLeft: 8,
        paddingRight: 8,
    }),
};

enum TAB_VALUES {
    sldParamsTabValue = 'SingleLineDiagram',
    mapParamsTabValue = 'Map',
    lfParamsTabValue = 'LoadFlow',
    securityAnalysisParamsTabValue = 'SecurityAnalysis',
    sensitivityAnalysisParamsTabValue = 'SensitivityAnalysis',
    nonEvacuatedEnergyParamsTabValue = 'NonEvacuatedEnergyAnalysis',
    shortCircuitParamsTabValue = 'ShortCircuit',
    dynamicSimulationParamsTabValue = 'DynamicSimulation',
    advancedParamsTabValue = 'Advanced',
    voltageInitParamsTabValue = 'VoltageInit',
}

const hasValidationTabs = [
    TAB_VALUES.sensitivityAnalysisParamsTabValue,
    TAB_VALUES.nonEvacuatedEnergyParamsTabValue,
    TAB_VALUES.shortCircuitParamsTabValue,
    TAB_VALUES.dynamicSimulationParamsTabValue,
    TAB_VALUES.voltageInitParamsTabValue,
];

type OwnProps = {
    studyId: string;
};

const ParametersTabs: FunctionComponent<OwnProps> = (props) => {
    const user = useSelector((state: ReduxState) => state.user);

    const [tabValue, setTabValue] = useState<string>(
        TAB_VALUES.sldParamsTabValue,
    );
    const [nextTabValue, setNextTabValue] = useState<string | undefined>(
        undefined,
    );
    const [haveDirtyFields, setHaveDirtyFields] = useState<boolean>(false);

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const securityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SecurityAnalysis,
    );
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SensitivityAnalysis,
    );
    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SensitivityAnalysis,
    );
    const dynamicSimulationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicSimulation,
    );
    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit,
    );
    const shortCircuitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.ShortCircuit,
    );

    const loadFlowParametersBackend = useParametersBackend(
        user,
        'LoadFlow',
        OptionalServicesStatus.Up,
        getLoadFlowProviders,
        null,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters,
        setLoadFlowParameters,
        getLoadFlowSpecificParametersDescription,
    );

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        'SecurityAnalysis',
        securityAnalysisAvailability,
        fetchSecurityAnalysisProviders,
        null,
        fetchDefaultSecurityAnalysisProvider,
        updateSecurityAnalysisProvider,
        getSecurityAnalysisParameters,
        setSecurityAnalysisParameters,
    );

    const sensitivityAnalysisBackend = useParametersBackend(
        user,
        'SensitivityAnalysis',
        sensitivityAnalysisAvailability,
        fetchSensitivityAnalysisProviders,
        null,
        fetchDefaultSensitivityAnalysisProvider,
        null,
        getSensitivityAnalysisParameters,
    );

    const nonEvacuatedEnergyBackend = useParametersBackend(
        user,
        'NonEvacuatedEnergy',
        nonEvacuatedEnergyAvailability,
        fetchSensitivityAnalysisProviders, // same providers list as those for sensitivity-analysis
        fetchNonEvacuatedEnergyProvider,
        fetchDefaultNonEvacuatedEnergyProvider,
        updateNonEvacuatedEnergyProvider,
    );

    const useNonEvacuatedEnergyParameters =
        useGetNonEvacuatedEnergyParameters();

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const useVoltageInitParameters = useGetVoltageInitParameters();

    const componentLibraries = useGetAvailableComponentLibraries(user);

    const handleChangeTab = (newValue: string) => {
        if (
            hasValidationTabs.includes(tabValue as TAB_VALUES) &&
            haveDirtyFields
        ) {
            setNextTabValue(newValue);
            setIsPopupOpen(true);
        } else {
            setTabValue(newValue);
        }
    };

    const handlePopupChangeTab = useCallback(() => {
        if (nextTabValue) {
            setTabValue(nextTabValue);
        }
        setHaveDirtyFields(false);
        setIsPopupOpen(false);
    }, [nextTabValue]);

    useEffect(() => {
        setTabValue((oldValue) => {
            if (
                !enableDeveloperMode &&
                (oldValue === TAB_VALUES.sensitivityAnalysisParamsTabValue ||
                    oldValue === TAB_VALUES.nonEvacuatedEnergyParamsTabValue ||
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
                        setHaveDirtyFields={setHaveDirtyFields}
                    />
                );
            case TAB_VALUES.nonEvacuatedEnergyParamsTabValue:
                return (
                    <NonEvacuatedEnergyParameters
                        parametersBackend={nonEvacuatedEnergyBackend}
                        useNonEvacuatedEnergyParameters={
                            useNonEvacuatedEnergyParameters
                        }
                    />
                );
            case TAB_VALUES.shortCircuitParamsTabValue:
                return (
                    <ShortCircuitParameters
                        useShortCircuitParameters={useShortCircuitParameters}
                        setHaveDirtyFields={setHaveDirtyFields}
                    />
                );
            case TAB_VALUES.dynamicSimulationParamsTabValue:
                return (
                    <DynamicSimulationParameters
                        user={user}
                        setHaveDirtyFields={setHaveDirtyFields}
                    />
                );
            case TAB_VALUES.voltageInitParamsTabValue:
                return (
                    <VoltageInitParameters
                        useVoltageInitParameters={useVoltageInitParameters}
                        setHaveDirtyFields={setHaveDirtyFields}
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
        nonEvacuatedEnergyBackend,
        tabValue,
        useNonEvacuatedEnergyParameters,
        useShortCircuitParameters,
        useVoltageInitParameters,
        user,
    ]);

    return (
        <>
            <Grid container spacing={0} sx={stylesLayout.rootContainer}>
                <Grid
                    container
                    item
                    xs={2}
                    direction="column"
                    sx={stylesLayout.columnContainer}
                >
                    <Grid item>
                        <Typography
                            variant="subtitle1"
                            sx={styles.listTitleDisplay}
                        >
                            <FormattedMessage id="parameters" />
                        </Typography>
                    </Grid>
                    <Grid item xs sx={stylesLayout.listDisplayContainer}>
                        <Tabs
                            value={tabValue}
                            variant="scrollable"
                            onChange={(event, newValue) =>
                                handleChangeTab(newValue)
                            }
                            aria-label="parameters"
                            orientation="vertical"
                            sx={styles.listDisplay}
                        >
                            <Tab
                                label={<FormattedMessage id="LoadFlow" />}
                                value={TAB_VALUES.lfParamsTabValue}
                            />
                            <Tab
                                disabled={
                                    securityAnalysisAvailability !==
                                    OptionalServicesStatus.Up
                                }
                                label={
                                    <FormattedMessage id="SecurityAnalysis" />
                                }
                                value={
                                    TAB_VALUES.securityAnalysisParamsTabValue
                                }
                            />
                            <Tab
                                disabled={
                                    sensitivityAnalysisAvailability !==
                                    OptionalServicesStatus.Up
                                }
                                label={
                                    <FormattedMessage id="SensitivityAnalysis" />
                                }
                                value={
                                    TAB_VALUES.sensitivityAnalysisParamsTabValue
                                }
                            />
                            {enableDeveloperMode && (
                                <Tab
                                    disabled={
                                        nonEvacuatedEnergyAvailability !==
                                        OptionalServicesStatus.Up
                                    }
                                    label={
                                        <FormattedMessage id="NonEvacuatedEnergyAnalysis" />
                                    }
                                    value={
                                        TAB_VALUES.nonEvacuatedEnergyParamsTabValue
                                    }
                                />
                            )}
                            <Tab
                                disabled={
                                    shortCircuitAvailability !==
                                    OptionalServicesStatus.Up
                                }
                                label={<FormattedMessage id="ShortCircuit" />}
                                value={TAB_VALUES.shortCircuitParamsTabValue}
                            />
                            {enableDeveloperMode && (
                                <Tab
                                    disabled={
                                        dynamicSimulationAvailability !==
                                        OptionalServicesStatus.Up
                                    }
                                    label={
                                        <FormattedMessage id="DynamicSimulation" />
                                    }
                                    value={
                                        TAB_VALUES.dynamicSimulationParamsTabValue
                                    }
                                />
                            )}
                            <Tab
                                disabled={
                                    voltageInitAvailability !==
                                    OptionalServicesStatus.Up
                                }
                                label={<FormattedMessage id="VoltageInit" />}
                                value={TAB_VALUES.voltageInitParamsTabValue}
                            />
                            <Divider />
                            <Tab
                                label={
                                    <FormattedMessage id="SingleLineDiagram" />
                                }
                                value={TAB_VALUES.sldParamsTabValue}
                            />
                            <Tab
                                label={<FormattedMessage id="Map" />}
                                value={TAB_VALUES.mapParamsTabValue}
                            />
                            <Tab
                                label={<FormattedMessage id="Advanced" />}
                                value={TAB_VALUES.advancedParamsTabValue}
                            />
                        </Tabs>
                    </Grid>
                </Grid>
                <Grid item xs={10} sx={styles.parametersBox}>
                    {displayTab()}
                </Grid>
            </Grid>
            <SelectOptionsDialog
                title={''}
                open={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onClick={handlePopupChangeTab}
                child={
                    <DialogContentText>
                        <FormattedMessage id="genericConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey={'dialog.button.leave'}
            />
        </>
    );
};

export default ParametersTabs;
