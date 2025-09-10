/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Box, DialogContentText, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';
import { PARAM_DEVELOPER_MODE, PARAM_LANGUAGE } from 'utils/config-params';
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
import DynamicSimulationParameters from './dialogs/parameters/dynamicsimulation/dynamic-simulation-parameters';
import { SelectOptionsDialog } from 'utils/dialogs';
import {
    fetchDefaultNonEvacuatedEnergyProvider,
    fetchNonEvacuatedEnergyProvider,
    getNonEvacuatedEnergyParameters,
    updateNonEvacuatedEnergyProvider,
} from 'services/study/non-evacuated-energy';
import { NonEvacuatedEnergyParameters } from './dialogs/parameters/non-evacuated-energy/non-evacuated-energy-parameters';
import RunningStatus from './utils/running-status';
import GlassPane from './results/common/glass-pane';
import { StateEstimationParameters } from './dialogs/parameters/state-estimation/state-estimation-parameters';
import { useGetStateEstimationParameters } from './dialogs/parameters/state-estimation/use-get-state-estimation-parameters';
import DynamicSecurityAnalysisParameters from './dialogs/parameters/dynamic-security-analysis/dynamic-security-analysis-parameters';
import { useGetNonEvacuatedEnergyParameters } from './dialogs/parameters/non-evacuated-energy/use-get-non-evacuated-energy-parameters';
import { stylesLayout, tabStyles } from './utils/tab-utils';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { useGetShortCircuitParameters } from './dialogs/parameters/use-get-short-circuit-parameters';
import {
    attemptLaunchComputation,
    cancelLeaveParametersTab,
    confirmLeaveParametersTab,
    setDirtyComputationParameters
} from 'redux/actions';
import { StudyView, StudyViewType } from './utils/utils';
import {
    ComputingType,
    fetchSecurityAnalysisProviders,
    getSecurityAnalysisDefaultLimitReductions,
    LoadFlowParametersInline,
    NetworkVisualizationParametersInline,
    SecurityAnalysisParametersInline,
    SensitivityAnalysisParametersInline,
    ShortCircuitParametersInLine,
    useParametersBackend,
    VoltageInitParametersInLine,
} from '@gridsuite/commons-ui';
import { useParametersNotification } from './dialogs/parameters/use-parameters-notification';
import { useGetVoltageInitParameters } from './dialogs/parameters/use-get-voltage-init-parameters';

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
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id ?? null);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [tabValue, setTabValue] = useState<string>(TAB_VALUES.networkVisualizationsParams);
    const [nextTabValue, setNextTabValue] = useState<string | undefined>(undefined);
    const [haveDirtyFields, setHaveDirtyFields] = useState<boolean>(false);
    const attemptedLaunchComputation = useSelector((state: AppState) => state.attemptedLaunchComputation);

    const [isLeavingPopupOpen, setIsLeavingPopupOpen] = useState<boolean>(false);
    const [isLaunchingPopupOpen, setIsLaunchingPopupOpen] = useState<boolean>(false);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);

    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    const networkVisualizationsParameters = useSelector((state: AppState) => state.networkVisualizationsParameters);

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

    useEffect(() => {
        dispatch(setDirtyComputationParameters(haveDirtyFields));
    }, [dispatch, haveDirtyFields]);

    useEffect(() => {
        if (attemptedLaunchComputation !== null) {
            setIsLaunchingPopupOpen(true);
        }
    }, [attemptedLaunchComputation]);

    const handleLaunchingPopupClose = useCallback(() => {
        setIsLaunchingPopupOpen(false);
        if (attemptedLaunchComputation !== null) {
            dispatch(attemptLaunchComputation(null));
        }
    }, [attemptedLaunchComputation, dispatch]);

    const handleLaunchingPopup = useCallback(() => {
        setIsLaunchingPopupOpen(false);
        console.log(attemptedLaunchComputation);
        if (attemptedLaunchComputation !== null) {
            attemptedLaunchComputation();
            dispatch(attemptLaunchComputation(null));
        }
    }, [attemptedLaunchComputation, dispatch]);

    const loadFlowParametersBackend = useParametersBackend(
        user,
        studyUuid,
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
    useParametersNotification(ComputingType.LOAD_FLOW, OptionalServicesStatus.Up, loadFlowParametersBackend);

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        studyUuid,
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
    useParametersNotification(
        ComputingType.SECURITY_ANALYSIS,
        securityAnalysisAvailability,
        securityAnalysisParametersBackend
    );

    const sensitivityAnalysisBackend = useParametersBackend(
        user,
        studyUuid,
        ComputingType.SENSITIVITY_ANALYSIS,
        sensitivityAnalysisAvailability,
        fetchSensitivityAnalysisProviders,
        null,
        fetchDefaultSensitivityAnalysisProvider,
        null,
        getSensitivityAnalysisParameters
    );
    useParametersNotification(
        ComputingType.SENSITIVITY_ANALYSIS,
        sensitivityAnalysisAvailability,
        sensitivityAnalysisBackend
    );

    const nonEvacuatedEnergyBackend = useParametersBackend(
        user,
        studyUuid,
        ComputingType.NON_EVACUATED_ENERGY_ANALYSIS,
        nonEvacuatedEnergyAvailability,
        fetchSensitivityAnalysisProviders, // same providers list as those for sensitivity-analysis
        fetchNonEvacuatedEnergyProvider,
        fetchDefaultNonEvacuatedEnergyProvider,
        updateNonEvacuatedEnergyProvider,
        getNonEvacuatedEnergyParameters
    );

    const useNonEvacuatedEnergyParameters = useGetNonEvacuatedEnergyParameters();
    const shortCircuitParameters = useGetShortCircuitParameters();
    const voltageInitParameters = useGetVoltageInitParameters();
    const useStateEstimationParameters = useGetStateEstimationParameters();

    useEffect(() => {
        if (attemptedLeaveParametersTabIndex !== null) {
            if (haveDirtyFields) {
                setIsLeavingPopupOpen(true);
            } else {
                dispatch(confirmLeaveParametersTab());
            }
        }
    }, [attemptedLeaveParametersTabIndex, haveDirtyFields, dispatch]);

    const handleChangeTab = (newValue: string) => {
        if (haveDirtyFields) {
            setNextTabValue(newValue);
            setIsLeavingPopupOpen(true);
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
        setIsLeavingPopupOpen(false);
    }, [nextTabValue, attemptedLeaveParametersTabIndex, dispatch]);

    const handleLeavingPopupClose = useCallback(() => {
        setIsLeavingPopupOpen(false);
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
                    <LoadFlowParametersInline
                        studyUuid={studyUuid}
                        language={languageLocal}
                        parametersBackend={loadFlowParametersBackend}
                        setHaveDirtyFields={setHaveDirtyFields}
                        enableDeveloperMode={enableDeveloperMode}
                    />
                );
            case TAB_VALUES.securityAnalysisParamsTabValue:
                return (
                    <SecurityAnalysisParametersInline
                        studyUuid={studyUuid}
                        parametersBackend={securityAnalysisParametersBackend}
                        setHaveDirtyFields={setHaveDirtyFields}
                        enableDeveloperMode={enableDeveloperMode}
                    />
                );
            case TAB_VALUES.sensitivityAnalysisParamsTabValue:
                return (
                    <SensitivityAnalysisParametersInline
                        studyUuid={studyUuid}
                        currentNodeUuid={currentNodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        parametersBackend={sensitivityAnalysisBackend}
                        setHaveDirtyFields={setHaveDirtyFields}
                        enableDeveloperMode={enableDeveloperMode}
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
                    <ShortCircuitParametersInLine
                        studyUuid={studyUuid}
                        setHaveDirtyFields={setHaveDirtyFields}
                        shortCircuitParameters={shortCircuitParameters}
                    />
                );
            case TAB_VALUES.dynamicSimulationParamsTabValue:
                return <DynamicSimulationParameters user={user} setHaveDirtyFields={setHaveDirtyFields} />;
            case TAB_VALUES.dynamicSecurityAnalysisParamsTabValue:
                return <DynamicSecurityAnalysisParameters user={user} setHaveDirtyFields={setHaveDirtyFields} />;
            case TAB_VALUES.voltageInitParamsTabValue:
                return (
                    <VoltageInitParametersInLine
                        studyUuid={studyUuid}
                        setHaveDirtyFields={setHaveDirtyFields}
                        voltageInitParameters={voltageInitParameters}
                    />
                );
            case TAB_VALUES.stateEstimationTabValue:
                return (
                    <StateEstimationParameters
                        setHaveDirtyFields={setHaveDirtyFields}
                        useStateEstimationParameters={useStateEstimationParameters}
                    />
                );
            case TAB_VALUES.networkVisualizationsParams:
                return (
                    <NetworkVisualizationParametersInline
                        studyUuid={studyUuid}
                        setHaveDirtyFields={setHaveDirtyFields}
                        user={user}
                        parameters={networkVisualizationsParameters}
                    />
                );
        }
    }, [
        view,
        tabValue,
        studyUuid,
        languageLocal,
        loadFlowParametersBackend,
        enableDeveloperMode,
        securityAnalysisParametersBackend,
        currentNodeUuid,
        currentRootNetworkUuid,
        sensitivityAnalysisBackend,
        nonEvacuatedEnergyBackend,
        useNonEvacuatedEnergyParameters,
        shortCircuitParameters,
        user,
        useStateEstimationParameters,
        networkVisualizationsParameters,
        voltageInitParameters,
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
                open={isLeavingPopupOpen}
                onClose={handleLeavingPopupClose}
                onClick={handlePopupChangeTab}
                child={
                    <DialogContentText>
                        <FormattedMessage id="genericConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey={'dialog.button.leave'}
            />
            <SelectOptionsDialog
                title={''}
                open={isLaunchingPopupOpen}
                onClose={handleLaunchingPopupClose}
                onClick={handleLaunchingPopup}
                child={
                    <DialogContentText>
                        <FormattedMessage id="launchComputationConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey={'dialog.button.launch'}
            />
        </>
    );
};

export default ParametersTabs;
