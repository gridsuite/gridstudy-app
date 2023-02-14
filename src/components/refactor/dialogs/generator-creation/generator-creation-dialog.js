/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../commons/modificationDialog';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    ID,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    NAME,
    NOMINAL_VOLTAGE,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_MAX_P,
    Q_MIN_P,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
    REGULATING_TERMINAL,
    STARTUP_COST,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../utils/field-constants';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import GeneratorCreationForm from './generator-creation-form';
import {
    getRegulatingTerminalEmptyFormData,
    getRegulatingTerminalFormData,
} from '../regulating-terminal/regulating-terminal-form-utils';
import { createGenerator } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import {
    REGULATION_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../../../network/constants';
import {
    toNumber,
    validateValueIsANumber,
} from '../../../util/validation-functions';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [VOLTAGE_REGULATION]: false,
    [FREQUENCY_REGULATION]: false,
    [ENERGY_SOURCE]: 'OTHER',
    [VOLTAGE_REGULATION_TYPE]: REGULATION_TYPES.LOCAL.id,
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [TRANSIENT_REACTANCE]: null,
    [TRANSFORMER_REACTANCE]: null,
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [STARTUP_COST]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
    [MINIMUM_REACTIVE_POWER]: null,
    [MAXIMUM_REACTIVE_POWER]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
    [VOLTAGE_SET_POINT]: null,
    [REACTIVE_CAPABILITY_CURVE_TABLE]: [{}, {}],
    [Q_PERCENT]: null,
    [DROOP]: null,
    ...getRegulatingTerminalEmptyFormData(),
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [ENERGY_SOURCE]: yup.string().required(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().required(),
        [RATED_NOMINAL_POWER]: yup.number().nullable(),
        [ACTIVE_POWER_SET_POINT]: yup.number().required(),
        [TRANSIENT_REACTANCE]: yup.number().nullable(),
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [STARTUP_COST]: yup.number().nullable(),
        [MARGINAL_COST]: yup.number().nullable(),
        [PLANNED_OUTAGE_RATE]: yup
            .number()
            .nullable()
            .min(0, 'RealPercentage')
            .max(1, 'RealPercentage'),
        [FORCED_OUTAGE_RATE]: yup
            .number()
            .nullable()
            .min(0, 'RealPercentage')
            .max(1, 'RealPercentage'),
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().required(),
        [MINIMUM_REACTIVE_POWER]: yup.number().nullable(),
        [MAXIMUM_REACTIVE_POWER]: yup.number().nullable(),
        [REACTIVE_POWER_SET_POINT]: yup
            .number()
            .nullable()
            .when([VOLTAGE_REGULATION], {
                is: false,
                then: (schema) => schema.required(),
            }),
        [FREQUENCY_REGULATION]: yup.bool().required(),
        [REACTIVE_CAPABILITY_CURVE_TABLE]: yup
            .array()
            .when([REACTIVE_CAPABILITY_CURVE_CHOICE], {
                is: 'CURVE',
                then: (schema) =>
                    schema
                        .of(
                            yup.object().shape({
                                [Q_MAX_P]: yup.number().required(),
                                [Q_MIN_P]: yup
                                    .number()
                                    .required()
                                    .lessThan(
                                        yup.ref(Q_MAX_P),
                                        'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'
                                    ),
                                [P]: yup
                                    .number()
                                    .required()
                                    .min(
                                        yup.ref(Q_MIN_P),
                                        'ReactiveCapabilityCurveCreationErrorPOutOfRange'
                                    )
                                    .max(
                                        yup.ref(Q_MAX_P),
                                        'ReactiveCapabilityCurveCreationErrorPOutOfRange'
                                    ),
                            })
                        )
                        .min(
                            2,
                            'ReactiveCapabilityCurveCreationErrorMissingPoints'
                        )
                        .test(
                            'validateP',
                            'ReactiveCapabilityCurveCreationErrorPInvalid',
                            (values) => {
                                const everyValidP = values
                                    .map((element) =>
                                        // Note : convertion toNumber is necessary here to prevent corner cases like if
                                        // two values are "-0" and "0", which would be considered different by the Set below.
                                        validateValueIsANumber(element.p)
                                            ? toNumber(element.p)
                                            : null
                                    )
                                    .filter((p) => p !== null);
                                const setOfPs = [...new Set(everyValidP)];
                                return setOfPs.length === everyValidP.length;
                            }
                        ),
            }),
        [VOLTAGE_REGULATION]: yup.bool().required(),
        [VOLTAGE_REGULATION_TYPE]: yup.string().when([VOLTAGE_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
        [VOLTAGE_SET_POINT]: yup.number().when([VOLTAGE_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
        [Q_PERCENT]: yup
            .number()
            .nullable()
            .max(100, 'NormalizedPercentage')
            .min(0, 'NormalizedPercentage'),
        [DROOP]: yup.number().when([FREQUENCY_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
        [REGULATING_TERMINAL]: yup.object().shape({
            [VOLTAGE_LEVEL]: yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string(),
                    [NAME]: yup.string(),
                    [SUBSTATION_ID]: yup.string(),
                    [NOMINAL_VOLTAGE]: yup.string(),
                    [TOPOLOGY_KIND]: yup.string().nullable(),
                })
                .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
                    is: (voltageRegulation, voltageRegulationType) =>
                        voltageRegulation &&
                        voltageRegulationType === REGULATION_TYPES.DISTANT.id,
                    then: (schema) => schema.required(),
                }),
            [EQUIPMENT]: yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string(),
                    [NAME]: yup.string().nullable(),
                    [TYPE]: yup.string(),
                })
                .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
                    is: (voltageRegulation, voltageRegulationType) =>
                        voltageRegulation &&
                        voltageRegulationType === REGULATION_TYPES.DISTANT.id,
                    then: (schema) => schema.required(),
                }),
        }),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

const GeneratorCreationDialog = ({
    editData,
    currentNodeUuid,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'generators';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;
    const fromSearchCopyToFormValues = (generator) => {
        reset({
            [EQUIPMENT_ID]: generator.id + '(1)',
            [EQUIPMENT_NAME]: generator.name ?? '',
            [ENERGY_SOURCE]: generator.energySource,
            [MAXIMUM_ACTIVE_POWER]: generator.maxP,
            [MINIMUM_ACTIVE_POWER]: generator.minP,
            [RATED_NOMINAL_POWER]: generator.ratedS,
            [ACTIVE_POWER_SET_POINT]: generator.targetP,
            [VOLTAGE_REGULATION]: generator.voltageRegulatorOn,
            [VOLTAGE_SET_POINT]: generator.targetV,
            [REACTIVE_POWER_SET_POINT]: generator.targetQ,
            ...getConnectivityFormData({
                voltageLevelId: generator.voltageLevelId,
                busbarSectionId: null,
                connectionDirection: generator.connectionDirection,
                connectionName: generator.connectionName,
                connectionPosition: generator.connectionPosition,
            }),
            [PLANNED_ACTIVE_POWER_SET_POINT]:
                generator.plannedActivePowerSetPoint,
            [STARTUP_COST]: generator.startupCost,
            [MARGINAL_COST]: generator.marginalCost,
            [PLANNED_OUTAGE_RATE]: generator.plannedOutageRate,
            [FORCED_OUTAGE_RATE]: generator.forcedOutageRate,
            [FREQUENCY_REGULATION]: generator.activePowerControlOn,
            [DROOP]: generator.droop,
            [TRANSIENT_REACTANCE]: generator.transientReactance,
            [TRANSFORMER_REACTANCE]: generator.stepUpTransformerReactance,
            [VOLTAGE_REGULATION_TYPE]:
                generator?.regulatingTerminalId ||
                generator?.regulatingTerminalConnectableId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
            [REACTIVE_CAPABILITY_CURVE_TABLE]:
                generator.reactiveCapabilityCurvePoints,
            [MINIMUM_REACTIVE_POWER]:
                generator?.minMaxReactiveLimits?.minimumReactivePower,
            [MAXIMUM_REACTIVE_POWER]:
                generator?.minMaxReactiveLimits?.maximumReactivePower,
            [Q_PERCENT]: generator.qPercent,
            [REACTIVE_CAPABILITY_CURVE_CHOICE]: generator?.minMaxReactiveLimits
                ? 'MINMAX'
                : 'CURVE',
            [REACTIVE_CAPABILITY_CURVE_TABLE]:
                generator?.reactiveCapabilityCurvePoints ?? [{}, {}],
            [REGULATING_TERMINAL]: getRegulatingTerminalFormData({
                equipmentId:
                    generator.regulatingTerminalConnectableId ||
                    generator.regulatingTerminalId,
                equipmentType: generator.regulatingTerminalConnectableType,
                voltageLevelId: generator.regulatingTerminalVlId,
            }),
        });
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [ENERGY_SOURCE]: editData.energySource,
                [MAXIMUM_ACTIVE_POWER]: editData.maxActivePower,
                [MINIMUM_ACTIVE_POWER]: editData.minActivePower,
                [RATED_NOMINAL_POWER]: editData.ratedNominalPower,
                [ACTIVE_POWER_SET_POINT]: editData.activePowerSetpoint,
                [VOLTAGE_REGULATION]: editData.voltageRegulationOn,
                [VOLTAGE_SET_POINT]: editData.voltageSetpoint,
                [REACTIVE_POWER_SET_POINT]: editData.targetQ,
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                }),
                [PLANNED_ACTIVE_POWER_SET_POINT]:
                    editData.plannedActivePowerSetPoint,
                [STARTUP_COST]: editData.startupCost,
                [MARGINAL_COST]: editData.marginalCost,
                [PLANNED_OUTAGE_RATE]: editData.plannedOutageRate,
                [FORCED_OUTAGE_RATE]: editData.forcedOutageRate,
                [FREQUENCY_REGULATION]: editData.participate,
                [DROOP]: editData.droop,
                [TRANSIENT_REACTANCE]: editData.transientReactance,
                [TRANSFORMER_REACTANCE]: editData.stepUpTransformerReactance,
                [VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                    ? REGULATION_TYPES.DISTANT.id
                    : REGULATION_TYPES.LOCAL.id,
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    editData.reactiveCapabilityCurvePoints,
                [MINIMUM_REACTIVE_POWER]: editData?.minimumReactivePower,
                [MAXIMUM_REACTIVE_POWER]: editData?.maximumReactivePower,
                [Q_PERCENT]: editData.qPercent,
                [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                    editData?.minimumReactivePower ||
                    editData?.maximumReactivePower
                        ? 'MINMAX'
                        : 'CURVE',
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    editData?.reactiveCapabilityCurvePoints ?? [{}, {}],
                [REGULATING_TERMINAL]: getRegulatingTerminalFormData({
                    equipmentId: editData.regulatingTerminalId,
                    equipmentType: editData.regulatingTerminalType,
                    voltageLevelId: editData.regulatingTerminalVlId,
                }),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {}, []);

    const onSubmit = useCallback(
        (generator) => {
            const isReactiveCapabilityCurveOn =
                generator[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const isDistantRegulation =
                generator[VOLTAGE_REGULATION] &&
                generator[VOLTAGE_REGULATION_TYPE] ===
                    REGULATION_TYPES.DISTANT.id;

            createGenerator(
                studyUuid,
                currentNodeUuid,
                generator[EQUIPMENT_ID],
                sanitizeString(generator[EQUIPMENT_NAME]),
                generator[ENERGY_SOURCE],
                generator[MINIMUM_ACTIVE_POWER],
                generator[MAXIMUM_ACTIVE_POWER],
                generator[RATED_NOMINAL_POWER] ?? null,
                generator[ACTIVE_POWER_SET_POINT],
                generator[REACTIVE_POWER_SET_POINT] ?? null,
                generator[VOLTAGE_REGULATION],
                generator[VOLTAGE_SET_POINT] ?? null,
                generator[Q_PERCENT],
                generator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                generator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                !!editData,
                editData?.uuid ?? null,
                generator[PLANNED_ACTIVE_POWER_SET_POINT] ?? null,
                generator[STARTUP_COST] ?? null,
                generator[MARGINAL_COST] ?? null,
                generator[PLANNED_OUTAGE_RATE] ?? null,
                generator[FORCED_OUTAGE_RATE] ?? null,
                generator[TRANSIENT_REACTANCE] ?? null,
                generator[TRANSFORMER_REACTANCE] ?? null,
                isDistantRegulation
                    ? generator[REGULATING_TERMINAL]?.[EQUIPMENT]?.id
                    : null,
                isDistantRegulation
                    ? generator[REGULATING_TERMINAL]?.[EQUIPMENT]?.type
                    : null,
                isDistantRegulation
                    ? generator[REGULATING_TERMINAL]?.[VOLTAGE_LEVEL]?.id
                    : null,
                isReactiveCapabilityCurveOn,
                generator[FREQUENCY_REGULATION],
                generator[DROOP] ?? null,
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? generator[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                generator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                generator[CONNECTIVITY]?.[CONNECTION_NAME] ?? null,
                generator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorCreationError',
                });
            });
        },
        [currentNodeUuid, editData, studyUuid, snackError]
    );

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-generator"
                maxWidth={'md'}
                titleId="CreateGenerator"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <GeneratorCreationForm
                    voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                    voltageLevelsEquipmentsOptionsPromise={
                        voltageLevelsEquipmentsOptionsPromise
                    }
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'GENERATOR'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorCreationDialog;
