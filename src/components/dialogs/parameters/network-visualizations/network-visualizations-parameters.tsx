/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { styles, TabPanel } from '../parameters';
import { SingleLineDiagramParameters, useGetAvailableComponentLibraries } from './single-line-diagram-parameters';
import { NetworkAreaDiagramParameters } from './network-area-diagram-parameters';
import { MapParameters } from './map-parameters';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, NotificationType } from '../../../../redux/reducer';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    initialNetworkVisualizationParametersForm,
    networkVisualizationParametersSchema,
} from './network-visualizations-form';
import { CustomFormProvider, SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { TabValue } from './network-visualizations-utils';
import { mergeSx } from '../../../utils/functions';
import { NetworkVisualizationParameters } from './network-visualizations.types';
import {
    getNetworkVisualizationParameters,
    setNetworkVisualizationParameters,
} from '../../../../services/study/study-config';
import { UUID } from 'crypto';
import { UPDATE_TYPE_HEADER } from '../common/computation-parameters-util';
import { setUpdateNetworkVisualizationParameters } from '../../../../redux/actions';

export const NetworkVisualizationsParameters: FunctionComponent = () => {
    const user = useSelector((state: AppState) => state.user);
    const componentLibraries = useGetAvailableComponentLibraries(user);
    const [tabValue, setTabValue] = useState(TabValue.MAP);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const networkVisualizationsParameters = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    const formMethods = useForm<any>({
        defaultValues: initialNetworkVisualizationParametersForm,
        resolver: yupResolver(networkVisualizationParametersSchema),
    });

    const { reset, handleSubmit } = formMethods;
    useEffect(() => {
        if (networkVisualizationsParameters) {
            reset(networkVisualizationsParameters);
        }
    }, [reset, networkVisualizationsParameters]);

    useEffect(() => {
        if (
            studyUpdated.eventData.headers &&
            studyUpdated.eventData.headers[UPDATE_TYPE_HEADER] ===
                NotificationType.NETWORK_VISUALIZATION_PARAMETERS_UPDATED
        ) {
            getNetworkVisualizationParameters(studyUuid as UUID)
                .then((params: NetworkVisualizationParameters) => {
                    dispatch(setUpdateNetworkVisualizationParameters(params));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'getNetworkVisualizationsParametersError',
                    });
                });
        }
    }, [dispatch, reset, snackError, studyUpdated, studyUuid]);

    const onSubmit = useCallback(
        (newParams: NetworkVisualizationParameters) => {
            setNetworkVisualizationParameters(studyUuid as UUID, newParams).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'updateNetworkVisualizationsParametersError',
                });
            });
        },
        [studyUuid, snackError]
    );

    return (
        <CustomFormProvider validationSchema={networkVisualizationParametersSchema} {...formMethods}>
            <Grid container sx={{ height: '100%' }} direction="column" justifyContent="space-between">
                <Grid
                    xs
                    item
                    container
                    sx={mergeSx(styles.scrollableGrid, {
                        display: 'unset',
                    })}
                >
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
                    item
                    container
                    sx={{
                        paddingTop: 4,
                        paddingBottom: 2,
                    }}
                >
                    <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit)} />
                </Grid>
            </Grid>
        </CustomFormProvider>
    );
};
