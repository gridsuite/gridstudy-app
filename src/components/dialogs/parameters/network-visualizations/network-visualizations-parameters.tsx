/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TabPanel } from '../parameters';
import { SingleLineDiagramParameters, useGetAvailableComponentLibraries } from './single-line-diagram-parameters';
import { NetworkAreaDiagramParameters } from './network-area-diagram-parameters';
import { MapParameters } from './map-parameters';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    initialNetworkVisualizationParametersForm,
    NetworkVisualizationParametersForm,
    networkVisualizationParametersSchema,
} from './network-visualizations-form';
import { CustomFormProvider, SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import {
    formatParametersToSend,
    fromNetworkVisualizationsParamsDataToFormValues,
    TabValue,
} from './network-visualizations-utils';
import { mergeSx } from '../../../utils/functions';
import { updateConfigParameters } from '../../../../services/config';

export const NetworkVisualizationsParameters: FunctionComponent = () => {
    const user = useSelector((state: AppState) => state.user);
    const componentLibraries = useGetAvailableComponentLibraries(user);
    const [tabValue, setTabValue] = useState(TabValue.MAP);
    const [dirtyFields, setDirtyFields] = useState<Partial<NetworkVisualizationParametersForm>>({});
    //Map parameters
    const lineFullPath = useSelector((state: AppState) => state.lineFullPath);
    const lineParallelPath = useSelector((state: AppState) => state.lineParallelPath);
    const lineFlowMode = useSelector((state: AppState) => state.lineFlowMode);
    const lineFlowColorMode = useSelector((state: AppState) => state.lineFlowColorMode);
    const lineFlowAlertThreshold = useSelector((state: AppState) => state.lineFlowAlertThreshold);
    const mapManualRefresh = useSelector((state: AppState) => state.mapManualRefresh);
    const mapBaseMap = useSelector((state: AppState) => state.mapBaseMap);
    //Single line diagram parameters
    const diagonalLabel = useSelector((state: AppState) => state.diagonalLabel);
    const centerLabel = useSelector((state: AppState) => state.centerLabel);
    const substationLayout = useSelector((state: AppState) => state.substationLayout);
    const componentLibrary = useSelector((state: AppState) => state.componentLibrary);
    //Network area diagram parameters
    const initNadWithGeoData = useSelector((state: AppState) => state.initNadWithGeoData);

    const parameters = useMemo(() => {
        return {
            lineFullPath,
            lineParallelPath,
            lineFlowMode,
            lineFlowColorMode,
            lineFlowAlertThreshold,
            mapManualRefresh,
            mapBaseMap,
            diagonalLabel,
            centerLabel,
            substationLayout,
            componentLibrary,
            initNadWithGeoData,
        };
    }, [
        lineFullPath,
        lineParallelPath,
        lineFlowMode,
        lineFlowColorMode,
        lineFlowAlertThreshold,
        mapManualRefresh,
        mapBaseMap,
        diagonalLabel,
        centerLabel,
        substationLayout,
        componentLibrary,
        initNadWithGeoData,
    ]);

    const { snackError } = useSnackMessage();

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    const formMethods = useForm<any>({
        defaultValues: initialNetworkVisualizationParametersForm,
        resolver: yupResolver(networkVisualizationParametersSchema),
    });

    const { reset, handleSubmit, formState } = formMethods;
    useEffect(() => {
        if (parameters) {
            reset(fromNetworkVisualizationsParamsDataToFormValues(parameters));
        }
    }, [reset, parameters]);

    const onSubmit = useCallback(
        (newParams: NetworkVisualizationParametersForm) => {
            // We need to send only the fields that have been changed in order to get the proper notification.
            updateConfigParameters(formatParametersToSend(newParams, dirtyFields)).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'updateVoltageInitParametersError',
                });
            });
        },
        [dirtyFields, snackError]
    );
    // to keep track of the changed fields because formState.dirtyFields is always empty inside onSubmit.
    useEffect(() => {
        setDirtyFields(formState.dirtyFields);
    }, [formState, setDirtyFields]);

    return (
        <CustomFormProvider validationSchema={networkVisualizationParametersSchema} {...formMethods}>
            <Grid container sx={{ height: '100%' }} direction="column" justifyContent="space-between">
                <Grid>
                    <Tabs value={tabValue} variant="scrollable" onChange={handleTabChange}>
                        <Tab label={<FormattedMessage id={'Map'} />} value={TabValue.MAP} />
                        <Tab
                            label={<FormattedMessage id={'SingleLineDiagram'} />}
                            value={TabValue.SINGLE_LINE_DIAGRAM}
                        />
                        <Tab
                            label={<FormattedMessage id={'NetworkAreaDiagram'} />}
                            value={TabValue.NETWORK_AREA_DIAGRAM}
                        />
                    </Tabs>
                    <TabPanel value={tabValue} index={TabValue.MAP}>
                        <MapParameters />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TabValue.SINGLE_LINE_DIAGRAM}>
                        <SingleLineDiagramParameters componentLibraries={componentLibraries} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TabValue.NETWORK_AREA_DIAGRAM}>
                        <NetworkAreaDiagramParameters />
                    </TabPanel>
                </Grid>
                <Grid
                    sx={mergeSx({
                        paddingTop: 4,
                        paddingBottom: 2,
                        paddingLeft: 0,
                    })}
                >
                    <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit)} />
                </Grid>
            </Grid>
        </CustomFormProvider>
    );
};
