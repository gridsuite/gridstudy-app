/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ACTIVE_POWER,
    ADDITIONAL_PROPERTIES,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialogUtils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import LoadModificationForm from './load-modification-form';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { modifyLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    mergeModificationAndEquipmentProperties,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
    modificationPropertiesSchema,
} from '../../common/properties/property-utils';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [LOAD_TYPE]: null,
    [ACTIVE_POWER]: null,
    [REACTIVE_POWER]: null,
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [ACTIVE_POWER]: yup.number().nullable(),
        [REACTIVE_POWER]: yup.number().nullable(),
    })
    .concat(modificationPropertiesSchema)
    .required();

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default load id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LoadModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [loadToModify, setLoadToModify] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (load) => {
            if (load?.equipmentId) {
                setSelectedId(load.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: load.equipmentName?.value ?? '',
                [LOAD_TYPE]: load.loadType?.value ?? null,
                [ACTIVE_POWER]: load.activePower?.value ?? null,
                [REACTIVE_POWER]: load.reactivePower?.value ?? null,
                ...getPropertiesFromModification(load.properties),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const getConcatenatedProperties = useCallback(
        (equipment) => {
            // ex: current Array [ {Object {  name: "p1", value: "v2", previousValue: undefined, added: true, deletionMark: false } }, {...} ]
            const modificationProperties = getValues(
                `${ADDITIONAL_PROPERTIES}`
            );
            return mergeModificationAndEquipmentProperties(
                modificationProperties,
                equipment
            );
        },
        [getValues]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (!equipmentId) {
                setLoadToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.LOAD,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((load) => {
                        if (load) {
                            setLoadToModify(load);
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]:
                                    getConcatenatedProperties(load),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLoadToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [studyUuid, currentNodeUuid, reset, getConcatenatedProperties, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (load) => {
            modifyLoad(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(load?.equipmentName),
                load?.loadType,
                load?.activePower,
                load?.reactivePower,
                undefined,
                undefined,
                !!editData,
                editData ? editData.uuid : undefined,
                toModificationProperties(load)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadModificationError',
                });
            });
        },
        [selectedId, editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });
    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-load"
                maxWidth={'md'}
                titleId="ModifyLoad"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.LOAD}
                        fillerHeight={2}
                    />
                )}
                {selectedId != null && (
                    <LoadModificationForm
                        loadToModify={loadToModify}
                        equipmentId={selectedId}
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LoadModificationDialog;
