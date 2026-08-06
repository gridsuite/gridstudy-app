/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComputedLineCharacteristics,
    convertInputValue,
    convertLimitsToOperationalLimitsGroupFormSchema,
    convertToLineSegmentInfos,
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    FieldConstants,
    FieldType,
    getAllLimitsFormData,
    getConnectivityFormData,
    getLineCharacteristicsFormData,
    LineCreationDto,
    lineCreationDtoToForm,
    lineCreationEmptyFormData,
    LineCreationFormData,
    lineCreationFormSchema,
    lineCreationFormToDto,
    LineForm,
    LineFormInfos,
    LineSegmentsFormData,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/commons/use-form-search-copy';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createLine } from '../../../../../services/study/network-modifications';
import { formatCompleteCurrentLimit } from '../../../../utils/utils';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';
import LineTypeSegmentDialog from '../../../line-types-catalog/line-type-segment-dialog';

type LineCreationDialogProps = NetworkModificationDialogProps & {
    editData?: LineCreationDto;
    onCreateLine: typeof createLine;
    displayConnectivity?: boolean;
};

/**
 * Dialog to create a line in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param onCreateLine callback to customize line creation process
 * @param displayConnectivity to display connectivity tab or not
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    onCreateLine = createLine,
    displayConnectivity = true,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LineCreationDialogProps>) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const [isOpenLineTypesCatalogDialog, setIsOpenLineTypesCatalogDialog] = useState(false);

    const handleCloseLineTypesCatalogDialog = () => {
        setIsOpenLineTypesCatalogDialog(false);
    };

    const formMethods = useForm<DeepNullable<LineCreationFormData>>({
        defaultValues: lineCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<LineCreationFormData>>(lineCreationFormSchema(displayConnectivity)),
    });

    const { reset, setValue, watch } = formMethods;

    const watchSegments = watch(FieldConstants.LINE_SEGMENTS) as LineSegmentsFormData;

    const editSegmentsData = useMemo(
        () => ({
            [FieldConstants.LINE_SEGMENTS]: watchSegments ?? [],
        }),
        [watchSegments]
    );

    const fromSearchCopyToFormValues = (line: LineFormInfos) => {
        const formData = {
            equipmentID: line.id + '(1)',
            equipmentName: line.name ?? '',
            connectivity: {
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId1,
                        busbarSectionId: line.busOrBusbarSectionId1,
                        connectionDirection: line.connectablePosition1.connectionDirection,
                        connectionName: line.connectablePosition1.connectionName,
                        connectionPosition: line.connectablePosition1.connectionPosition,
                        terminalConnected: line.terminal1Connected,
                    },
                    FieldConstants.CONNECTIVITY_1
                ),
                ...getConnectivityFormData(
                    {
                        voltageLevelId: line.voltageLevelId2,
                        busbarSectionId: line.busOrBusbarSectionId2,
                        connectionDirection: line.connectablePosition2.connectionDirection,
                        connectionName: line.connectablePosition2.connectionName,
                        connectionPosition: line.connectablePosition2.connectionPosition,
                        terminalConnected: line.terminal2Connected,
                    },
                    FieldConstants.CONNECTIVITY_2
                ),
            },
            ...getLineCharacteristicsFormData({
                r: line.r,
                x: line.x,
                g1: convertInputValue(FieldType.G1, line.g1), // this form uses and displays microSiemens
                b1: convertInputValue(FieldType.B1, line.b1),
                g2: convertInputValue(FieldType.G2, line.g2),
                b2: convertInputValue(FieldType.B2, line.b2),
            }),
            ...getAllLimitsFormData(
                formatCompleteCurrentLimit(line.currentLimits),
                line.selectedOperationalLimitsGroupId1 ?? null,
                line.selectedOperationalLimitsGroupId2 ?? null
            ),
            ...copyEquipmentPropertiesForCreation(line),
            [FieldConstants.LINE_SEGMENTS]: [],
        };
        reset(formData, { keepDefaultValues: true });
    };

    const fromEditDataToFormValues = useCallback(
        (line: LineCreationDto) => {
            reset(lineCreationDtoToForm(line));
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.LINE);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const handleLineSegmentsBuildSubmit = (data: ComputedLineCharacteristics, lineSegments: LineSegmentsFormData) => {
        setValue(
            `${FieldConstants.CHARACTERISTICS}.${FieldConstants.R}` as any,
            data[FieldConstants.TOTAL_RESISTANCE],
            {
                shouldDirty: true,
            }
        );
        setValue(`${FieldConstants.CHARACTERISTICS}.${FieldConstants.X}` as any, data[FieldConstants.TOTAL_REACTANCE], {
            shouldDirty: true,
        });
        setValue(
            `${FieldConstants.CHARACTERISTICS}.${FieldConstants.B1}` as any,
            data[FieldConstants.TOTAL_SUSCEPTANCE] / 2,
            {
                shouldDirty: true,
            }
        );
        setValue(
            `${FieldConstants.CHARACTERISTICS}.${FieldConstants.B2}` as any,
            data[FieldConstants.TOTAL_SUSCEPTANCE] / 2,
            {
                shouldDirty: true,
            }
        );
        setValue(
            `${FieldConstants.LIMITS}.${FieldConstants.OPERATIONAL_LIMITS_GROUPS}` as any,
            convertLimitsToOperationalLimitsGroupFormSchema(data[FieldConstants.FINAL_CURRENT_LIMITS])
        );
        setValue(FieldConstants.LINE_SEGMENTS as any, convertToLineSegmentInfos(lineSegments));
    };

    const onSubmit = useCallback(
        (lineForm: LineCreationFormData) => {
            onCreateLine({
                lineCreationInfos: lineCreationFormToDto(lineForm),
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : undefined,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineCreationError' });
            });
        },
        [onCreateLine, studyUuid, currentNodeUuid, editData, snackError]
    );

    const clear = useCallback(() => reset(lineCreationEmptyFormData), [reset]);

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

    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={lineCreationFormSchema(displayConnectivity)}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'xl'}
                titleId="CreateLine"
                searchCopy={searchCopy}
                onOpenCatalogDialog={() => setIsOpenLineTypesCatalogDialog(true)}
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
                <LineForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    withConnectivity={displayConnectivity}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.LINE}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <LineTypeSegmentDialog
                    open={isOpenLineTypesCatalogDialog}
                    onClose={handleCloseLineTypesCatalogDialog}
                    onSave={handleLineSegmentsBuildSubmit}
                    editData={editSegmentsData}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineCreationDialog;
