/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AMOUNT_TEMPORARY_LIMITS, CSV_FILENAME, MODIFICATIONS_TABLE, SIDE, TYPE } from '../../../utils/field-constants';
import { useIntl } from 'react-intl';
import { CustomFormProvider, ModificationType, useSnackMessage } from '@gridsuite/commons-ui';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { ModificationDialog } from '../../commons/modificationDialog';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from 'services/utils.type';
import { LimitSetsTabularModificationForm } from './limit-sets-tabular-modification-form';
import { LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS } from '../tabular/modification/tabular-modification-utils';
import { formatModification } from '../tabular/tabular-common';
import { createTabularModification } from '../../../../services/study/network-modifications';
import { BranchSide } from '../../../utils/constants';
import {
    emptyFormData,
    formatBackToFront,
    formatOperationalLimitGroupsFrontToBack,
    formSchema,
    LimitSetModificationMetadata,
    SchemaType,
} from './limit-sets-tabular-modification-utils';

interface LimitSetsModificationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    editData: LimitSetModificationMetadata;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

export function LimitSetsModificationDialog({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LimitSetsModificationDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();

    const { snackError } = useSnackMessage();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        getValues,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        if (editData) {
            reset(formatBackToFront(editData));
        }
    }, [editData, reset, intl]);

    const dataFetching = useMemo(() => {
        return isUpdate && editDataFetchStatus === FetchStatus.RUNNING;
    }, [editDataFetchStatus, isUpdate]);

    const onSubmit = useCallback<SubmitHandler<SchemaType>>(
        (formData) => {
            const amountMaxTemporaryLimits = getValues(AMOUNT_TEMPORARY_LIMITS);
            const modificationType = LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS[formData[TYPE]];
            const modifications = formData[MODIFICATIONS_TABLE]?.map((row) => {
                let modification = formatModification(row);
                Object.keys(modification).forEach((key) => {
                    modification[key] = row[key];
                });

                if (modification[SIDE] === BranchSide.ONE) {
                    modification.operationalLimitsGroup1 = [
                        formatOperationalLimitGroupsFrontToBack(modification, amountMaxTemporaryLimits, BranchSide.ONE),
                    ];
                } else if (modification[SIDE] === BranchSide.TWO) {
                    modification.operationalLimitsGroup2 = [
                        formatOperationalLimitGroupsFrontToBack(modification, amountMaxTemporaryLimits, BranchSide.TWO),
                    ];
                }

                modification.type = modificationType;
                return modification;
            });

            console.log(modifications);
            createTabularModification(
                studyUuid,
                currentNodeUuid,
                modificationType,
                modifications,
                editData?.uuid,
                ModificationType.LIMIT_SETS_TABULAR_MODIFICATION,
                formData[CSV_FILENAME]
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularModificationError',
                });
            });
        },
        [currentNodeUuid, editData, getValues, snackError, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={onSubmit}
                titleId="LimitSetsTabularModification"
                open={open}
                isDataFetching={dataFetching}
                disabledSave={disableSave}
                {...dialogProps}
            >
                <LimitSetsTabularModificationForm dataFetching={dataFetching} />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
