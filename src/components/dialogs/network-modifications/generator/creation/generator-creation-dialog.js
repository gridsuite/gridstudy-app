/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
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
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import GeneratorCreationForm from './generator-creation-form';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import { sanitizeString } from '../../../dialogUtils';
import {
    FORM_LOADING_DELAY,
    REGULATION_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
} from 'components/network/constants';
import {
    getSetPointsEmptyFormData,
    getSetPointsSchema,
} from '../../../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { createGenerator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ENERGY_SOURCE]: 'OTHER',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [RATED_NOMINAL_POWER]: null,
    [TRANSIENT_REACTANCE]: null,
    [TRANSFORMER_REACTANCE]: null,
    [PLANNED_ACTIVE_POWER_SET_POINT]: null,
    [MARGINAL_COST]: null,
    [PLANNED_OUTAGE_RATE]: null,
    [FORCED_OUTAGE_RATE]: null,
    ...getSetPointsEmptyFormData(),
    ...getReactiveLimitsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [ENERGY_SOURCE]: yup.string().nullable().required(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [RATED_NOMINAL_POWER]: yup.number().nullable(),
        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
        [TRANSIENT_REACTANCE]: yup
            .number()
            .nullable()
            .when([TRANSFORMER_REACTANCE], {
                is: (transformerReactance) => transformerReactance != null,
                then: (schema) => schema.required(),
            }),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
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
        ...getSetPointsSchema(),
        ...getReactiveLimitsSchema(),
        ...getConnectivityWithPositionValidationSchema(),
    })
    .required();

const GeneratorCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;
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
            [PLANNED_ACTIVE_POWER_SET_POINT]:
                generator.plannedActivePowerSetPoint,
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
            [Q_PERCENT]: isNaN(generator?.[Q_PERCENT])
                ? null
                : generator?.[Q_PERCENT],
            ...getReactiveLimitsFormData({
                reactiveCapabilityCurveChoice: generator?.minMaxReactiveLimits
                    ? 'MINMAX'
                    : 'CURVE',
                minimumReactivePower:
                    generator?.minMaxReactiveLimits?.minimumReactivePower ??
                    null,
                maximumReactivePower:
                    generator?.minMaxReactiveLimits?.maximumReactivePower ??
                    null,
                reactiveCapabilityCurveTable:
                    generator?.reactiveCapabilityCurvePoints ?? [{}, {}],
            }),
            ...getRegulatingTerminalFormData({
                equipmentId:
                    generator.regulatingTerminalConnectableId ||
                    generator.regulatingTerminalId,
                equipmentType: generator.regulatingTerminalConnectableType,
                voltageLevelId: generator.regulatingTerminalVlId,
            }),
            ...getConnectivityFormData({
                voltageLevelId: generator.voltageLevelId,
                busbarSectionId: generator.busOrBusbarSectionId,
                connectionDirection: generator.connectionDirection,
                connectionName: generator.connectionName,
            }),
        });
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.GENERATOR,
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
                [REACTIVE_POWER_SET_POINT]: editData.reactivePowerSetpoint,
                [PLANNED_ACTIVE_POWER_SET_POINT]:
                    editData.plannedActivePowerSetPoint,
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
                [Q_PERCENT]: editData.qPercent,
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice:
                        editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                    minimumReactivePower: editData?.minimumReactivePower,
                    maximumReactivePower: editData?.maximumReactivePower,
                    reactiveCapabilityCurveTable:
                        editData?.reactiveCapabilityCurve
                            ? editData?.reactiveCapabilityCurvePoints
                            : [{}, {}],
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId: editData.regulatingTerminalId,
                    equipmentType: editData.regulatingTerminalType,
                    voltageLevelId: editData.regulatingTerminalVlId,
                }),
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                }),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generator) => {
            const reactiveLimits = generator[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn =
                reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const isDistantRegulation =
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
                generator[RATED_NOMINAL_POWER],
                generator[ACTIVE_POWER_SET_POINT],
                generator[REACTIVE_POWER_SET_POINT],
                generator[VOLTAGE_REGULATION],
                generator[VOLTAGE_SET_POINT],
                generator[Q_PERCENT],
                generator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                generator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                !!editData,
                editData?.uuid ?? null,
                generator[PLANNED_ACTIVE_POWER_SET_POINT],
                generator[MARGINAL_COST],
                generator[PLANNED_OUTAGE_RATE],
                generator[FORCED_OUTAGE_RATE],
                generator[TRANSIENT_REACTANCE],
                generator[TRANSFORMER_REACTANCE],
                isDistantRegulation ? generator[EQUIPMENT]?.id : null,
                isDistantRegulation ? generator[EQUIPMENT]?.type : null,
                isDistantRegulation ? generator[VOLTAGE_LEVEL]?.id : null,
                isReactiveCapabilityCurveOn,
                generator[FREQUENCY_REGULATION],
                generator[DROOP] ?? null,
                isReactiveCapabilityCurveOn
                    ? null
                    : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : reactiveLimits[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                generator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(generator[CONNECTIVITY]?.[CONNECTION_NAME]),
                generator[CONNECTIVITY]?.[CONNECTION_POSITION]
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorCreationError',
                });
            });
        },
        [currentNodeUuid, editData, studyUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-generator"
                maxWidth={'md'}
                titleId="CreateGenerator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <GeneratorCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
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
