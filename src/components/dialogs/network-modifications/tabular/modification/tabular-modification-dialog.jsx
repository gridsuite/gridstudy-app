/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import { CustomFormProvider, ModificationType, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form.js';
import { FORM_LOADING_DELAY } from 'components/network/constants.js';
import { TABULAR_PROPERTIES, MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants.js';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog.js';
import { createTabularModification } from 'services/study/network-modifications.js';
import { FetchStatus } from 'services/utils.js';
import {
    convertGeneratorOrBatteryModificationFromBackToFront,
    convertGeneratorOrBatteryModificationFromFrontToBack,
    convertInputValues,
    convertOutputValues,
    getEquipmentTypeFromModificationType,
    getFieldType,
    TABULAR_MODIFICATION_TYPES,
} from './tabular-modification-utils.js';
import { useIntl } from 'react-intl';
import { PROPERTY_CSV_COLUMN_PREFIX } from '../properties/property-utils.ts';
import {
    addPropertiesFromBack,
    createCommonProperties,
    emptyTabularFormData,
    formatModification,
    tabularFormSchema,
    TabularModificationType,
} from '../tabular-common.js';
import TabularForm from '../tabular-form.js';

/**
 * Dialog to create tabular modification based on a csv file.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const TabularModificationDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyTabularFormData,
        resolver: yupResolver(tabularFormSchema),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    useEffect(() => {
        if (editData) {
            const modificationType = editData.modificationType;
            const modifications = editData.modifications.map((modif) => {
                let modification = formatModification(modif);
                if (
                    modificationType === TABULAR_MODIFICATION_TYPES.GENERATOR ||
                    modificationType === TABULAR_MODIFICATION_TYPES.BATTERY
                ) {
                    modification = convertGeneratorOrBatteryModificationFromBackToFront(modification);
                } else {
                    Object.keys(modification).forEach((key) => {
                        modification[key] = convertInputValues(getFieldType(modificationType, key), modif[key]);
                    });
                }
                modification = addPropertiesFromBack(modification, modif?.[TABULAR_PROPERTIES]);
                return modification;
            });
            reset({
                [TYPE]: getEquipmentTypeFromModificationType(modificationType),
                [MODIFICATIONS_TABLE]: modifications,
                [TABULAR_PROPERTIES]: editData[TABULAR_PROPERTIES],
            });
        }
    }, [editData, reset, intl]);

    const onSubmit = useCallback(
        (formData) => {
            const modificationType = TABULAR_MODIFICATION_TYPES[formData[TYPE]];
            const modifications = formData[MODIFICATIONS_TABLE]?.map((row) => {
                let modification = {
                    type: modificationType,
                };
                const propertiesModifications = createCommonProperties(row);
                if (
                    modificationType === TABULAR_MODIFICATION_TYPES.GENERATOR ||
                    modificationType === TABULAR_MODIFICATION_TYPES.BATTERY
                ) {
                    const generatorOrBatteryModification = convertGeneratorOrBatteryModificationFromFrontToBack(row);
                    modification = {
                        ...generatorOrBatteryModification,
                        ...modification,
                    };
                } else {
                    Object.keys(row).forEach((key) => {
                        if (!key.startsWith(PROPERTY_CSV_COLUMN_PREFIX)) {
                            modification[key] = convertOutputValues(getFieldType(modificationType, key), row[key]);
                        }
                    });
                }
                if (propertiesModifications.length > 0) {
                    modification[TABULAR_PROPERTIES] = propertiesModifications;
                }
                return modification;
            });
            createTabularModification(
                studyUuid,
                currentNodeUuid,
                modificationType,
                modifications,
                editData?.uuid,
                ModificationType.TABULAR_MODIFICATION,
                formData[TABULAR_PROPERTIES]
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularModificationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyTabularFormData);
    }, [reset]);

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
                onSave={onSubmit}
                disabledSave={disableSave}
                titleId="TabularModification"
                open={open}
                isDataFetching={dataFetching}
                {...dialogProps}
            >
                <TabularForm dataFetching={dataFetching} dialogMode={TabularModificationType.MODIFICATION} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

TabularModificationDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default TabularModificationDialog;
