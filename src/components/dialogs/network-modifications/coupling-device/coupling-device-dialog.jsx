/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BUS_BAR_SECTION_ID1, BUS_BAR_SECTION_ID2 } from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../services/utils.js';
import { EquipmentIdSelector } from '../../equipment-id/equipment-id-selector.js';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types.js';
import { ModificationDialog } from '../../commons/modificationDialog.js';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form.js';
import { FORM_LOADING_DELAY } from '../../../network/constants.js';
import { createCouplingDevice } from '../../../../services/study/network-modifications.js';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import yup from '../../../utils/yup-config.js';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../services/study/network.js';
import { isNodeBuilt } from '../../../graph/util/model-functions.js';
import { CouplingDeviceForm } from './coupling-device-form.jsx';
import { useIntl } from 'react-intl';

const emptyFormData = {
    [BUS_BAR_SECTION_ID1]: null,
    [BUS_BAR_SECTION_ID2]: null,
};
const formSchema = yup.object().shape({
    [BUS_BAR_SECTION_ID1]: yup.object().required().nullable(),
    [BUS_BAR_SECTION_ID2]: yup.object().required().nullable(),
});
export const CouplingDeviceDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState([]);
    const intl = useIntl();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.voltageLevelId) {
                setSelectedId(editData.voltageLevelId);
            }
            reset({
                [BUS_BAR_SECTION_ID1]: editData?.busOrBbsId1 ?? '',
                [BUS_BAR_SECTION_ID2]: editData?.busOrBbsId1 ?? '',
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const onSubmit = useCallback(
        (couplingDevice) => {
            createCouplingDevice({
                voltageLevelId: selectedId,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                busbarSectionId1: couplingDevice[BUS_BAR_SECTION_ID1]?.id,
                busbarSectionId2: couplingDevice[BUS_BAR_SECTION_ID2]?.id,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'CouplingDeviceCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, selectedId]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchBusesOrBusbarSectionsForVoltageLevel(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    equipmentId
                ).then((busesOrbusbarSections) => {
                    setBusOrBusbarSectionOptions(
                        busesOrbusbarSections?.map((busesOrbusbarSection) => ({
                            id: busesOrbusbarSection.id,
                            label: busesOrbusbarSection?.name ?? '',
                        })) || []
                    );
                    setDataFetchStatus(FetchStatus.SUCCEED);
                });
            } else {
                setBusOrBusbarSectionOptions([]);
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, setDataFetchStatus]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
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
                titleId={intl.formatMessage({ id: 'CouplingDeviceCreation' }, { voltageLevelId: selectedId })}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                        fillerHeight={4}
                    />
                )}
                {selectedId != null && <CouplingDeviceForm sectionOptions={busOrBusbarSectionOptions} />}
            </ModificationDialog>
        </CustomFormProvider>
    );
};
