/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DirectoryItemSelector,
    ElementType,
    SubmitButton,
    useSnackMessage,
    CustomFormProvider,
    TreeViewFinderNodeProps,
    mergeSx,
} from '@gridsuite/commons-ui';
import { Button, DialogActions, Grid, Tab, Tabs } from '@mui/material';
import { Dispatch, SetStateAction, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { TabPanel } from '../parameters';
import VoltageLimitsParameters from './voltage-limits-parameters';
import EquipmentSelectionParameters from './equipment-selection-parameters';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { updateVoltageInitParameters } from '../../../../services/study/voltage-init';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import {
    fromStudyVoltageInitParamsDataToFormValues,
    fromVoltageInitParametersFormToParamValues,
    fromVoltageInitParamsDataToFormValues,
} from './voltage-init-utils';
import { getVoltageInitParameters } from 'services/voltage-init';
import { GeneralParameters } from './general-parameters';
import {
    DEFAULT_GENERAL_APPLY_MODIFICATIONS,
    GENERAL,
    initialVoltageInitParametersForm,
    TabValue,
    VoltageInitParametersForm,
    voltageInitParametersFormSchema,
} from './voltage-init-parameters-form';
import { AppState } from '../../../../redux/reducer';
import { UUID } from 'crypto';
import { useGetVoltageInitParameters } from './use-get-voltage-init-parameters';
import { styles } from '../parameters-style';

export const VoltageInitParameters = ({
    setHaveDirtyFields,
}: {
    setHaveDirtyFields: Dispatch<SetStateAction<boolean>>;
}) => {
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const [tabValue, setTabValue] = useState(TabValue.GENERAL);

    const formMethods = useForm<VoltageInitParametersForm>({
        defaultValues: initialVoltageInitParametersForm,
        resolver: yupResolver(voltageInitParametersFormSchema),
    });
    const { reset, handleSubmit, getValues, trigger, formState } = formMethods;

    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [voltageInitParams, setVoltageInitParams] = useGetVoltageInitParameters();

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    const resetVoltageInitParameters = useCallback(() => {
        updateVoltageInitParameters(studyUuid, {
            applyModifications: DEFAULT_GENERAL_APPLY_MODIFICATIONS,
            computationParameters: null,
        }).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
    }, [studyUuid, snackError]);

    const [tabIndexesWithError, setTabIndexesWithError] = useState<TabValue[]>([]);

    const onValidationError = useCallback(
        (errors?: any) => {
            // TODO: this does not work if formSchema keys does not match tab values
            let tabsInError = [];
            if (errors?.[GENERAL] !== undefined) {
                tabsInError.push(TabValue.GENERAL);
            }
            if (errors?.[TabValue.VOLTAGE_LIMITS] !== undefined) {
                tabsInError.push(TabValue.VOLTAGE_LIMITS);
            }
            if (errors?.[TabValue.EQUIPMENTS_SELECTION]) {
                tabsInError.push(TabValue.EQUIPMENTS_SELECTION);
            }
            setTabIndexesWithError(tabsInError);
        },
        [setTabIndexesWithError]
    );

    const onSubmit = useCallback(
        (newParams: VoltageInitParametersForm) => {
            updateVoltageInitParameters(studyUuid, fromVoltageInitParametersFormToParamValues(newParams))
                .then(() => {
                    setVoltageInitParams(fromVoltageInitParametersFormToParamValues(newParams));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'updateVoltageInitParametersError',
                    });
                });
            onValidationError();
        },
        [onValidationError, setVoltageInitParams, snackError, studyUuid]
    );

    useEffect(() => {
        if (voltageInitParams) {
            reset(fromStudyVoltageInitParamsDataToFormValues(voltageInitParams));
        }
    }, [reset, voltageInitParams]);

    const clear = useCallback(() => {
        reset(initialVoltageInitParametersForm);
        resetVoltageInitParameters();
        onValidationError();
    }, [reset, resetVoltageInitParameters, onValidationError]);

    const handleLoadParameter = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                getVoltageInitParameters(newParams[0].id as UUID)
                    .then((parameters: any) => {
                        console.info(
                            `loading the following voltage init parameters : ${JSON.stringify(parameters)} ` +
                                parameters.uuid
                        );
                        reset(fromVoltageInitParamsDataToFormValues(parameters), {
                            keepDefaultValues: true,
                        });
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

    const handleOpenSaveDialog = useCallback(() => {
        trigger().then((isValid) => {
            if (isValid) {
                setOpenCreateParameterDialog(true);
            }
        });
    }, [trigger]);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <>
            <CustomFormProvider validationSchema={voltageInitParametersFormSchema} {...formMethods}>
                <Grid
                    xl={tabValue === TabValue.VOLTAGE_LIMITS ? 12 : 6}
                    container
                    sx={{ height: '100%' }}
                    direction="column"
                    justifyContent="space-between"
                >
                    <Grid
                        xs
                        item
                        container
                        key="voltageInitParameters"
                        sx={mergeSx(styles.scrollableGrid, {
                            paddingTop: 0,
                            width: '100%',
                            display: 'unset',
                        })}
                    >
                        <Tabs
                            value={tabValue}
                            variant="scrollable"
                            onChange={handleTabChange}
                            TabIndicatorProps={{
                                sx: getTabIndicatorStyle(tabIndexesWithError, tabValue),
                            }}
                        >
                            <Tab
                                label={<FormattedMessage id="VoltageInitParametersGeneralTabLabel" />}
                                value={TabValue.GENERAL}
                                sx={getTabStyle(tabIndexesWithError, TabValue.GENERAL)}
                            />
                            <Tab
                                label={<FormattedMessage id="VoltageLimits" />}
                                value={TabValue.VOLTAGE_LIMITS}
                                sx={getTabStyle(tabIndexesWithError, TabValue.VOLTAGE_LIMITS)}
                            />
                            <Tab
                                label={<FormattedMessage id="EquipmentSelection" />}
                                value={TabValue.EQUIPMENTS_SELECTION}
                                sx={getTabStyle(tabIndexesWithError, TabValue.EQUIPMENTS_SELECTION)}
                            />
                        </Tabs>
                        <Grid container>
                            <TabPanel value={tabValue} index={TabValue.GENERAL}>
                                <GeneralParameters />
                            </TabPanel>
                            <TabPanel value={tabValue} index={TabValue.VOLTAGE_LIMITS}>
                                <VoltageLimitsParameters />
                            </TabPanel>
                            <TabPanel value={tabValue} index={TabValue.EQUIPMENTS_SELECTION}>
                                <EquipmentSelectionParameters />
                            </TabPanel>
                        </Grid>
                    </Grid>

                    <Grid item container>
                        <DialogActions
                            sx={mergeSx(styles.controlParametersItem, {
                                paddingTop: 4,
                                paddingBottom: 2,
                                paddingLeft: 0,
                            })}
                        >
                            <Button onClick={() => setOpenSelectParameterDialog(true)}>
                                <FormattedMessage id="settings.button.chooseSettings" />
                            </Button>
                            <Button onClick={handleOpenSaveDialog}>
                                <FormattedMessage id="save" />
                            </Button>
                            <Button onClick={clear}>
                                <FormattedMessage id="resetToDefault" />
                            </Button>
                            <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit, onValidationError)} />
                        </DialogActions>
                    </Grid>
                </Grid>
            </CustomFormProvider>

            {openCreateParameterDialog && (
                <CreateParameterDialog
                    open={openCreateParameterDialog}
                    onClose={() => setOpenCreateParameterDialog(false)}
                    parameterValues={getValues}
                    parameterType={ElementType.VOLTAGE_INIT_PARAMETERS}
                    parameterFormatter={(params: VoltageInitParametersForm) =>
                        fromVoltageInitParametersFormToParamValues(params).computationParameters
                    }
                />
            )}

            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={handleLoadParameter}
                    types={[ElementType.VOLTAGE_INIT_PARAMETERS]}
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
        </>
    );
};
