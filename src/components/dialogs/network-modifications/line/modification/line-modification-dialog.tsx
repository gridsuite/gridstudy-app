/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    getConcatenatedProperties,
    snackWithFallback,
    useSnackMessage,
    convertToOperationalLimitsGroupFormSchema,
    OperationalLimitsGroupFormSchema,
    BranchInfos,
    ComputedLineCharacteristics,
    convertToLineSegmentInfos,
    convertLimitsToOperationalLimitsGroupFormSchema,
    LineSegmentsFormData,
    lineModificationFormToDto,
    LineForm,
    LineModificationDto,
    lineModificationFormSchema,
    lineModificationEmptyFormData,
    LineModificationFormData,
    lineModificationDtoToForm,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyLine } from '../../../../../services/study/network-modifications';
import {
    fetchBusesOrBusbarSectionsForVoltageLevel,
    fetchNetworkElementInfos,
} from '../../../../../services/study/network';
import { useIntl } from 'react-intl';
import { FetchStatus } from '../../../../../services/utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { WithModificationId } from 'services/network-modification-types';
import { EquipmentModificationDialogProps } from 'components/graph/menus/network-modifications/network-modification-menu.type';

interface LineModificationDtoWithId extends LineModificationDto, WithModificationId {}

export type LineModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: LineModificationDtoWithId;
};

/**
 * Dialog to modify a line in the network
 * @param studyUuid
 * @param defaultIdValue the default line id, Used to pre-select an equipmentId when calling this dialog from the SLD or network map
 * @param currentNode
 * @param currentRootNetworkUuid
 * @param editData the data to edit, contains data when we try to edit an existing hypothesis from the current node's list
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineModificationDialog = ({
    editData,
    defaultIdValue,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LineModificationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [lineToModify, setLineToModify] = useState<BranchInfos | null>(null);
    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useFormWithDirtyTracking<DeepNullable<LineModificationFormData>>({
        defaultValues: lineModificationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineModificationFormData>>(lineModificationFormSchema),
    });

    const { reset, setValue, getValues, watch } = formMethods;

    const editSegmentsValue = watch(FieldConstants.LINE_SEGMENTS) as LineSegmentsFormData;
    const applySegmentsLimits = watch(FieldConstants.APPLY_SEGMENTS_LIMITS) as boolean;

    const editSegmentsData = useMemo(
        () => ({
            [FieldConstants.LINE_SEGMENTS]: editSegmentsValue ?? [],
            [FieldConstants.APPLY_SEGMENTS_LIMITS]: applySegmentsLimits ?? true,
        }),
        [editSegmentsValue, applySegmentsLimits]
    );

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset(lineModificationDtoToForm(editData));
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (lineForm: LineModificationFormData) => {
            const dto = lineModificationFormToDto(lineForm, intl);
            modifyLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'LineModificationError' });
            });
        },
        [currentNodeUuid, editData?.uuid, intl, snackError, studyUuid]
    );

    const clear = () => {
        reset(lineModificationEmptyFormData);
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.LINE,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((line: BranchInfos) => {
                        if (line) {
                            setLineToModify(line);
                            reset(
                                (formValues: DeepNullable<LineModificationFormData>) => ({
                                    ...formValues,
                                    ...{
                                        [FieldConstants.LIMITS]: formValues?.limits?.[
                                            FieldConstants.ENABLE_OLG_MODIFICATION
                                        ]
                                            ? {
                                                  [FieldConstants.ENABLE_OLG_MODIFICATION]:
                                                      formValues.limits?.[FieldConstants.ENABLE_OLG_MODIFICATION],
                                                  [FieldConstants.OPERATIONAL_LIMITS_GROUPS]:
                                                      formValues.limits?.operationalLimitsGroups ?? [],
                                              }
                                            : {
                                                  [FieldConstants.ENABLE_OLG_MODIFICATION]: false,
                                                  [FieldConstants.OPERATIONAL_LIMITS_GROUPS]:
                                                      convertToOperationalLimitsGroupFormSchema(
                                                          line?.currentLimits ?? []
                                                      ),
                                              },
                                    },
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(line, getValues),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setLineToModify(null);
                        }
                    });
            } else {
                setLineToModify(null);
                reset(lineModificationEmptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset, getValues, editData?.equipmentId]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const handleLineSegmentsBuildSubmit = (
        data: ComputedLineCharacteristics,
        lineSegments: LineSegmentsFormData,
        applyLimits: boolean | null
    ) => {
        const setCharacteristic = (field: string, value: number) =>
            setValue(`${FieldConstants.CHARACTERISTICS}.${field}` as any, value, { shouldDirty: true });

        setCharacteristic(FieldConstants.R, data[FieldConstants.TOTAL_RESISTANCE]);
        setCharacteristic(FieldConstants.X, data[FieldConstants.TOTAL_REACTANCE]);
        setCharacteristic(FieldConstants.B1, data[FieldConstants.TOTAL_SUSCEPTANCE] / 2);
        setCharacteristic(FieldConstants.B2, data[FieldConstants.TOTAL_SUSCEPTANCE] / 2);

        setValue(FieldConstants.LINE_SEGMENTS, convertToLineSegmentInfos(lineSegments));

        const shouldApplyLimits = applyLimits ?? true;
        setValue(FieldConstants.APPLY_SEGMENTS_LIMITS, shouldApplyLimits);
        if (shouldApplyLimits) {
            const limitsFromSegments = convertLimitsToOperationalLimitsGroupFormSchema(
                data[FieldConstants.FINAL_CURRENT_LIMITS]
            );
            const actualLimits: OperationalLimitsGroupFormSchema[] =
                (getValues(
                    `${FieldConstants.LIMITS}.${FieldConstants.OPERATIONAL_LIMITS_GROUPS}`
                ) as OperationalLimitsGroupFormSchema[]) ?? [];
            const mergedLimits = [
                ...actualLimits.filter(
                    (actualLimit) =>
                        !limitsFromSegments.some(
                            (limitsFromSegment) =>
                                limitsFromSegment[FieldConstants.NAME] === actualLimit[FieldConstants.NAME]
                        )
                ),
                ...limitsFromSegments,
            ];
            setValue(`${FieldConstants.LIMITS}.${FieldConstants.OPERATIONAL_LIMITS_GROUPS}` as any, mergedLimits);
            setValue(`${FieldConstants.LIMITS}.${FieldConstants.ENABLE_OLG_MODIFICATION}` as any, true);
        }
    };

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

    return (
        <CustomFormProvider
            validationSchema={lineModificationFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'xl'}
                titleId="ModifyLine"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                slotProps={{
                    paper: {
                        sx: {
                            height: '95vh',
                        },
                    },
                }}
                onOpenCatalogDialog={selectedId != null ? () => setIsOpenLineTypesCatalogDialog(true) : undefined}
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.LINE}
                    />
                )}
                {selectedId != null && (
                    <>
                        <LineForm
                            lineToModify={lineToModify}
                            voltageLevelOptions={voltageLevelOptions}
                            PositionDiagramPane={PositionDiagramPane}
                            fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                            isModification
                        />
                        <LineTypeSegmentDialog
                            open={isOpenLineTypesCatalogDialog}
                            onClose={handleCloseLineTypesCatalogDialog}
                            onSave={handleLineSegmentsBuildSubmit}
                            editData={editSegmentsData}
                            isModification
                        />
                    </>
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineModificationDialog;
