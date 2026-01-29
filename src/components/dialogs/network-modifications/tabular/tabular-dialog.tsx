/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    FetchStatus,
    FORM_LOADING_DELAY,
    ModificationDialog,
    ModificationType,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import { TABULAR_PROPERTIES, MODIFICATIONS_TABLE, CSV_FILENAME, TYPE } from 'components/utils/field-constants.js';
import { createTabularModification } from 'services/study/network-modifications.js';
import {
    convertGeneratorOrBatteryModificationFromBackToFront,
    convertInputValues,
    getEquipmentTypeFromModificationType,
    getFieldType,
    TABULAR_MODIFICATION_FIELDS,
    TABULAR_MODIFICATION_TYPES,
    transformModificationsTable,
} from './tabular-modification-utils.js';
import {
    addPropertiesFromBack,
    convertReactiveCapabilityCurvePointsFromFrontToBack,
    formatModification,
    getEmptyTabularFormData,
    Modification,
    tabularFormSchema,
    TabularFormType,
    TabularModificationEditDataType,
    TabularModificationType,
    transformProperties,
} from './tabular-common.js';
import TabularForm from './tabular-form.js';
import {
    convertCreationFieldFromBackToFront,
    convertCreationFieldFromFrontToBack,
    getEquipmentTypeFromCreationType,
    TABULAR_CREATION_FIELDS,
    TABULAR_CREATION_TYPES,
} from './tabular-creation-utils';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';

function convertCreations(creations: Modification[]): Modification[] {
    return creations.map((creat: Modification) => {
        let creation: Modification = {};
        for (const key of Object.keys(formatModification(creat))) {
            const entry = convertCreationFieldFromBackToFront(key, creat[key]);
            for (const item of Array.isArray(entry) ? entry : [entry]) {
                creation[item.key] = item.value;
            }
        }
        creation = addPropertiesFromBack(creation, creat?.[TABULAR_PROPERTIES]);
        return creation;
    });
}

type TabularDialogProps = NetworkModificationDialogProps & {
    editData: TabularModificationEditDataType;
    dialogMode: TabularModificationType;
};

export function TabularDialog({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    dialogMode,
    ...dialogProps
}: Readonly<TabularDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const defaultEquipmentType = useMemo(() => {
        return dialogMode === TabularModificationType.CREATION
            ? (Object.keys(TABULAR_CREATION_FIELDS).at(0) ?? '')
            : (Object.keys(TABULAR_MODIFICATION_FIELDS).at(0) ?? '');
    }, [dialogMode]);

    const formMethods = useForm<TabularFormType>({
        defaultValues: getEmptyTabularFormData(defaultEquipmentType),
        resolver: yupResolver(tabularFormSchema),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    const initTabularModificationData = useCallback(
        (editData: TabularModificationEditDataType) => {
            const modificationType = editData.modificationType;
            const modifications = editData.modifications.map((modif: Modification) => {
                let modification = formatModification(modif);
                if (
                    modificationType === TABULAR_MODIFICATION_TYPES.GENERATOR ||
                    modificationType === TABULAR_MODIFICATION_TYPES.BATTERY
                ) {
                    modification = convertGeneratorOrBatteryModificationFromBackToFront(modification);
                } else {
                    for (const key of Object.keys(modification)) {
                        modification[key] = convertInputValues(getFieldType(modificationType, key), modif[key]);
                    }
                }
                modification = addPropertiesFromBack(modification, modif?.[TABULAR_PROPERTIES]);
                return modification;
            });
            reset({
                [TYPE]: getEquipmentTypeFromModificationType(modificationType),
                [MODIFICATIONS_TABLE]: modifications,
                [TABULAR_PROPERTIES]: editData.properties,
                [CSV_FILENAME]: editData.csvFilename,
            });
        },
        [reset]
    );

    const initTabularCreationData = useCallback(
        (editData: TabularModificationEditDataType) => {
            const equipmentType = getEquipmentTypeFromCreationType(editData?.modificationType);
            const creations = convertCreations(editData?.modifications);
            reset({
                [TYPE]: equipmentType,
                [MODIFICATIONS_TABLE]: creations,
                [TABULAR_PROPERTIES]: editData.properties,
                [CSV_FILENAME]: editData.csvFilename,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            if (dialogMode === TabularModificationType.CREATION) {
                initTabularCreationData(editData);
            } else {
                initTabularModificationData(editData);
            }
        }
    }, [editData, dialogMode, initTabularCreationData, initTabularModificationData]);

    const submitTabularModification = useCallback(
        (formData: TabularFormType) => {
            const modificationType = TABULAR_MODIFICATION_TYPES[formData[TYPE]];
            const modificationsTable = formData[MODIFICATIONS_TABLE];
            // Convert modifications to the back-end format based on the type
            const modifications = transformModificationsTable(modificationType, modificationsTable);

            createTabularModification({
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationType,
                modifications,
                modificationUuid: editData?.uuid,
                tabularType: ModificationType.TABULAR_MODIFICATION,
                csvFilename: formData[CSV_FILENAME],
                properties: formData[TABULAR_PROPERTIES],
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'TabularModificationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const submitTabularCreation = useCallback(
        (formData: TabularFormType) => {
            const modificationType = TABULAR_CREATION_TYPES[formData[TYPE]];
            const modifications = formData[MODIFICATIONS_TABLE]?.map((row) => {
                const creation: Modification = {
                    type: modificationType,
                };
                // first transform and clean "property_*" fields
                const propertiesModifications = transformProperties(row);

                // then transform all other fields
                for (const key of Object.keys(row)) {
                    const entry = convertCreationFieldFromFrontToBack(key, row[key]);
                    creation[entry.key] = entry.value;
                }
                // For now, we do not manage reactive limits by diagram
                if (
                    modificationType === ModificationType.GENERATOR_CREATION ||
                    modificationType === ModificationType.BATTERY_CREATION
                ) {
                    convertReactiveCapabilityCurvePointsFromFrontToBack(creation);
                }

                if (propertiesModifications.length > 0) {
                    creation[TABULAR_PROPERTIES] = propertiesModifications;
                }
                return creation;
            });
            createTabularModification({
                studyUuid,
                nodeUuid: currentNodeUuid,
                modificationType,
                modifications,
                modificationUuid: editData?.uuid,
                tabularType: ModificationType.TABULAR_CREATION,
                csvFilename: formData[CSV_FILENAME],
                properties: formData[TABULAR_PROPERTIES],
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'TabularCreationError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(getEmptyTabularFormData(defaultEquipmentType));
    }, [defaultEquipmentType, reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const dataFetching = useMemo(() => {
        return isUpdate && editDataFetchStatus === FetchStatus.RUNNING;
    }, [editDataFetchStatus, isUpdate]);

    return (
        <CustomFormProvider validationSchema={tabularFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={
                    dialogMode === TabularModificationType.CREATION ? submitTabularCreation : submitTabularModification
                }
                disabledSave={disableSave}
                titleId={dialogMode === TabularModificationType.CREATION ? 'TabularCreation' : 'TabularModification'}
                open={open}
                isDataFetching={dataFetching}
                {...dialogProps}
            >
                <TabularForm dataFetching={dataFetching} dialogMode={dialogMode} />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
