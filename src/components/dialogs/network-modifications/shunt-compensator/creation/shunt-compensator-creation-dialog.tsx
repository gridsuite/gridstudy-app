/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    CustomFormProvider,
    DeepNullable,
    emptyProperties,
    EquipmentSearchDialog,
    EquipmentType,
    FetchStatus,
    FORM_LOADING_DELAY,
    getPropertiesFromModification,
    MODIFICATION_TYPES,
    ModificationDialog,
    sanitizeString,
    snackWithFallback,
    toModificationProperties,
    useFormSearchCopy,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import {
    getCharacteristicsCreateFormDataFromSearchCopy,
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import ShuntCompensatorCreationForm from './shunt-compensator-creation-form';
import { createShuntCompensator } from '../../../../../services/study/network-modifications';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { ShuntCompensatorCreationDialogSchemaForm, ShuntCompensatorFormInfos } from '../shunt-compensator-dialog.type';
import { ShuntCompensatorCreationInfos } from '../../../../../services/network-modification-types';
import { useStudyContext } from '../../../../../hooks/use-study-context';

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
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(),
        ...getCharacteristicsFormValidationSchema(false),
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

export type ShuntCompensatorCreationDialogProps = NetworkModificationDialogProps & {
    editData: ShuntCompensatorCreationInfos;
};

export default function ShuntCompensatorCreationDialog({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<ShuntCompensatorCreationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const studyContext = useStudyContext();
    const { snackError, snackWarning } = useSnackMessage();

    const formMethods = useForm<DeepNullable<ShuntCompensatorCreationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<ShuntCompensatorCreationDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = useCallback(
        (shuntCompensator: ShuntCompensatorFormInfos) => {
            reset(
                {
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
                        bPerSection: shuntCompensator.bPerSection ?? null,
                        qAtNominalV: shuntCompensator.qAtNominalV ?? null,
                        sectionCount: shuntCompensator.sectionCount,
                        maximumSectionCount: shuntCompensator.maximumSectionCount,
                    }),
                    ...copyEquipmentPropertiesForCreation(shuntCompensator),
                },
                { keepDefaultValues: true }
            );
            if (!shuntCompensator.isLinear) {
                snackWarning({
                    headerId: 'partialCopyShuntCompensator',
                });
            }
        },
        [reset, snackWarning]
    );

    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.SHUNT_COMPENSATOR, studyContext);

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                    terminalConnected: editData.terminalConnected,
                }),
                ...getCharacteristicsFormData({
                    maxSusceptance: editData.maxSusceptance ?? null,
                    maxQAtNominalV: editData.maxQAtNominalV ?? null,
                    shuntCompensatorType: editData.shuntCompensatorType,
                    sectionCount: editData.sectionCount,
                    maximumSectionCount: editData.maximumSectionCount,
                }),
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [reset, editData]);

    const onSubmit = useCallback(
        (shuntCompensator: ShuntCompensatorCreationDialogSchemaForm) => {
            const shuntCompensatorCreationInfos = {
                type: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
                equipmentId: shuntCompensator[EQUIPMENT_ID],
                equipmentName: sanitizeString(shuntCompensator[EQUIPMENT_NAME]),
                maxSusceptance:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                        ? (shuntCompensator[MAX_SUSCEPTANCE] ?? null)
                        : null,
                maxQAtNominalV:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? (shuntCompensator[MAX_Q_AT_NOMINAL_V] ?? null)
                        : null,
                shuntCompensatorType:
                    shuntCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                        ? (shuntCompensator[SHUNT_COMPENSATOR_TYPE] ?? null)
                        : null,
                sectionCount: shuntCompensator[SECTION_COUNT] ?? null,
                maximumSectionCount: shuntCompensator[MAXIMUM_SECTION_COUNT] ?? null,
                voltageLevelId: shuntCompensator[CONNECTIVITY][VOLTAGE_LEVEL][ID] ?? null,
                busOrBusbarSectionId: shuntCompensator[CONNECTIVITY][BUS_OR_BUSBAR_SECTION][ID] ?? null,
                connectionDirection:
                    shuntCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName: sanitizeString(shuntCompensator[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionPosition: shuntCompensator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null,
                terminalConnected: shuntCompensator[CONNECTIVITY]?.[CONNECTED] ?? null,
                properties: toModificationProperties(shuntCompensator),
            } satisfies ShuntCompensatorCreationInfos;

            createShuntCompensator({
                shuntCompensatorCreationInfos: shuntCompensatorCreationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ShuntCompensatorCreationError' });
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
                {studyContext && (
                    <EquipmentSearchDialog
                        open={searchCopy.isDialogSearchOpen}
                        onClose={searchCopy.handleCloseSearchDialog}
                        equipmentType={EquipmentType.SHUNT_COMPENSATOR}
                        onSelectionChange={searchCopy.handleSelectionChange}
                        studyContext={studyContext}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
}
