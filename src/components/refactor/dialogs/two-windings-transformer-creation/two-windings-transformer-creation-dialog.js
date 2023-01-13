/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ModificationDialog from '../modificationDialog';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { createLoad, fetchEquipmentInfos } from '../../../../utils/rest-api';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import {
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../../../network/constants';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import TwoWindingsTransformerPane from './two-windings-transformer-pane/two-windings-transformer-pane';
import RatioTapChangerPane from './ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from './phase-tap-changer-pane/phase-tap-changer-pane';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

export const EQUIPMENT_ID = 'equipmentId';
export const EQUIPMENT_NAME = 'equipmentName';
export const SERIES_RESISTANCE = 'seriesResistance';
export const SERIES_REACTANCE = 'seriesReactance';
export const MAGNETIZING_CONDUCTANCE = 'magnetizingConductance';
export const MAGNETIZING_SUSCEPTANCE = 'magnetizingSusceptance';
export const RATED_S = 'ratedS';
export const RATED_VOLTAGE_1 = 'ratedVoltage1';
export const RATED_VOLTAGE_2 = 'ratedVoltage2';
export const CURRENT_LIMITS_1 = 'currentLimits1';
export const CURRENT_LIMITS_2 = 'currentLimits2';
export const PERMANENT_LIMIT = 'permanentLimit';
export const RATIO_TAP_CHANGER = 'ratioTapChanger';
export const PHASE_TAP_CHANGER = 'phaseTapChanger';
export const ENABLED = 'enabled';
export const LOAD_TAP_CHANGING_CAPABILITIES = 'loadTapChangingCapabilities';
export const REGULATING = 'regulating';
export const TARGET_V = 'targetV';
export const TARGET_DEADBAND = 'targetDeadband';
export const LOW_TAP_POSITION = 'lowTapPosition';
export const HIGH_TAP_POSITION = 'highTapPosition';
export const TAP_POSITION = 'tapPosition';
export const STEPS = 'steps';
export const STEPS_TAP = 'tap';
export const STEPS_RESISTANCE = 'resistance';
export const STEPS_REACTANCE = 'reactance';
export const STEPS_CONDUCTANCE = 'conductance';
export const STEPS_SUSCEPTANCE = 'susceptance';
export const STEPS_RATIO = 'ratio';
export const STEPS_ALPHA = 'alpha';
export const VOLTAGE_LEVEL = 'voltageLevel';
export const VOLTAGE_LEVEL_ID = 'id';
export const VOLTAGE_LEVEL_NAME = 'name';
export const VOLTAGE_LEVEL_SUBSTATION_ID = 'substationId';
export const VOLTAGE_LEVEL_NOMINAL_VOLTAGE = 'nominalVoltage';
export const VOLTAGE_LEVEL_TOPOLOGY_KIND = 'topologyKind';
export const EQUIPMENT = 'equipment';
export const EQUIPMENT_TYPE = 'type';

//PHASE TAP
export const REGULATION_MODE = "regulationMode";

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [SERIES_RESISTANCE]: '',
    [SERIES_REACTANCE]: '',
    [MAGNETIZING_CONDUCTANCE]: '',
    [MAGNETIZING_SUSCEPTANCE]: '',
    [RATED_S]: '',
    [RATED_VOLTAGE_1]: '',
    [RATED_VOLTAGE_2]: '',
    [CURRENT_LIMITS_1]: {
        [PERMANENT_LIMIT]: '',
    },
    [CURRENT_LIMITS_2]: {
        [PERMANENT_LIMIT]: '',
    },
    [RATIO_TAP_CHANGER]: {
        [ENABLED]: false,
        [LOAD_TAP_CHANGING_CAPABILITIES]: false,
        [REGULATING]: false,
        [TARGET_V]: '',
        [TARGET_DEADBAND]: '',
        [VOLTAGE_LEVEL]: null,
        [EQUIPMENT]: null,
        [LOW_TAP_POSITION]: null,
        [HIGH_TAP_POSITION]: null,
        [TAP_POSITION]: '',
        [STEPS]: [
            {
                tap: 4,
                resistance: 1,
                reactance: 2,
                conductance: 3,
                susceptance: 4,
                ratio: 5,
            },
        ],
    },
    [PHASE_TAP_CHANGER]: {
        [ENABLED]: false,
        // [RATIO_TAP_LOAD_TAP_CHANGING_CAPABILITIES]: false,
        // [REGULATING]: false,
        // [TARGET_V]: '',
        // [TARGET_DEADBAND]: '',
        // [VOLTAGE_LEVEL]: null,
        // [EQUIPMENT]: null,
        // [LOW_TAP_POSITION]: null,
        // [HIGH_TAP_POSITION]: null,
        // [TAP_POSITION]: '',
        // [STEPS]: [
        //     {
        //         tap: 4,
        //         resistance: 1,
        //         reactance: 2,
        //         conductance: 3,
        //         susceptance: 4,
        //         ratio: 5,
        //     },
        // ],
    },
    ...getConnectivityEmptyFormData('connectivity1'),
    ...getConnectivityEmptyFormData('connectivity2'),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [SERIES_RESISTANCE]: yup.number().nullable().required(),
        [SERIES_REACTANCE]: yup.number().nullable().required(),
        [MAGNETIZING_CONDUCTANCE]: yup.number().nullable().required(),
        [MAGNETIZING_SUSCEPTANCE]: yup.number().nullable().required(),
        [RATED_S]: yup
            .number()
            .nullable()
            .test('min', 'RatedNominalPowerGreaterThanZero', (val) => val >= 0),
        [RATED_VOLTAGE_1]: yup.number().nullable().required(),
        [RATED_VOLTAGE_2]: yup.number().nullable().required(),
        [CURRENT_LIMITS_1]: yup.object().shape({
            [PERMANENT_LIMIT]: yup
                .number()
                .nullable()
                .test(
                    'min',
                    'permanentCurrentLimitGreaterThanZero',
                    (val) => val >= 0
                ),
        }),
        [CURRENT_LIMITS_2]: yup.object().shape({
            [PERMANENT_LIMIT]: yup
                .number()
                .nullable()
                .test(
                    'min',
                    'permanentCurrentLimitGreaterThanZero',
                    (val) => val >= 0
                ),
        }),
        [RATIO_TAP_CHANGER]: yup.object().shape({
            [ENABLED]: yup.bool().required(),
            [LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
            [REGULATING]: yup.bool().required(),
            [TARGET_V]: yup
                .number()
                .nullable()
                .test('min', 'TargetVoltageGreaterThanZero', (val) => val >= 0)
                .when(`${REGULATING}`, {
                    is: true,
                    then: (schema) => schema.required(),
                }),
            [TARGET_DEADBAND]: yup
                .number()
                .nullable()
                .test(
                    'min',
                    'TargetDeadbandGreaterThanZero',
                    (val) => val >= 0
                ),
            [VOLTAGE_LEVEL]: yup
                .object()
                .nullable()
                .required()
                .shape({
                    [VOLTAGE_LEVEL_ID]: yup.string(),
                    [VOLTAGE_LEVEL_NAME]: yup.string(),
                    [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
                    [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
                    [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(true),
                }),
            [EQUIPMENT]: yup
                .object()
                .nullable()
                .required()
                .shape({
                    [EQUIPMENT_ID]: yup.string(),
                    [EQUIPMENT_NAME]: yup.string(),
                    [EQUIPMENT_TYPE]: yup.string(),
                }),
            [LOW_TAP_POSITION]: yup
                .number()
                .nullable()
                .min(0)
                .max(100)
                .when(`${ENABLED}`, {
                    is: true,
                    then: (schema) => schema.required(),
                }),
            [HIGH_TAP_POSITION]: yup
                .number()
                .nullable()
                .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
                .max(100, 'HighTapPositionError'),
            [TAP_POSITION]: yup.lazy((value) => {
                if (value === '') {
                    return yup.string();
                }

                return yup.number().when(`${ENABLED}`, {
                    is: true,
                    then: (schema) => schema.required(),
                });
            }),
            [STEPS]: yup.array().of(
                yup.object().shape({
                    [STEPS_TAP]: yup.number().required(),
                    [STEPS_RESISTANCE]: yup.number(),
                    [STEPS_REACTANCE]: yup.number(),
                    [STEPS_CONDUCTANCE]: yup.number(),
                    [STEPS_SUSCEPTANCE]: yup.number(),
                    [STEPS_RATIO]: yup.number(),
                    [STEPS_ALPHA]: yup.number(),
                })
            ),
        }),
        [PHASE_TAP_CHANGER]: yup.object().shape({
            [ENABLED]: yup.bool().required(),
            // [RATIO_TAP_LOAD_TAP_CHANGING_CAPABILITIES]: yup.bool().required(),
            // [REGULATING]: yup.bool().required(),
            // [TARGET_V]: yup
            //     .number()
            //     .nullable()
            //     .test('min', 'TargetVoltageGreaterThanZero', (val) => val >= 0)
            //     .when(`${REGULATING}`, {
            //         is: true,
            //         then: (schema) => schema.required(),
            //     }),
            // [TARGET_DEADBAND]: yup
            //     .number()
            //     .nullable()
            //     .test(
            //         'min',
            //         'TargetDeadbandGreaterThanZero',
            //         (val) => val >= 0
            //     ),
            // [VOLTAGE_LEVEL]: yup
            //     .object()
            //     .nullable()
            //     .required()
            //     .shape({
            //         [VOLTAGE_LEVEL_ID]: yup.string(),
            //         [VOLTAGE_LEVEL_NAME]: yup.string(),
            //         [VOLTAGE_LEVEL_SUBSTATION_ID]: yup.string(),
            //         [VOLTAGE_LEVEL_NOMINAL_VOLTAGE]: yup.string(),
            //         [VOLTAGE_LEVEL_TOPOLOGY_KIND]: yup.string().nullable(true),
            //     }),
            // [EQUIPMENT]: yup
            //     .object()
            //     .nullable()
            //     .required()
            //     .shape({
            //         [EQUIPMENT_ID]: yup.string(),
            //         [EQUIPMENT_NAME]: yup.string(),
            //         [EQUIPMENT_TYPE]: yup.string(),
            //     }),
            // [LOW_TAP_POSITION]: yup
            //     .number()
            //     .nullable()
            //     .min(0)
            //     .max(100)
            //     .when(`${RATIO_TAP_CHANGER_ENABLED}`, {
            //         is: true,
            //         then: (schema) => schema.required(),
            //     }),
            // [HIGH_TAP_POSITION]: yup
            //     .number()
            //     .nullable()
            //     .min(yup.ref(LOW_TAP_POSITION), 'HighTapPositionError')
            //     .max(100, 'HighTapPositionError'),
            // [TAP_POSITION]: yup.lazy((value) => {
            //     if (value === '') {
            //         return yup.string();
            //     }

            //     return yup.number().when(`${RATIO_TAP_CHANGER_ENABLED}`, {
            //         is: true,
            //         then: (schema) => schema.required(),
            //     });
            // }),
            // [STEPS]: yup.array().of(
            //     yup.object().shape({
            //         [STEPS_TAP]: yup.number().required(),
            //         [STEPS_RESISTANCE]: yup.number(),
            //         [STEPS_REACTANCE]: yup.number(),
            //         [STEPS_CONDUCTANCE]: yup.number(),
            //         [STEPS_SUSCEPTANCE]: yup.number(),
            //         [STEPS_RATIO]: yup.number(),
            //         [STEPS_ALPHA]: yup.number(),
            //     })
            // ),
        }),
        ...getConnectivityFormValidationSchema('connectivity1'),
        ...getConnectivityFormValidationSchema('connectivity2'),
    })
    .required();

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

const DialogTab = {
    CHARACTERISTICS_TAB: 0,
    RATIO_TAP_TAB: 1,
    PHASE_TAP_TAB: 2,
};

const TwoWindingsTransformerCreationDialog = ({
    editData,
    currentNodeUuid,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const classes = useStyles();

    const equipmentPath = '2-windings-transformers';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        reset,
        formState: { isDirty },
    } = methods;

    const [tabIndex, setTabIndex] = useState(DialogTab.CHARACTERISTICS_TAB);
    const [dialogWidth, setDialogWidth] = useState('md');
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

    // const searchCopy = useFormSearchCopy({
    //     studyUuid,
    //     currentNodeUuid,
    //     equipmentPath,
    //     toFormValues: (data) => data,
    //     setFormValues: fromSearchCopyToFormValues,
    // });

    // useEffect(() => {
    //     if (editData) {
    //         fromEditDataToFormValues(editData);
    //     }
    // }, [fromEditDataToFormValues, editData]);

    const getTabIndicatorClass = (index) =>
        tabIndexesWithError.includes(index)
            ? {
                  indicator: classes.tabWithErrorIndicator,
              }
            : {};

    const getTabClass = (index) =>
        clsx({
            [classes.tabWithError]: tabIndexesWithError.includes(index),
        });

    const renderSubtitle = () => {
        return (
            <Grid container>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newValue) => setTabIndex(newValue)}
                    classes={getTabIndicatorClass(tabIndex)}
                >
                    <Tab
                        label={
                            <FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />
                        }
                        className={getTabClass(DialogTab.CHARACTERISTICS_TAB)}
                        onClick={() => setDialogWidth('sm')}
                    />
                    <Tab
                        onClick={() => setDialogWidth('xl')}
                        label={
                            <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                        }
                        className={getTabClass(DialogTab.RATIO_TAP_TAB)}
                    />
                    <Tab
                        onClick={() => setDialogWidth('xl')}
                        label={
                            <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                        }
                        className={getTabClass(DialogTab.PHASE_TAP_TAB)}
                    />
                </Tabs>
            </Grid>
        );
    };

    const onSubmit = useCallback(
        (load) => {
            alert(JSON.stringify(load, null, 4));
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                disabledSave={!isDirty}
                aria-labelledby="dialog-create-two-windings-transformer"
                maxWidth={dialogWidth}
                titleId="CreateTwoWindingsTransformer"
                subtitle={renderSubtitle()}
                //searchCopy={searchCopy}
                {...dialogProps}
            >
                <Box hidden={tabIndex !== DialogTab.CHARACTERISTICS_TAB} p={1}>
                    <TwoWindingsTransformerPane />
                </Box>

                <Box hidden={tabIndex !== DialogTab.RATIO_TAP_TAB} p={1}>
                    <RatioTapChangerPane />
                    {/* <RatioTapChangerPane
                     formValues={formValues}
                     setFormValues={setFormValues}
                     loadTapChangingCapabilitiesField={
                         ratioTapLoadTapChangingCapabilitiesField
                     }
                     ratioTapLoadTapChangingCapabilities={
                         ratioTapLoadTapChangingCapabilities
                     }
                     regulatingField={ratioTapRegulatingField}
                     handleRatioTapRows={handleRatioTapRows}
                     ratioTapChangerEnabledField={ratioTapChangerEnabledField}
                     ratioTapChangerEnabled={ratioTapChangerEnabled}
                     targetVoltage1Field={targetVoltage1Field}
                     targetDeadbandField={ratioTapTargetDeadbandField}
                     regulatingTerminalField={ratioTapRegulatingTerminalField}
                     lowTapPositionField={ratioLowTapPositionField}
                     lowTapPosition={ratioLowTapPosition}
                     highTapPositionField={ratioHighTapPositionField}
                     highTapPosition={ratioHighTapPosition}
                     tapPositionField={ratioTapPositionField}
                     ratioTapRows={ratioTapRows}
                     ratioCellIndexError={ratioCellIndexError}
                 /> */}
                </Box>

                <Box hidden={tabIndex !== DialogTab.PHASE_TAP_TAB} p={1}>
                    <PhaseTapChangerPane />
                    {/* <PhaseTapChangerPane
                     formValues={formValues}
                     setFormValues={setFormValues}
                     phaseTapRows={phaseTapRows}
                     handlePhaseTapRows={handlePhaseTapRows}
                     phaseTapChangerEnabled={phaseTapChangerEnabled}
                     phaseTapChangerEnabledField={phaseTapChangerEnabledField}
                     regulationModeField={regulationModeField}
                     regulationMode={regulationMode}
                     currentLimiterRegulatingValueField={
                         currentLimiterRegulatingValueField
                     }
                     flowSetPointRegulatingValueField={
                         flowSetPointRegulatingValueField
                     }
                     targetDeadbandField={phaseTapTargetDeadbandField}
                     regulatingTerminalField={phaseTapRegulatingTerminalField}
                     lowTapPositionField={phaseLowTapPositionField}
                     lowTapPosition={phaseLowTapPosition}
                     highTapPositionField={phaseHighTapPositionField}
                     highTapPosition={phaseHighTapPosition}
                     tapPositionField={phaseTapPositionField}
                     regulatingField={phaseTapRegulatingField}
                     phaseCellIndexError={phaseCellIndexError}
                 /> */}
                </Box>

                {/* <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'LOAD'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                /> */}
            </ModificationDialog>
        </FormProvider>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
