/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialog-utils';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import {
    getCharacteristicsCreateFormDataFromSearchCopy,
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import ShuntCompensatorCreationForm from './shunt-compensator-creation-form';
import { createShuntCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(),
    ...getCharacteristicsEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getConnectivityWithPositionValidationSchema(),
        ...getCharacteristicsFormValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

/**
 * Dialog to create a shunt compensator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const ShuntCompensatorCreationDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError, snackWarning } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.id + '(1)',
                [EQUIPMENT_NAME]: shuntCompensator.name ?? '',
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectablePosition.connectionDirection,
                    connectionName: shuntCompensator.connectablePosition.connectionName,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                    // terminalConnected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...getCharacteristicsCreateFormDataFromSearchCopy({
                    bperSection: shuntCompensator.bperSection,
                    qAtNominalV: shuntCompensator.qatNominalV,
                    sectionCount: shuntCompensator.sectionCount,
                    maximumSectionCount: shuntCompensator.maximumSectionCount,
                }),
                ...copyEquipmentPropertiesForCreation(shuntCompensator),
            });
            if (!shuntCompensator.isLinear) {
                snackWarning({
                    headerId: 'partialCopyShuntCompensator',
                });
            }
        },
        [reset, snackWarning]
    );

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                ...getConnectivityFormData({
                    busbarSectionId: shuntCompensator.busOrBusbarSectionId,
                    connectionDirection: shuntCompensator.connectionDirection,
                    connectionName: shuntCompensator.connectionName,
                    connectionPosition: shuntCompensator.connectionPosition,
                    voltageLevelId: shuntCompensator.voltageLevelId,
                    terminalConnected: shuntCompensator.terminalConnected,
                }),
                ...getCharacteristicsFormData({
                    maxSusceptance: shuntCompensator.maxSusceptance ?? null,
                    maxQAtNominalV: shuntCompensator.maxQAtNominalV ?? null,
                    shuntCompensatorType: shuntCompensator.shuntCompensatorType,
                    sectionCount: shuntCompensator.sectionCount,
                    maximumSectionCount: shuntCompensator.maximumSectionCount,
                }),
                ...getPropertiesFromModification(shuntCompensator.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,

        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (shuntCompensator) => {
            createShuntCompensator({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                shuntCompensatorId: shuntCompensator[EQUIPMENT_ID],
                shuntCompensatorName: sanitizeString(shuntCompensator[EQUIPMENT_NAME]),
                maxSusceptance:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                        ? shuntCompensator[MAX_SUSCEPTANCE]
                        : null,
                maxQAtNominalV:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? shuntCompensator[MAX_Q_AT_NOMINAL_V]
                        : null,
                shuntCompensatorType:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? shuntCompensator[SHUNT_COMPENSATOR_TYPE]
                        : null,
                sectionCount: shuntCompensator[SECTION_COUNT],
                maximumSectionCount: shuntCompensator[MAXIMUM_SECTION_COUNT],
                connectivity: shuntCompensator[CONNECTIVITY],
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
                connectionDirection:
                    shuntCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionPosition: shuntCompensator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null,
                terminalConnected: shuntCompensator[CONNECTIVITY]?.[CONNECTED],
                properties: toModificationProperties(shuntCompensator),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorCreationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-shuntCompensator"
                titleId="CreateShuntCompensator"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <ShuntCompensatorCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.SHUNT_COMPENSATOR}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

ShuntCompensatorCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    currentRootNetworkUuid: PropTypes.string,
    editDataFetchStatus: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
