/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    ExtendedEquipmentType,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    VscHvdcLineForm,
    VscHdvLineCreationDto,
    vscHvdcLineCreationEmptyFormData,
    vscHvdcLineCreationFormSchema,
    VscHvdcLineCreationFormData,
    vscHvdcLineCreationFormToDto,
    vscHvdcLineCreationDtoToForm,
    VscHvdcLineInfo,
    getVscHvdcLineCharacteristicsFromCopy,
    converterStationCreationFromCopy,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { ModificationDialog } from '../../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { FetchStatus } from '../../../../../../services/utils';
import { createVscHvdcLine } from '../../../../../../services/study/network-modifications';
import { useFormSearchCopy } from '../../../../commons/use-form-search-copy';
import EquipmentSearchDialog from '../../../../equipment-search-dialog';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../../graph/menus/network-modifications/network-modification-menu.type';
import PositionDiagramPane from '../../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../../services/study/network';

type VscCreationDialogProps = NetworkModificationDialogProps & {
    editData?: VscHdvLineCreationDto;
};

export default function VscCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<VscCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<VscHvdcLineCreationFormData>>({
        defaultValues: vscHvdcLineCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<VscHvdcLineCreationFormData>>(vscHvdcLineCreationFormSchema),
    });
    const { reset } = formMethods;

    const fromSearchCopyToFormValues = (hvdcLine: VscHvdcLineInfo) => {
        reset(
            {
                equipmentID: hvdcLine.id + '(1)',
                equipmentName: hvdcLine.name ?? '',
                hvdcLine: getVscHvdcLineCharacteristicsFromCopy(hvdcLine),
                converterStation1: converterStationCreationFromCopy(hvdcLine.converterStation1),
                converterStation2: converterStationCreationFromCopy(hvdcLine.converterStation2),
                ...copyEquipmentPropertiesForCreation(hvdcLine),
            },
            { keepDefaultValues: true }
        );
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, ExtendedEquipmentType.HVDC_LINE_VSC);

    useEffect(() => {
        if (editData) {
            reset(vscHvdcLineCreationDtoToForm(editData));
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(vscHvdcLineCreationEmptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (lineForm: VscHvdcLineCreationFormData) => {
            const dto = vscHvdcLineCreationFormToDto(lineForm);
            createVscHvdcLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'HvdcCreationError' });
            });
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

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
            {...formMethods}
            validationSchema={vscHvdcLineCreationFormSchema}
            isNodeBuilt={isNodeBuilt(currentNode)}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateVsc"
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
                <VscHvdcLineForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={ExtendedEquipmentType.HVDC_LINE_VSC}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
