/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Box, DialogContentText, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { useOptionalServiceStatus } from 'hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from './utils/optional-services';
import { AppState } from 'redux/reducer';
import {
    getLoadFlowDefaultLimitReductions,
    getLoadFlowProviders,
    getLoadFlowSpecificParametersDescription,
} from 'services/loadflow';
import {
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    setLoadFlowParameters,
    setLoadFlowProvider,
} from 'services/study/loadflow';
import { fetchSecurityAnalysisProviders, getSecurityAnalysisDefaultLimitReductions } from 'services/security-analysis';
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
import { ShortCircuitParameters } from './dialogs/parameters/short-circuit-parameters';
import { VoltageInitParameters } from './dialogs/parameters/voltageinit/voltage-init-parameters';
import LoadFlowParameters from './dialogs/parameters/loadflow/load-flow-parameters';
import DynamicSimulationParameters from './dialogs/parameters/dynamicsimulation/dynamic-simulation-parameters';
import { SelectOptionsDialog } from 'utils/dialogs';
import {
    fetchDefaultNonEvacuatedEnergyProvider,
    fetchNonEvacuatedEnergyProvider,
    getNonEvacuatedEnergyParameters,
    updateNonEvacuatedEnergyProvider,
} from 'services/study/non-evacuated-energy';
import { NonEvacuatedEnergyParameters } from './dialogs/parameters/non-evacuated-energy/non-evacuated-energy-parameters';
import ComputingType from './computing-status/computing-type';
import RunningStatus from './utils/running-status';
import GlassPane from './results/common/glass-pane';
import { SecurityAnalysisParameters } from './dialogs/parameters/security-analysis/security-analysis-parameters';
import { NetworkVisualizationsParameters } from './dialogs/parameters/network-visualizations/network-visualizations-parameters';
import { StateEstimationParameters } from './dialogs/parameters/state-estimation/state-estimation-parameters';
import { useGetStateEstimationParameters } from './dialogs/parameters/state-estimation/use-get-state-estimation-parameters';
import DynamicSecurityAnalysisParameters from './dialogs/parameters/dynamic-security-analysis/dynamic-security-analysis-parameters';
import { useGetNonEvacuatedEnergyParameters } from './dialogs/parameters/non-evacuated-energy/use-get-non-evacuated-energy-parameters';
import { stylesLayout, tabStyles } from './utils/tab-utils';
import { useParametersBackend } from './dialogs/parameters/use-parameters-backend';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { useGetShortCircuitParameters } from './dialogs/parameters/use-get-short-circuit-parameters';
import { cancelLeaveParametersTab, confirmLeaveParametersTab } from 'redux/actions';
import { StudyView, StudyViewType } from './utils/utils';

enum TAB_VALUES {
    lfParamsTabValue = 'LOAD_FLOW',
    securityAnalysisParamsTabValue = 'SECURITY_ANALYSIS',
    sensitivityAnalysisParamsTabValue = 'SENSITIVITY_ANALYSIS',
    nonEvacuatedEnergyParamsTabValue = 'NON_EVACUATED_ENERGY_ANALYSIS',
    shortCircuitParamsTabValue = 'SHORT_CIRCUIT',
    dynamicSimulationParamsTabValue = 'DYNAMIC_SIMULATION',
    dynamicSecurityAnalysisParamsTabValue = 'DYNAMIC_SECURITY_ANALYSIS',
    voltageInitParamsTabValue = 'VOLTAGE_INITIALIZATION',
    stateEstimationTabValue = 'STATE_ESTIMATION',
    networkVisualizationsParams = 'networkVisualizationsParams',
}

type ParametersTabsProps = {
    view: StudyViewType;
};

const ParametersTabs: FunctionComponent<ParametersTabsProps> = ({ view }) => {
    const dispatch = useDispatch();
    const attemptedLeaveParametersTabIndex = useSelector((state: AppState) => state.attemptedLeaveParametersTabIndex);
    const user = useSelector((state: AppState) => state.user);

    const [tabValue, setTabValue] = useState<string>(TAB_VALUES.networkVisualizationsParams);
    const [nextTabValue, setNextTabValue] = useState<string | undefined>(undefined);
    const [haveDirtyFields, setHaveDirtyFields] = useState<boolean>(false);

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    const computationStatus = useSelector((state: AppState) => state.computingStatus[tabValue as ComputingType]);
    const shortCircuitOneBusStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const shouldDisplayGlassPane = useMemo(() => {
        return (
            computationStatus === RunningStatus.RUNNING ||
            (tabValue === TAB_VALUES.shortCircuitParamsTabValue && shortCircuitOneBusStatus === RunningStatus.RUNNING)
        );
    }, [computationStatus, shortCircuitOneBusStatus, tabValue]);

    const loadFlowParametersBackend = useParametersBackend(
        user,
        ComputingType.LOAD_FLOW,
        OptionalServicesStatus.Up,
        getLoadFlowProviders,
        null,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters,
        setLoadFlowParameters,
        getLoadFlowSpecificParametersDescription,
        getLoadFlowDefaultLimitReductions
    );

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        ComputingType.SECURITY_ANALYSIS,
        securityAnalysisAvailability,
        fetchSecurityAnalysisProviders,
        null,
        fetchDefaultSecurityAnalysisProvider,
        updateSecurityAnalysisProvider,
        getSecurityAnalysisParameters,
        setSecurityAnalysisParameters,
        undefined,
        getSecurityAnalysisDefaultLimitReductions
    );

    const sensitivityAnalysisBackend = useParametersBackend(
        user,
        ComputingType.SENSITIVITY_ANALYSIS,
        sensitivityAnalysisAvailability,
        fetchSensitivityAnalysisProviders,
        null,
        fetchDefaultSensitivityAnalysisProvider,
        null,
        getSensitivityAnalysisParameters
    );

    const nonEvacuatedEnergyBackend = useParametersBackend(
        user,
        ComputingType.NON_EVACUATED_ENERGY_ANALYSIS,
        nonEvacuatedEnergyAvailability,
        fetchSensitivityAnalysisProviders, // same providers list as those for sensitivity-analysis
        fetchNonEvacuatedEnergyProvider,
        fetchDefaultNonEvacuatedEnergyProvider,
        updateNonEvacuatedEnergyProvider,
        getNonEvacuatedEnergyParameters
    );

    const useNonEvacuatedEnergyParameters = useGetNonEvacuatedEnergyParameters();

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const useStateEstimationParameters = useGetStateEstimationParameters();

    useEffect(() => {
        if (attemptedLeaveParametersTabIndex !== null) {
            if (haveDirtyFields) {
                setIsPopupOpen(true);
            } else {
                dispatch(confirmLeaveParametersTab());
            }
        }
    }, [attemptedLeaveParametersTabIndex, haveDirtyFields, dispatch]);

    const handleChangeTab = (newValue: string) => {
        if (haveDirtyFields) {
            setNextTabValue(newValue);
            setIsPopupOpen(true);
        } else {
            setTabValue(newValue);
        }
    };

    const handlePopupChangeTab = useCallback(() => {
        if (nextTabValue) {
            setTabValue(nextTabValue);
            setNextTabValue(undefined);
        } else if (attemptedLeaveParametersTabIndex !== null) {
            dispatch(confirmLeaveParametersTab());
        }
        setHaveDirtyFields(false);
        setIsPopupOpen(false);
    }, [nextTabValue, attemptedLeaveParametersTabIndex, dispatch]);

    const handlePopupClose = useCallback(() => {
        setIsPopupOpen(false);
        setNextTabValue(undefined);

        if (attemptedLeaveParametersTabIndex !== null) {
            dispatch(cancelLeaveParametersTab());
        }
    }, [dispatch, attemptedLeaveParametersTabIndex]);

    useEffect(() => {
        setTabValue((oldValue) => {
            if (
                (!enableDeveloperMode &&
                    (oldValue === TAB_VALUES.sensitivityAnalysisParamsTabValue ||
                        oldValue === TAB_VALUES.nonEvacuatedEnergyParamsTabValue ||
                        oldValue === TAB_VALUES.shortCircuitParamsTabValue ||
                        oldValue === TAB_VALUES.dynamicSimulationParamsTabValue ||
                        oldValue === TAB_VALUES.dynamicSecurityAnalysisParamsTabValue)) ||
                oldValue === TAB_VALUES.stateEstimationTabValue
            ) {
                return TAB_VALUES.securityAnalysisParamsTabValue;
            }
            return oldValue;
        });
    }, [enableDeveloperMode]);

    const displayTab = useCallback(() => {
        /**
         * We add view dependency to unmount the component when the user changes the study tab
         * This is necessary to reset the form when the user changes the study tab
         */
        if (view !== StudyView.PARAMETERS) {
            return null;
        }
        switch (tabValue) {
            case TAB_VALUES.lfParamsTabValue:
                return (
                    <LoadFlowParameters
                        parametersBackend={loadFlowParametersBackend}
                        setHaveDirtyFields={setHaveDirtyFields}
                    />
                );
            case TAB_VALUES.securityAnalysisParamsTabValue:
                return (
                    <SecurityAnalysisParameters
                        parametersBackend={securityAnalysisParametersBackend}
                        setHaveDirtyFields={setHaveDirtyFields}
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
                        useNonEvacuatedEnergyParameters={useNonEvacuatedEnergyParameters}
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
                return <DynamicSimulationParameters user={user} setHaveDirtyFields={setHaveDirtyFields} />;
            case TAB_VALUES.dynamicSecurityAnalysisParamsTabValue:
                return <DynamicSecurityAnalysisParameters user={user} setHaveDirtyFields={setHaveDirtyFields} />;
            case TAB_VALUES.voltageInitParamsTabValue:
                return <VoltageInitParameters setHaveDirtyFields={setHaveDirtyFields} />;
            case TAB_VALUES.stateEstimationTabValue:
                return (
                    <StateEstimationParameters
                        setHaveDirtyFields={setHaveDirtyFields}
                        useStateEstimationParameters={useStateEstimationParameters}
                    />
                );
            case TAB_VALUES.networkVisualizationsParams:
                return <NetworkVisualizationsParameters setHaveDirtyFields={setHaveDirtyFields} />;
        }
    }, [
        view,
        tabValue,
        loadFlowParametersBackend,
        securityAnalysisParametersBackend,
        sensitivityAnalysisBackend,
        nonEvacuatedEnergyBackend,
        useNonEvacuatedEnergyParameters,
        useShortCircuitParameters,
        user,
        useStateEstimationParameters,
    ]);

    return (
        <>
            <Grid container spacing={0} sx={stylesLayout.rootContainer}>
                <Grid container item xs={2} direction="column" sx={stylesLayout.columnContainer}>
                    <Grid item>
                        <Typography variant="subtitle1" sx={tabStyles.listTitleDisplay}>
                            <FormattedMessage id="parameters" />
                        </Typography>
                    </Grid>
                    <Grid item xs sx={stylesLayout.listDisplayContainer}>
                        <Tabs
                            value={tabValue}
                            variant="scrollable"
                            onChange={(event, newValue) => handleChangeTab(newValue)}
                            aria-label="parameters"
                            orientation="vertical"
                            sx={tabStyles.listDisplay}
                        >
                            <Tab
                                label={<FormattedMessage id="LoadFlow" />}
                                disabled={
                                    computationStatus === RunningStatus.RUNNING &&
                                    tabValue === TAB_VALUES.lfParamsTabValue
                                }
                                value={TAB_VALUES.lfParamsTabValue}
                            />
                            <Tab
                                disabled={securityAnalysisAvailability !== OptionalServicesStatus.Up}
                                label={<FormattedMessage id="SecurityAnalysis" />}
                                value={TAB_VALUES.securityAnalysisParamsTabValue}
                            />
                            <Tab
                                disabled={sensitivityAnalysisAvailability !== OptionalServicesStatus.Up}
                                label={<FormattedMessage id="SensitivityAnalysis" />}
                                value={TAB_VALUES.sensitivityAnalysisParamsTabValue}
                            />
                            {enableDeveloperMode ? (
                                <Tab
                                    disabled={nonEvacuatedEnergyAvailability !== OptionalServicesStatus.Up}
                                    label={<FormattedMessage id="NonEvacuatedEnergyAnalysis" />}
                                    value={TAB_VALUES.nonEvacuatedEnergyParamsTabValue}
                                />
                            ) : null}
                            <Tab
                                disabled={shortCircuitAvailability !== OptionalServicesStatus.Up}
                                label={<FormattedMessage id="ShortCircuit" />}
                                value={TAB_VALUES.shortCircuitParamsTabValue}
                            />
                            {enableDeveloperMode ? (
                                <Tab
                                    disabled={dynamicSimulationAvailability !== OptionalServicesStatus.Up}
                                    label={<FormattedMessage id="DynamicSimulation" />}
                                    value={TAB_VALUES.dynamicSimulationParamsTabValue}
                                />
                            ) : null}
                            {enableDeveloperMode ? (
                                <Tab
                                    disabled={dynamicSecurityAnalysisAvailability !== OptionalServicesStatus.Up}
                                    label={<FormattedMessage id="DynamicSecurityAnalysis" />}
                                    value={TAB_VALUES.dynamicSecurityAnalysisParamsTabValue}
                                />
                            ) : null}
                            <Tab
                                disabled={voltageInitAvailability !== OptionalServicesStatus.Up}
                                label={<FormattedMessage id="VoltageInit" />}
                                value={TAB_VALUES.voltageInitParamsTabValue}
                            />
                            {enableDeveloperMode ? (
                                <Tab
                                    disabled={stateEstimationAvailability !== OptionalServicesStatus.Up}
                                    label={<FormattedMessage id="StateEstimation" />}
                                    value={TAB_VALUES.stateEstimationTabValue}
                                />
                            ) : null}
                            {/*In order to insert a Divider under a Tabs collection it need to be nested in a dedicated Tab to prevent console warnings*/}
                            <Tab sx={tabStyles.dividerTab} label="" icon={<Divider sx={{ flexGrow: 1 }} />} disabled />
                            <Tab
                                label={<FormattedMessage id="NetworkVisualizations" />}
                                value={TAB_VALUES.networkVisualizationsParams}
                            />
                        </Tabs>
                    </Grid>
                </Grid>
                <Grid item xs={10} sx={tabStyles.parametersBox}>
                    <GlassPane active={shouldDisplayGlassPane} loadingMessageText="computationInProgress">
                        <Box sx={tabStyles.contentBox}>{displayTab()}</Box>
                    </GlassPane>
                </Grid>
            </Grid>
            <SelectOptionsDialog
                title={''}
                open={isPopupOpen}
                onClose={handlePopupClose}
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
