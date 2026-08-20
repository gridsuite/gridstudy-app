/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldType,
    getAllLimitsFormData,
    getConnectivityFormDataProps,
    REGULATION_TYPES,
    snackWithFallback,
    useSnackMessage,
    TwoWindingsTransformerCreationDto,
    TwoWindingsTransformerCreationFormData,
    twoWindingsTransformerCreationEmptyFormData,
    twoWindingsTransformerCreationFormSchema,
    TwoWindingsTransformerMapInfos,
    TapChangerMapInfos,
    twoWindingsTransformerCreationDtoToForm,
    getPhaseTapChangerFormData,
    getRatioTapChangerFormData,
    computeRatioTapChangerRegulationMode,
    toTapChangerStepList,
    twoWindingsTransformerCreationFormToDto,
    TwoWindingsTransformerForm,
    REGULATION_SIDES,
    PHASE_REGULATION_MODES,
    TwoWindingsTransformerCreationDtoWithId,
    computeHighTapPosition,
    addSelectedFieldToRows,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    PHASE_TAP_CHANGER,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/utils/field-constants';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { formatCompleteCurrentLimit } from 'components/utils/utils';
import { createTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import { FetchStatus } from 'services/utils.type';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import { fetchVoltageLevelEquipments } from '../../../../../services/study/network-map';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';

type TwoWindingsTransformerCreationDialogProps = NetworkModificationDialogProps & {
    editData?: TwoWindingsTransformerCreationDtoWithId;
};

const TwoWindingsTransformerCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<TwoWindingsTransformerCreationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<TwoWindingsTransformerCreationFormData>>({
        defaultValues: twoWindingsTransformerCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<TwoWindingsTransformerCreationFormData>>(
            twoWindingsTransformerCreationFormSchema
        ),
    });

    const { reset } = formMethods;

    const getTapSideForCopy = (twt: TwoWindingsTransformerMapInfos, tap: TapChangerMapInfos | null | undefined) => {
        if (tap?.regulatingTerminalConnectableId !== twt.id) {
            return null;
        }
        return tap?.regulatingTerminalVlId === twt?.voltageLevelId1
            ? REGULATION_SIDES.SIDE1.id
            : REGULATION_SIDES.SIDE2.id;
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
        (dto: TwoWindingsTransformerCreationDto) => {
            reset(twoWindingsTransformerCreationDtoToForm(dto));
        },
        [reset]
    );

    const fromSearchCopyToFormValues = (twt: TwoWindingsTransformerMapInfos) => {
        const formData = {
            equipmentID: twt.id + '(1)',
            equipmentName: twt.name ?? '',
            connectivity: {
                connectivity1: getConnectivityFormDataProps({
                    busbarSectionId: twt.busOrBusbarSectionId1,
                    connectionDirection: twt.connectablePosition1?.connectionDirection ?? null,
                    connectionName: twt.connectablePosition1?.connectionName,
                    voltageLevelId: twt.voltageLevelId1,
                }),
                connectivity2: getConnectivityFormDataProps({
                    busbarSectionId: twt.busOrBusbarSectionId2,
                    connectionDirection: twt.connectablePosition2?.connectionDirection ?? null,
                    connectionName: twt.connectablePosition2?.connectionName,
                    voltageLevelId: twt.voltageLevelId2,
                }),
            },
            characteristics: {
                r: twt.r,
                x: twt.x,
                g: convertInputValue(FieldType.G, twt.g),
                b: convertInputValue(FieldType.B, twt.b),
                ratedU1: twt.ratedU1,
                ratedU2: twt.ratedU2,
                ratedS: twt.ratedS ?? null,
            },
            ...copyEquipmentPropertiesForCreation(twt),
            ...getAllLimitsFormData(
                formatCompleteCurrentLimit(twt.currentLimits ?? []),
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
                steps: addSelectedFieldToRows(toTapChangerStepList(twt?.[RATIO_TAP_CHANGER]?.[STEPS]) ?? []),
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
                    twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                        ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                        : null,
                targetDeadband: Number.isNaN(twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND] ?? Number.NaN)
                    ? null
                    : twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS] ?? []),
                tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                steps: addSelectedFieldToRows(toTapChangerStepList(twt?.[PHASE_TAP_CHANGER]?.[STEPS]) ?? []),
                voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                equipmentID: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableId,
                equipmentType: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableType,
            }),
        };
        reset(formData, { keepDefaultValues: true });
    };

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.TWO_WINDINGS_TRANSFORMER);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (twtForm: TwoWindingsTransformerCreationFormData) => {
            const dto = twoWindingsTransformerCreationFormToDto(twtForm);
            createTwoWindingsTransformer(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'TwoWindingsTransformerCreationError' });
            });
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(twoWindingsTransformerCreationEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    const fetchVoltageLevelEquipmentsCallback = useCallback(
        (voltageLevelId: string) =>
            fetchVoltageLevelEquipments(studyUuid, currentNodeUuid, currentRootNetworkUuid, voltageLevelId, true),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={twoWindingsTransformerCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'xl'}
                titleId="CreateTwoWindingsTransformer"
                searchCopy={searchCopy}
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh', // we want the dialog height to be fixed even when switching tabs
                        },
                    },
                }}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <TwoWindingsTransformerForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    fetchVoltageLevelEquipments={fetchVoltageLevelEquipmentsCallback}
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
