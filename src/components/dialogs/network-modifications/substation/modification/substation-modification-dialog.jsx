/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { ADDITIONAL_PROPERTIES, COUNTRY, EQUIPMENT_NAME } from 'components/utils/field-constants';
import SubstationModificationForm from './substation-modification-form';
import { sanitizeString } from '../../../dialog-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifySubstation } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions.ts';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        [COUNTRY]: yup.string().nullable(),
    })
    .concat(modificationPropertiesSchema);

/**
 * Dialog to modify a substation in the network
 * @param editData the data to edit
 * @param defaultIdValue the default substation id
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const SubstationModificationDialog = ({
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
    const [substationToModify, setSubstationToModify] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                [COUNTRY]: editData.country?.value ?? null,
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (!equipmentId) {
                setSubstationToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.SUBSTATION,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((substation) => {
                        if (substation) {
                            setSubstationToModify(substation);
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(substation, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setSubstationToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [studyUuid, currentRootNetworkUuid, currentNodeUuid, reset, getValues, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (substation) => {
            modifySubstation({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                id: selectedId,
                name: sanitizeString(substation[EQUIPMENT_NAME]),
                country: substation[COUNTRY],
                properties: toModificationProperties(substation),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'SubstationModificationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid, selectedId]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            {...formMethods}
            removeOptional={true}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-substation"
                maxWidth={'md'}
                titleId="ModifySubstation"
                open={open}
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
                        equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                        fillerHeight={5}
                    />
                )}
                {selectedId != null && (
                    <SubstationModificationForm
                        studyUuid={studyUuid}
                        substationToModify={substationToModify}
                        equipmentId={selectedId}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default SubstationModificationDialog;
