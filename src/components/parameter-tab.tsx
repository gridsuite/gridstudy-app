/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
    Theme,
    Box,
    darken,
    lighten,
    Divider,
    Tabs,
    Tab,
    DialogContentText,
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
import { SelectOptionsDialog } from 'utils/dialogs';

const styles = {
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
        display: 'flex',
        width: '20%',
        height: '100%',
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : theme.palette.background.paper,
    }),
    listTitleDisplay: (theme: Theme) => ({
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
        paddingLeft: theme.spacing(4),
        textTransform: 'none',
        alignItems: 'start',
        fontSize: '1.1rem',
    }),
    listItemDisplay: (theme: Theme) => ({
        paddingLeft: theme.spacing(4),
        textTransform: 'none',
        alignItems: 'start',
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

enum TAB_VALUES {
    sldParamsTabValue = 'SingleLineDiagram',
    mapParamsTabValue = 'Map',
    lfParamsTabValue = 'LoadFlow',
    securityAnalysisParamsTabValue = 'SecurityAnalysis',
    sensitivityAnalysisParamsTabValue = 'SensitivityAnalysis',
    shortCircuitParamsTabValue = 'ShortCircuit',
    dynamicSimulationParamsTabValue = 'DynamicSimulation',
    advancedParamsTabValue = 'Advanced',
    voltageInitParamsTabValue = 'VoltageInit',
}

const hasValidationTabs = [
    TAB_VALUES.sensitivityAnalysisParamsTabValue,
    TAB_VALUES.shortCircuitParamsTabValue,
    TAB_VALUES.dynamicSimulationParamsTabValue,
    TAB_VALUES.voltageInitParamsTabValue,
];

type OwnProps = {
    studyId: string;
};

const ParametersTab: FunctionComponent<OwnProps> = (props) => {
    const user = useSelector((state: ReduxState) => state.user);

    const [tabValue, setTabValue] = useState<string>(
        TAB_VALUES.sldParamsTabValue
    );
    const [nextTabValue, setNextTabValue] = useState<string | undefined>(
        undefined
    );
    const [haveDirtyFields, setHaveDirtyFields] = useState<boolean>(false);

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

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
                        setHaveDirtyFields={setHaveDirtyFields}
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
        tabValue,
        useSensitivityAnalysisParameters,
        useShortCircuitParameters,
        useVoltageInitParameters,
        user,
    ]);

    return (
        <Box sx={styles.tab}>
            <Tabs
                value={tabValue}
                variant="scrollable"
                onChange={(event, newValue) => handleChangeTab(newValue)}
                aria-label="parameters"
                orientation="vertical"
                sx={styles.listDisplay}
            >
                <Box sx={styles.listTitleDisplay}>
                    <FormattedMessage id="parameters" />
                </Box>
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={!props.studyId}
                    label={<FormattedMessage id="LoadFlow" />}
                    value={TAB_VALUES.lfParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={
                        !(
                            !props.studyId ||
                            securityAnalysisAvailability ===
                                OptionalServicesStatus.Up
                        )
                    }
                    label={<FormattedMessage id="SecurityAnalysis" />}
                    value={TAB_VALUES.securityAnalysisParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={
                        !(
                            !props.studyId ||
                            sensitivityAnalysisAvailability ===
                                OptionalServicesStatus.Up
                        )
                    }
                    label={<FormattedMessage id="SensitivityAnalysis" />}
                    value={TAB_VALUES.sensitivityAnalysisParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={
                        !(
                            !props.studyId ||
                            shortCircuitAvailability ===
                                OptionalServicesStatus.Up
                        )
                    }
                    label={<FormattedMessage id="ShortCircuit" />}
                    value={TAB_VALUES.shortCircuitParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={
                        !(
                            !props.studyId ||
                            dynamicSimulationAvailability ===
                                OptionalServicesStatus.Up
                        )
                    }
                    label={<FormattedMessage id="DynamicSimulation" />}
                    value={TAB_VALUES.dynamicSimulationParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    disabled={
                        !(
                            !props.studyId ||
                            voltageInitAvailability ===
                                OptionalServicesStatus.Up
                        )
                    }
                    label={<FormattedMessage id="VoltageInit" />}
                    value={TAB_VALUES.voltageInitParamsTabValue}
                />
                <Divider />
                <Tab
                    sx={styles.listItemDisplay}
                    label={<FormattedMessage id="SingleLineDiagram" />}
                    value={TAB_VALUES.sldParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    label={<FormattedMessage id="Map" />}
                    value={TAB_VALUES.mapParamsTabValue}
                />
                <Tab
                    sx={styles.listItemDisplay}
                    label={<FormattedMessage id="Advanced" />}
                    value={TAB_VALUES.advancedParamsTabValue}
                />
            </Tabs>
            <Box sx={styles.parametersBox}>{displayTab()}</Box>
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
                style
            />
        </Box>
    );
};

export default ParametersTab;
