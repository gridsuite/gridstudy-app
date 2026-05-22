/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ModificationDialog } from '../../../commons/modificationDialog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BusbarSectionVMeasurementInfo,
    BusbarSectionVoltageMeasurementsForm,
    convertInputValue,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    EquipmentWithProperties,
    FieldConstants,
    FieldType,
    getConcatenatedProperties,
    Identifiable,
    snackWithFallback,
    toModificationOperation,
    useSnackMessage,
    VoltageLevelDto,
    VoltageLevelModificationDto,
    VoltageLevelModificationForm,
    VoltageLevelModificationFormData,
    voltageLevelModificationDtoToForm,
    voltageLevelModificationEmptyFormData,
    voltageLevelModificationFormSchema,
    voltageLevelModificationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyVoltageLevel } from '../../../../../services/study/network-modifications';
import { fetchBusesOrBusbarSectionsForVoltageLevel, fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import yup from 'components/utils/yup-config';
import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getTabIndicatorStyle, getTabStyle } from 'components/utils/tab-utils';
import GridSection from 'components/dialogs/commons/grid-section';
import { BusbarSectionFormInfos, BusbarSectionMeasurementFormItem } from '../voltage-level-dialog.type';
import { BusbarSectionVMeasurementDto } from '../../../../../services/network-modification-types';

type FetchStatusType = (typeof FetchStatus)[keyof typeof FetchStatus];

const BUSBAR_SECTION_V_MEASUREMENTS = 'busbarSectionVMeasurements';

enum VoltageLevelDialogTab {
    CHARACTERISTICS_TAB = 0,
    STATE_ESTIMATION_TAB = 1,
}

const bbsMeasurementSchema = yup.object().shape({
    busbarSectionId: yup.string().required(),
    value: yup.number().nullable(),
    validity: yup.boolean().nullable(),
});

const extendedFormSchema = voltageLevelModificationFormSchema.concat(
    yup.object().shape({
        [BUSBAR_SECTION_V_MEASUREMENTS]: yup.array().of(bbsMeasurementSchema).nullable(),
    })
);

type ExtendedFormData = VoltageLevelModificationFormData & {
    [BUSBAR_SECTION_V_MEASUREMENTS]: BusbarSectionMeasurementFormItem[] | null;
};

interface VoltageLevelModificationDialogProps {
    editData?: VoltageLevelModificationDto & { busbarSectionVMeasurements?: BusbarSectionVMeasurementDto[] | null };
    defaultIdValue?: string | null;
    currentNode: CurrentTreeNode | null;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatusType;
    [key: string]: any;
}

const VoltageLevelModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: VoltageLevelModificationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [voltageLevelToModify, setVoltageLevelToModify] = useState<VoltageLevelDto | undefined>();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [tabIndex, setTabIndex] = useState(VoltageLevelDialogTab.CHARACTERISTICS_TAB);
    const [busbarSections, setBusbarSections] = useState<BusbarSectionFormInfos[]>([]);

    const emptyFormData = useMemo(
        () => ({
            ...voltageLevelModificationEmptyFormData,
            [FieldConstants.HIDE_SUBSTATION_FIELD]: false,
            [BUSBAR_SECTION_V_MEASUREMENTS]: [],
        }),
        []
    );

    const formMethods = useFormWithDirtyTracking<DeepNullable<ExtendedFormData>>({
        defaultValues: emptyFormData as DeepNullable<ExtendedFormData>,
        resolver: yupResolver<DeepNullable<ExtendedFormData>>(extendedFormSchema as any),
    });

    const { reset, getValues, subscribe, trigger, setValue } = formMethods;

    useEffect(() => {
        const callback = subscribe({
            name: [FieldConstants.HIGH_VOLTAGE_LIMIT],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }) => {
                if (isSubmitted) {
                    trigger(FieldConstants.LOW_VOLTAGE_LIMIT).then();
                }
            },
        });
        return () => callback();
    }, [trigger, subscribe]);

    const buildBbsMeasurementItems = useCallback(
        (
            networkBbsList: BusbarSectionFormInfos[],
            existingMeasurements?: BusbarSectionVMeasurementDto[] | null
        ): BusbarSectionMeasurementFormItem[] => {
            return networkBbsList.map((bbs) => {
                const existing = existingMeasurements?.find((m) => m.busbarSectionId === bbs.id);
                return {
                    busbarSectionId: bbs.id,
                    value: existing?.vMeasurementValue?.value ?? null,
                    validity: existing?.vMeasurementValidity?.value ?? null,
                };
            });
        },
        []
    );

    const fetchBusbarSections = useCallback(
        (voltageLevelId: string, existingMeasurements?: BusbarSectionVMeasurementDto[] | null) => {
            fetchBusesOrBusbarSectionsForVoltageLevel(studyUuid, currentNodeUuid as UUID, currentRootNetworkUuid, voltageLevelId)
                .then((bbsList: Identifiable[]) => {
                    if (!bbsList || bbsList.length === 0) {
                        setBusbarSections([]);
                        setValue(BUSBAR_SECTION_V_MEASUREMENTS as any, []);
                        return;
                    }
                    Promise.all(
                        bbsList.map((bbs) =>
                            fetchNetworkElementInfos(
                                studyUuid,
                                currentNodeUuid,
                                currentRootNetworkUuid,
                                EquipmentType.BUSBAR_SECTION,
                                EQUIPMENT_INFOS_TYPES.FORM.type,
                                bbs.id,
                                true
                            ).catch(() => ({ id: bbs.id, name: bbs.name ?? undefined } as BusbarSectionFormInfos))
                        )
                    ).then((formDataList) => {
                        const bbsFormData = formDataList as BusbarSectionFormInfos[];
                        setBusbarSections(bbsFormData);
                        setValue(
                            BUSBAR_SECTION_V_MEASUREMENTS as any,
                            buildBbsMeasurementItems(bbsFormData, existingMeasurements)
                        );
                    });
                })
                .catch(() => {
                    setBusbarSections([]);
                    setValue(BUSBAR_SECTION_V_MEASUREMENTS as any, []);
                });
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, setValue, buildBbsMeasurementItems]
    );

    useEffect(() => {
        if (editData) {
            if (editData.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                ...voltageLevelModificationDtoToForm(editData),
                [FieldConstants.HIDE_SUBSTATION_FIELD]: false,
                [BUSBAR_SECTION_V_MEASUREMENTS]: [],
            } as DeepNullable<ExtendedFormData>);
        }
    }, [editData, reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((voltageLevel: VoltageLevelDto) => {
                        if (voltageLevel) {
                            //We convert values of low short circuit current limit and high short circuit current limit from A to KA
                            if (voltageLevel.identifiableShortCircuit) {
                                voltageLevel.identifiableShortCircuit.ipMax = convertInputValue(
                                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                                    voltageLevel.identifiableShortCircuit?.ipMax
                                );
                                voltageLevel.identifiableShortCircuit.ipMin = convertInputValue(
                                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                                    voltageLevel.identifiableShortCircuit?.ipMin
                                );
                            }
                            setVoltageLevelToModify(voltageLevel);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                        voltageLevel as EquipmentWithProperties,
                                        getValues
                                    ),
                                    [FieldConstants.SUBSTATION_ID]: voltageLevel.substationId ?? null,
                                }),
                                { keepDirty: true }
                            );
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setVoltageLevelToModify(undefined);
                        }
                    });

                fetchBusbarSections(equipmentId, editData?.busbarSectionVMeasurements);
            } else {
                setVoltageLevelToModify(undefined);
                setBusbarSections([]);
                reset(emptyFormData as DeepNullable<ExtendedFormData>, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset, getValues, editData, emptyFormData, fetchBusbarSections]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (vlForm: ExtendedFormData) => {
            const bbsMeasurements = vlForm[BUSBAR_SECTION_V_MEASUREMENTS];
            modifyVoltageLevel({
                studyUuid,
                nodeUuid: currentNodeUuid as UUID,
                modificationUuid: editData?.uuid,
                ...voltageLevelModificationFormToDto(vlForm),
                busbarSectionVMeasurements:
                    bbsMeasurements && bbsMeasurements.length > 0
                        ? bbsMeasurements.map((item) => ({
                              busbarSectionId: item.busbarSectionId,
                              vMeasurementValue: toModificationOperation(item.value ?? null),
                              vMeasurementValidity: toModificationOperation(item.validity ?? null),
                          }))
                        : null,
            } as any).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelModificationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData as DeepNullable<ExtendedFormData>);
        setBusbarSections([]);
    }, [emptyFormData, reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            validationSchema={extendedFormSchema as any}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                open={open}
                titleId="ModifyVoltageLevel"
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={4}
                    />
                )}
                {selectedId != null && (
                    <>
                        <Tabs
                            value={tabIndex}
                            variant="scrollable"
                            onChange={(_event, newValue: number) => setTabIndex(newValue)}
                            TabIndicatorProps={{
                                sx: getTabIndicatorStyle([], tabIndex),
                            }}
                        >
                            <Tab
                                label={<FormattedMessage id="CharacteristicsTab" />}
                                sx={getTabStyle([], VoltageLevelDialogTab.CHARACTERISTICS_TAB)}
                            />
                            <Tab
                                label={<FormattedMessage id="StateEstimationTab" />}
                                sx={getTabStyle([], VoltageLevelDialogTab.STATE_ESTIMATION_TAB)}
                            />
                        </Tabs>
                        <Box hidden={tabIndex !== VoltageLevelDialogTab.CHARACTERISTICS_TAB} p={1}>
                            <VoltageLevelModificationForm voltageLevelToModify={voltageLevelToModify} />
                        </Box>
                        <Box hidden={tabIndex !== VoltageLevelDialogTab.STATE_ESTIMATION_TAB} p={1}>
                            <GridSection title="MeasurementsSection" />
                            <BusbarSectionVoltageMeasurementsForm busbarSections={busbarSections as BusbarSectionVMeasurementInfo[]} />
                        </Box>
                    </>
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default VoltageLevelModificationDialog;
