/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form.js';
import { FORM_LOADING_DELAY } from 'components/network/constants.js';
import { MODIFICATIONS_TABLE, TABULAR_PROPERTIES, TYPE } from 'components/utils/field-constants.js';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog.js';
import { createTabularCreation } from 'services/study/network-modifications.js';
import { FetchStatus } from 'services/utils.js';
import TabularCreationForm from './tabular-creation-form.js';
import {
    convertCreationFieldFromBackToFront,
    convertCreationFieldFromFrontToBack,
    getEquipmentTypeFromCreationType,
    TABULAR_CREATION_TYPES,
} from './tabular-creation-utils.js';
import { useIntl } from 'react-intl';
import {
    addPropertiesFromBack,
    convertReactiveCapabilityCurvePointsFromFrontToBack,
    emptyTabularFormData,
    formatModification,
    tabularFormSchema,
} from '../tabular-common.js';
import { PROPERTY_CSV_COLUMN_PREFIX } from '../properties/property-utils.js';
import { createPropertyModification } from '../../common/properties/property-utils.js';

/**
 * Dialog to create tabular creations based on a csv file.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const TabularCreationDialog = ({ studyUuid, currentNode, editData, isUpdate, editDataFetchStatus, ...dialogProps }) => {
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
            const equipmentType = getEquipmentTypeFromCreationType(editData?.creationType);
            const creations = editData?.creations.map((creat) => {
                let creation = {};
                Object.keys(formatModification(creat)).forEach((key) => {
                    const entry = convertCreationFieldFromBackToFront(key, creat[key]);
                    (Array.isArray(entry) ? entry : [entry]).forEach((item) => {
                        creation[item.key] = item.value;
                    });
                });
                creation = addPropertiesFromBack(creation, creat?.[TABULAR_PROPERTIES]);
                return creation;
            });
            reset({
                [TYPE]: equipmentType,
                [MODIFICATIONS_TABLE]: creations,
                [TABULAR_PROPERTIES]: editData[TABULAR_PROPERTIES],
            });
        }
    }, [editData, reset, intl]);

    const onSubmit = useCallback(
        (formData) => {
            const creationType = TABULAR_CREATION_TYPES[formData[TYPE]];
            const creations = formData[MODIFICATIONS_TABLE]?.map((row) => {
                const creation = {
                    type: creationType,
                };
                let propertiesModifications = [];
                Object.keys(row).forEach((key) => {
                    if (key.startsWith(PROPERTY_CSV_COLUMN_PREFIX) && row[key]?.length) {
                        // if a value is set for a "property_*" column and the current row
                        propertiesModifications.push(
                            createPropertyModification(key.replace(PROPERTY_CSV_COLUMN_PREFIX, ''), row[key])
                        );
                    }
                });
                Object.keys(row).forEach((key) => {
                    if (!key.startsWith(PROPERTY_CSV_COLUMN_PREFIX) && row[key]?.length) {
                        const entry = convertCreationFieldFromFrontToBack(key, row[key]);
                        creation[entry.key] = entry.value;
                    }
                });
                // For now, we do not manage reactive limits by diagram
                if (creationType === 'GENERATOR_CREATION' || creationType === 'BATTERY_CREATION') {
                    convertReactiveCapabilityCurvePointsFromFrontToBack(creation);
                }
                if (propertiesModifications.length > 0) {
                    creation[TABULAR_PROPERTIES] = propertiesModifications;
                }
                return creation;
            });
            createTabularCreation(
                studyUuid,
                currentNodeUuid,
                creationType,
                creations,
                formData[TABULAR_PROPERTIES],
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularCreationError',
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
                disabledSave={disableSave}
                onSave={onSubmit}
                titleId="TabularCreation"
                open={open}
                isDataFetching={dataFetching}
                {...dialogProps}
            >
                <TabularCreationForm dataFetching={dataFetching} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

TabularCreationDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default TabularCreationDialog;
