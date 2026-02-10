/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    CustomFormProvider,
    DeepNullable,
    emptyProperties,
    EquipmentType,
    EquipmentWithProperties,
    FieldType,
    getPropertiesFromModification,
    sanitizeString,
    snackWithFallback,
    toModificationProperties,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Breakpoint, Grid } from '@mui/material';
import {
    B,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    G,
    ID,
    LIMITS,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    OPERATIONAL_LIMITS_GROUPS,
    PHASE_TAP_CHANGER,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useCallback, useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import {
    FORM_LOADING_DELAY,
    PHASE_REGULATION_MODES,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
    UNDEFINED_CONNECTION_DIRECTION,
} from 'components/network/constants';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { getConnectivityFormData } from '../../../connectivity/connectivity-form-utils';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
    PhaseTapChangerFormSchema,
} from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
    RatioTapChangerFormSchema,
} from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import TwoWindingsTransformerCreationDialogTabs from './two-windings-transformer-creation-dialog-tabs';
import TwoWindingsTransformerCreationCharacteristicsPane from './characteristics-pane/two-windings-transformer-creation-characteristics-pane';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerFormData,
    getTwoWindingsTransformerValidationSchema,
} from './characteristics-pane/two-windings-transformer-creation-characteristics-pane-utils';
import {
    getAllLimitsFormData,
    getLimitsEmptyFormData,
    getLimitsValidationSchema,
    LimitsFormSchema,
    sanitizeLimitsGroups,
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerCreationDialogHeader from './two-windings-transformer-creation-dialog-header';
import { addSelectedFieldToRows, computeHighTapPosition, formatCompleteCurrentLimit } from 'components/utils/utils';
import { createTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import { TwoWindingsTransformerCreationDialogTab } from '../two-windings-transformer-utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { FetchStatus } from 'services/utils.type';
import {
    CharacteristicsCreationFormSchema,
    ConnectivityFormSchema,
    TapChangerMapInfos,
    TwoWindingsTransformerMapInfos,
} from '../two-windings-transformer.types';
import {
    OperationalLimitsGroupInfos,
    PhaseTapChangerCreationInfos,
    RatioTapChangerCreationInfos,
    TapChangerCreationInfos,
    TwoWindingsTransformerCreationInfo,
} from 'services/network-modification-types';
import { CurrentLimitsData } from 'services/study/network-map.type';
import { OperationalLimitsGroupFormSchema } from 'components/dialogs/limits/operational-limits-groups-types';
/**
 * Dialog to create a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getTwoWindingsTransformerEmptyFormData(),
    ...getLimitsEmptyFormData(false),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        ...getTwoWindingsTransformerValidationSchema(),
        ...getLimitsValidationSchema(),
        ...getRatioTapChangerValidationSchema(),
        ...getPhaseTapChangerValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

type BaseFormValues = yup.InferType<typeof formSchema>;

export type TwoWindingsTransformerCreationFormValues = BaseFormValues & {
    [CHARACTERISTICS]: CharacteristicsCreationFormSchema;
    [LIMITS]: LimitsFormSchema;
    [RATIO_TAP_CHANGER]: RatioTapChangerFormSchema;
    [PHASE_TAP_CHANGER]: PhaseTapChangerFormSchema;
};

export interface TwoWindingsTransformerCreationDialogProps {
    editData?: TwoWindingsTransformerCreationInfo;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    isUpdate?: boolean;
    editDataFetchStatus?: (typeof FetchStatus)[keyof typeof FetchStatus];
    onClose: () => void;
    onValidated?: () => void;
}
const TwoWindingsTransformerCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: TwoWindingsTransformerCreationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<TwoWindingsTransformerCreationFormValues>>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema) as unknown as Resolver<
            DeepNullable<TwoWindingsTransformerCreationFormValues>
        >,
    });

    const { reset } = formMethods;

    const [tabIndex, setTabIndex] = useState(TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [dialogWidth, setDialogWidth] = useState<Breakpoint>('xl');

    const computeRatioTapChangerRegulationMode = (
        ratioTapChangerFormValues?: RatioTapChangerCreationInfos | TapChangerMapInfos | null
    ) => {
        if (ratioTapChangerFormValues?.[REGULATING]) {
            return RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
        } else {
            return RATIO_REGULATION_MODES.FIXED_RATIO.id;
        }
    };

    const getTapSideForEdit = (
        twt: TwoWindingsTransformerCreationInfo,
        tap: TapChangerCreationInfos | null | undefined
    ) => {
        if (tap?.terminalRefConnectableId !== twt.equipmentId) {
            return null;
        }
        return tap?.terminalRefConnectableVlId === twt?.voltageLevelId1 ? SIDE.SIDE1.id : SIDE.SIDE2.id;
    };

    const getTapSideForCopy = (twt: TwoWindingsTransformerMapInfos, tap: TapChangerMapInfos | null | undefined) => {
        if (tap?.regulatingTerminalConnectableId !== twt.id) {
            return null;
        }
        return tap?.regulatingTerminalVlId === twt?.voltageLevelId1 ? SIDE.SIDE1.id : SIDE.SIDE2.id;
    };

    const getRegulationTypeForEdit = (twt: TwoWindingsTransformerCreationInfo, tap: TapChangerCreationInfos | null) => {
        if (tap?.terminalRefConnectableId == null) {
            return null;
        }
        return tap.terminalRefConnectableId === twt.equipmentId
            ? REGULATION_TYPES.LOCAL.id
            : REGULATION_TYPES.DISTANT.id;
    };

    const getRegulationTypeForCopy = (
        twt: TwoWindingsTransformerMapInfos,
        tap: TapChangerMapInfos | null | undefined
    ) => {
        if (tap?.regulatingTerminalConnectableId == null) {
            return null;
        }
        return tap.regulatingTerminalConnectableId === twt.id ? REGULATION_TYPES.LOCAL.id : REGULATION_TYPES.DISTANT.id;
    };

    const fromEditDataToFormValues = useCallback(
        (twt: TwoWindingsTransformerCreationInfo) => {
            reset({
                [EQUIPMENT_ID]: twt.equipmentId,
                [EQUIPMENT_NAME]: twt.equipmentName,
                ...getTwoWindingsTransformerFormData({
                    r: twt.r,
                    x: twt.x,
                    g: convertInputValue(FieldType.G, twt.g),
                    b: convertInputValue(FieldType.B, twt.b),
                    ratedU1: twt.ratedU1,
                    ratedU2: twt.ratedU2,
                    ratedS: twt.ratedS,
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: twt.busOrBusbarSectionId1,
                            connectionDirection: twt.connectionDirection1 ?? null,
                            connectionName: twt.connectionName1,
                            connectionPosition:
                                twt.connectionPosition1 !== null && twt.connectionPosition1 !== undefined
                                    ? Number(twt.connectionPosition1)
                                    : null,
                            voltageLevelId: twt.voltageLevelId1,
                            terminalConnected: twt.connected1,
                        },
                        CONNECTIVITY_1
                    ),
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: twt.busOrBusbarSectionId2,
                            connectionDirection: twt.connectionDirection2 ?? null,
                            connectionName: twt.connectionName2,
                            connectionPosition:
                                twt.connectionPosition2 !== null && twt.connectionPosition2 !== undefined
                                    ? Number(twt.connectionPosition2)
                                    : null,
                            voltageLevelId: twt.voltageLevelId2,
                            terminalConnected: twt.connected2,
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getAllLimitsFormData(
                    twt?.operationalLimitsGroups
                        ?.filter(
                            (group): group is OperationalLimitsGroupInfos & { id: string; applicability: string } =>
                                group.id != null && group.applicability != null
                        )
                        .map(({ id, currentLimits, applicability, limitsProperties }) => ({
                            id: id + applicability,
                            name: id,
                            applicability,
                            limitsProperties: limitsProperties ?? undefined,
                            currentLimits: {
                                permanentLimit: currentLimits?.permanentLimit ?? null,
                                temporaryLimits:
                                    currentLimits?.temporaryLimits?.map((tl) => ({
                                        name: tl.name ?? undefined,
                                        value: tl.value ?? undefined,
                                        acceptableDuration: tl.acceptableDuration ?? undefined,
                                    })) ?? [],
                            },
                        })),
                    twt?.selectedOperationalLimitsGroupId1 ?? null,
                    twt?.selectedOperationalLimitsGroupId2 ?? null
                ),
                ...getPhaseTapChangerFormData({
                    enabled: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATING]
                        ? twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]
                        : PHASE_REGULATION_MODES.OFF.id,
                    regulationType: getRegulationTypeForEdit(twt, twt?.[PHASE_TAP_CHANGER]),
                    regulationSide: getTapSideForEdit(twt, twt?.[PHASE_TAP_CHANGER]),
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                            : null,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                            : null,
                    targetDeadband: twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? []),
                    tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                    steps: addSelectedFieldToRows(twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? []),
                    equipmentId: twt?.[PHASE_TAP_CHANGER]?.terminalRefConnectableId ?? undefined,
                    equipmentType: twt?.[PHASE_TAP_CHANGER]?.terminalRefConnectableType ?? undefined,
                    voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.terminalRefConnectableVlId ?? undefined,
                }),
                ...getRatioTapChangerFormData({
                    enabled: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    hasLoadTapChangingCapabilities: twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES],
                    regulationMode: computeRatioTapChangerRegulationMode(twt?.[RATIO_TAP_CHANGER]),
                    regulationType: getRegulationTypeForEdit(twt, twt?.[RATIO_TAP_CHANGER]),
                    regulationSide: getTapSideForEdit(twt, twt?.[RATIO_TAP_CHANGER]),
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                    targetDeadband: twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition: twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(twt?.[RATIO_TAP_CHANGER]?.[STEPS] ?? []),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                    steps: addSelectedFieldToRows(twt?.[RATIO_TAP_CHANGER]?.[STEPS] ?? []),
                    equipmentId: twt?.[RATIO_TAP_CHANGER]?.terminalRefConnectableId ?? undefined,
                    equipmentType: twt?.[RATIO_TAP_CHANGER]?.terminalRefConnectableType ?? undefined,
                    voltageLevelId: twt?.[RATIO_TAP_CHANGER]?.terminalRefConnectableVlId ?? undefined,
                }),
                ...getPropertiesFromModification(twt.properties),
            } as DeepNullable<TwoWindingsTransformerCreationFormValues>);
        },
        [reset]
    );

    const fromSearchCopyToFormValues = useCallback(
        (twt: TwoWindingsTransformerMapInfos) => {
            reset(
                {
                    [EQUIPMENT_ID]: twt.id + '(1)',
                    [EQUIPMENT_NAME]: twt.name ?? '',
                    ...getTwoWindingsTransformerFormData({
                        r: twt.r,
                        x: twt.x,
                        g: convertInputValue(FieldType.G, twt.g),
                        b: convertInputValue(FieldType.B, twt.b),
                        ratedU1: twt.ratedU1,
                        ratedU2: twt.ratedU2,
                        ratedS: twt.ratedS ?? null,
                        ...getConnectivityFormData(
                            {
                                busbarSectionId: twt.busOrBusbarSectionId1,
                                connectionDirection: twt.connectablePosition1?.connectionDirection ?? null,
                                connectionName: twt.connectablePosition1?.connectionName,
                                voltageLevelId: twt.voltageLevelId1,
                            },
                            CONNECTIVITY_1
                        ),
                        ...getConnectivityFormData(
                            {
                                busbarSectionId: twt.busOrBusbarSectionId2,
                                connectionDirection: twt.connectablePosition2?.connectionDirection ?? null,
                                connectionName: twt.connectablePosition2?.connectionName,
                                voltageLevelId: twt.voltageLevelId2,
                            },
                            CONNECTIVITY_2
                        ),
                    }),
                    ...getAllLimitsFormData(
                        formatCompleteCurrentLimit(twt.currentLimits as CurrentLimitsData[]),
                        twt.selectedOperationalLimitsGroupId1 ?? null,
                        twt.selectedOperationalLimitsGroupId2 ?? null
                    ),
                    ...getRatioTapChangerFormData({
                        enabled: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                        hasLoadTapChangingCapabilities: twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES],
                        regulationMode: computeRatioTapChangerRegulationMode(twt?.[RATIO_TAP_CHANGER]),
                        regulationType: getRegulationTypeForCopy(twt, twt?.[RATIO_TAP_CHANGER]),
                        regulationSide: getTapSideForCopy(twt, twt?.[RATIO_TAP_CHANGER]),
                        targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                        targetDeadband: Number.isNaN(twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND] ?? Number.NaN)
                            ? null
                            : twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                        lowTapPosition: twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                        highTapPosition: computeHighTapPosition(twt?.[RATIO_TAP_CHANGER]?.[STEPS] ?? []),
                        tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                        steps: addSelectedFieldToRows(twt?.[RATIO_TAP_CHANGER]?.[STEPS] ?? []),
                        equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId,
                        equipmentType: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableType,
                        voltageLevelId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                    }),
                    ...getPhaseTapChangerFormData({
                        enabled: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                        regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATING]
                            ? twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]
                            : PHASE_REGULATION_MODES.OFF.id,
                        regulationType: getRegulationTypeForCopy(twt, twt?.[PHASE_TAP_CHANGER]),
                        regulationSide: getTapSideForCopy(twt, twt?.[PHASE_TAP_CHANGER]),
                        currentLimiterRegulatingValue:
                            twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                                ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                                : null,
                        flowSetpointRegulatingValue:
                            twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] ===
                            PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                                ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                                : null,
                        targetDeadband: Number.isNaN(twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND] ?? Number.NaN)
                            ? null
                            : twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                        lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                        highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? []),
                        tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                        steps: addSelectedFieldToRows(twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? []),
                        voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                        equipmentId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableId,
                        equipmentType: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableType,
                    }),
                    ...copyEquipmentPropertiesForCreation(twt as EquipmentWithProperties),
                } as DeepNullable<TwoWindingsTransformerCreationFormValues>,
                { keepDefaultValues: true }
            );
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const headerAndTabs = (
        <Grid container spacing={2}>
            <TwoWindingsTransformerCreationDialogHeader />
            <TwoWindingsTransformerCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                setDialogWidth={setDialogWidth}
            />
        </Grid>
    );

    const computeRatioTapChangerRegulating = (ratioTapChangerFormValues: RatioTapChangerFormSchema) => {
        return ratioTapChangerFormValues?.[REGULATION_MODE] === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
    };

    const computePhaseTapChangerRegulating = (phaseTapChangerFormValues: PhaseTapChangerFormSchema) => {
        return (
            phaseTapChangerFormValues?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id ||
            phaseTapChangerFormValues?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
        );
    };

    const computeRegulationModeValue = (phaseTapChangerFormValues: PhaseTapChangerFormSchema) => {
        if (phaseTapChangerFormValues?.[REGULATION_MODE] === PHASE_REGULATION_MODES.OFF.id) {
            return null;
        }

        return phaseTapChangerFormValues?.[REGULATION_MODE];
    };

    const computePhaseTapChangerRegulationValue = (phaseTapChangerFormValues: PhaseTapChangerFormSchema) => {
        switch (phaseTapChangerFormValues?.[REGULATION_MODE]) {
            case PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id:
                return phaseTapChangerFormValues?.[FLOW_SET_POINT_REGULATING_VALUE] ?? undefined;
            case PHASE_REGULATION_MODES.CURRENT_LIMITER.id:
                return phaseTapChangerFormValues?.[CURRENT_LIMITER_REGULATING_VALUE] ?? undefined;
            default:
                return undefined;
        }
    };

    const computeRegulatingTerminalType = (tapChangerValue: RatioTapChangerFormSchema | PhaseTapChangerFormSchema) => {
        if (tapChangerValue?.[EQUIPMENT]?.type) {
            return tapChangerValue?.[EQUIPMENT]?.type;
        }

        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
        }

        return undefined;
    };

    const computeTapTerminalVlId = (
        tapChangerValue: RatioTapChangerFormSchema | PhaseTapChangerFormSchema,
        connectivity1: ConnectivityFormSchema,
        connectivity2: ConnectivityFormSchema
    ) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            if (tapChangerValue?.[REGULATION_SIDE] === SIDE.SIDE1.id) {
                return connectivity1?.[VOLTAGE_LEVEL]?.[ID];
            } else {
                return connectivity2?.[VOLTAGE_LEVEL]?.[ID];
            }
        } else {
            return tapChangerValue?.[VOLTAGE_LEVEL]?.[ID];
        }
    };

    const computeRegulatingTerminalId = (
        tapChangerValue: RatioTapChangerFormSchema | PhaseTapChangerFormSchema,
        currentTwtId: string
    ) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return currentTwtId;
        } else {
            return tapChangerValue?.[EQUIPMENT]?.id;
        }
    };

    const onSubmit = useCallback(
        (twt: TwoWindingsTransformerCreationFormValues) => {
            const enablePhaseTapChanger = twt[PHASE_TAP_CHANGER]?.[ENABLED];
            const enableRatioTapChanger = twt[RATIO_TAP_CHANGER]?.[ENABLED];
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];

            characteristics[G] = convertOutputValue(FieldType.G, characteristics[G]);
            characteristics[B] = convertOutputValue(FieldType.B, characteristics[B]);

            let ratioTap = undefined;
            if (enableRatioTapChanger) {
                const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
                const hasLoadTapCapabilities = ratioTapChangerFormValues[LOAD_TAP_CHANGING_CAPABILITIES];

                const getValueOrDefault = (key: keyof RatioTapChangerFormSchema) => {
                    return hasLoadTapCapabilities ? ratioTapChangerFormValues[key] : null;
                };

                ratioTap = {
                    ...ratioTapChangerFormValues,
                    isRegulating: computeRatioTapChangerRegulating(ratioTapChangerFormValues),
                    terminalRefConnectableId: hasLoadTapCapabilities
                        ? computeRegulatingTerminalId(ratioTapChangerFormValues, twt[EQUIPMENT_ID])
                        : null,
                    terminalRefConnectableType: hasLoadTapCapabilities
                        ? computeRegulatingTerminalType(ratioTapChangerFormValues)
                        : null,
                    terminalRefConnectableVlId: hasLoadTapCapabilities
                        ? computeTapTerminalVlId(
                              ratioTapChangerFormValues,
                              characteristics[CONNECTIVITY_1],
                              characteristics[CONNECTIVITY_2]
                          )
                        : null,
                    targetV: getValueOrDefault(TARGET_V),
                    targetDeadband: getValueOrDefault(TARGET_DEADBAND),
                };
            }
            let phaseTap = undefined;
            if (enablePhaseTapChanger) {
                const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
                phaseTap = {
                    hasLoadTapChangingCapabilities: true,
                    isRegulating: computePhaseTapChangerRegulating(phaseTapChangerFormValues),
                    regulationValue: computePhaseTapChangerRegulationValue(phaseTapChangerFormValues),
                    terminalRefConnectableId: computeRegulatingTerminalId(phaseTapChangerFormValues, twt[EQUIPMENT_ID]),
                    terminalRefConnectableType: computeRegulatingTerminalType(phaseTapChangerFormValues),
                    terminalRefConnectableVlId: computeTapTerminalVlId(
                        phaseTapChangerFormValues,
                        characteristics[CONNECTIVITY_1],
                        characteristics[CONNECTIVITY_2]
                    ),
                    ...twt[PHASE_TAP_CHANGER],
                    regulationMode: computeRegulationModeValue(phaseTapChangerFormValues),
                };
            }

            createTwoWindingsTransformer({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                equipmentId: twt[EQUIPMENT_ID],
                equipmentName: sanitizeString(twt[EQUIPMENT_NAME]),
                r: characteristics[R],
                x: Number(characteristics[X]),
                g: Number(characteristics[G]),
                b: Number(characteristics[B]),
                ratedS: characteristics[RATED_S],
                ratedU1: Number(characteristics[RATED_U1]),
                ratedU2: Number(characteristics[RATED_U2]),
                operationalLimitsGroups: sanitizeLimitsGroups(
                    limits[OPERATIONAL_LIMITS_GROUPS] as OperationalLimitsGroupFormSchema[]
                ) as OperationalLimitsGroupInfos[],
                selectedOperationalLimitsGroupId1: String(limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID1]),
                selectedOperationalLimitsGroupId2: String(limits[SELECTED_OPERATIONAL_LIMITS_GROUP_ID2]),
                voltageLevelId1: String(characteristics[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId1: String(characteristics[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
                voltageLevelId2: String(characteristics[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId2: String(characteristics[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
                ratioTapChanger: (ratioTap as RatioTapChangerCreationInfos) ?? null,
                phaseTapChanger: (phaseTap as PhaseTapChangerCreationInfos) ?? null,
                isUpdate: !!editData,
                uuid: editData ? editData.uuid : '',
                connectionName1: sanitizeString(characteristics[CONNECTIVITY_1]?.[CONNECTION_NAME]),
                connectionDirection1:
                    characteristics[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName2: sanitizeString(characteristics[CONNECTIVITY_2]?.[CONNECTION_NAME]),
                connectionDirection2:
                    characteristics[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionPosition1: String(characteristics[CONNECTIVITY_1]?.[CONNECTION_POSITION]),
                connectionPosition2: String(characteristics[CONNECTIVITY_2]?.[CONNECTION_POSITION]),
                connected1: Boolean(characteristics[CONNECTIVITY_1]?.[CONNECTED]),
                connected2: Boolean(characteristics[CONNECTIVITY_2]?.[CONNECTED]),
                properties: toModificationProperties(twt as unknown as Record<string, unknown>),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'TwoWindingsTransformerCreationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const onValidationError = useCallback(
        (errors: Record<string, unknown>) => {
            const tabsInError = [];
            if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB);
            }
            if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB);
            }
            if (errors?.[CHARACTERISTICS] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB);
            }
            if (errors?.[LIMITS] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.LIMITS_TAB);
            }

            if (tabsInError.includes(tabIndex)) {
                // error in current tab => do not change tab systematically but remove current tab in error list
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
                // switch to the first tab in the list then remove the tab in the error list
                setTabIndex(tabsInError[0]);
                setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
            }
        },
        [tabIndex]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema as any} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                maxWidth={dialogWidth}
                titleId="CreateTwoWindingsTransformer"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <TwoWindingsTransformerCreationCharacteristicsPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.TWO_WINDINGS_TRANSFORMER}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default TwoWindingsTransformerCreationDialog;
