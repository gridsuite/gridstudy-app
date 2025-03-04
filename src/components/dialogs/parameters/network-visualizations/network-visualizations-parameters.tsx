/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Button, Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { TabPanel } from '../parameters';
import { SingleLineDiagramParameters } from './single-line-diagram-parameters';
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
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    mergeSx,
    SubmitButton,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { TabValue } from './network-visualizations-utils';
import { NetworkVisualizationParameters } from './network-visualizations.types';
import {
    getNetworkVisualizationParameters,
    setNetworkVisualizationParameters,
} from '../../../../services/study/study-config';
import { UUID } from 'crypto';
import { UPDATE_TYPE_HEADER } from '../common/computation-parameters-util';
import { setUpdateNetworkVisualizationParameters } from '../../../../redux/actions';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import { fetchNetworkVisualizationsParameters } from '../../../../services/study-config';
import { User } from 'oidc-client';
import { getAvailableComponentLibraries } from 'services/study';
import { styles } from '../parameters-style';

const useGetAvailableComponentLibraries = (user: User | null) => {
    const [componentLibraries, setComponentLibraries] = useState<string[]>([]);

    useEffect(() => {
        if (user !== null) {
            getAvailableComponentLibraries().then((libraries) => {
                if (libraries != null) {
                    setComponentLibraries(libraries);
                }
            });
        }
    }, [user]);

    return componentLibraries;
};

interface NetworkVisualizationsParametersProps {
    setHaveDirtyFields: (haveDirtyFields: boolean) => void;
}

export const NetworkVisualizationsParameters: FunctionComponent<NetworkVisualizationsParametersProps> = ({
    setHaveDirtyFields,
}) => {
    const user = useSelector((state: AppState) => state.user);
    const componentLibraries = useGetAvailableComponentLibraries(user);
    const [tabValue, setTabValue] = useState(TabValue.MAP);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const networkVisualizationsParameters = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
    const intl = useIntl();

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    const formMethods = useForm<any>({
        defaultValues: initialNetworkVisualizationParametersForm,
        resolver: yupResolver(networkVisualizationParametersSchema),
    });

    const { formState, getValues, handleSubmit, reset } = formMethods;

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

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

    const loadParameters = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                const paramUuid = newParams[0].id;
                fetchNetworkVisualizationsParameters(paramUuid as UUID)
                    .then((parameters: NetworkVisualizationParameters) => {
                        console.info('loading network visualization parameters', paramUuid);
                        reset(parameters, { keepDefaultValues: true });
                    })
                    .catch((error) => {
                        console.error(error);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            }
            setOpenSelectParameterDialog(false);
        },
        [reset, snackError]
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
                    <Button onClick={() => setOpenSelectParameterDialog(true)}>
                        <FormattedMessage id="settings.button.chooseSettings" />
                    </Button>
                    <Button onClick={() => setOpenCreateParameterDialog(true)}>
                        <FormattedMessage id="save" />
                    </Button>
                    <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit)} />
                </Grid>
            </Grid>
            {openCreateParameterDialog && (
                <CreateParameterDialog
                    open={openCreateParameterDialog}
                    onClose={() => setOpenCreateParameterDialog(false)}
                    parameterValues={() => getValues()}
                    parameterFormatter={(newParams) => newParams}
                    parameterType={ElementType.NETWORK_VISUALIZATIONS_PARAMETERS}
                />
            )}
            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={loadParameters}
                    types={[ElementType.NETWORK_VISUALIZATIONS_PARAMETERS]}
                    title={intl.formatMessage({
                        id: 'showSelectParameterDialog',
                    })}
                    onlyLeaves={true}
                    multiSelect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                />
            )}
        </CustomFormProvider>
    );
};
