/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import yup from '../../../utils/yup-config';
import {
    AMOUNT_TEMPORARY_LIMITS,
    EQUIPMENT_ID,
    LIMIT_GROUP_NAME,
    MODIFICATION_TYPE,
    MODIFICATIONS_TABLE,
    PERMANENT_LIMIT,
    SIDE,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
    TYPE,
} from '../../../utils/field-constants';
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
import { LimitSetsTabularModificationForm } from './limits-set-tabular-modification-form';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    formatModification,
    LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS,
    Modification,
} from '../tabular-modification/tabular-modification-utils';
import { createTabularModification } from '../../../../services/study/network-modifications';
import { BranchSide } from '../../../utils/constants';

const formatTemporaryLimitsFrontToBack = (modification: Modification, amountMaxTemporaryLimits: number) => {
    const temporaryLimits = [];
    for (let i = 1; i <= amountMaxTemporaryLimits; i++) {
        if (modification[TEMPORARY_LIMIT_NAME + i]) {
            temporaryLimits.push({
                name: modification[TEMPORARY_LIMIT_NAME + i],
                value: modification[TEMPORARY_LIMIT_VALUE + i],
                acceptableDuration: modification[TEMPORARY_LIMIT_DURATION + i],
                modificationType: modification[TEMPORARY_LIMITS_MODIFICATION_TYPE],
            });
        }
    }
    return temporaryLimits;
};

const formatOperationalLimitGroupsFrontToBack = (
    modification: Modification,
    amountMaxTemporaryLimits: number,
    side: BranchSide
) => {
    return {
        id: modification[LIMIT_GROUP_NAME],
        side: side,
        modificationType: modification[MODIFICATION_TYPE],
        currentLimits: {
            permanentLimit: modification[PERMANENT_LIMIT],
            temporaryLimits: formatTemporaryLimitsFrontToBack(modification, amountMaxTemporaryLimits),
        },
    };
};

const formatTemporaryLimitsBackToFront = (
    temporaryLimits: {
        name: string;
        value: number;
        acceptableDuration: number;
        modificationType: string;
    }[]
) => {
    const modification: Modification = {};
    for (let i = 0; i < temporaryLimits.length; i++) {
        const index = i + 1; // Fields are 1-indexed
        const tempLimit = temporaryLimits[i];

        modification[TEMPORARY_LIMIT_NAME + index] = tempLimit.name;
        modification[TEMPORARY_LIMIT_VALUE + index] = tempLimit.value;
        modification[TEMPORARY_LIMIT_DURATION + index] = tempLimit.acceptableDuration;
    }
    return modification;
};

const formatBackToFront = (editData: Modification) => {
    const operationalLimitGroups = formatOperationalLimitGroupsBackToFront(editData);
    const type = operationalLimitGroups.find((operationalLimitGroup) => operationalLimitGroup.type !== undefined)?.type;
    return {
        [TYPE]: type,
        [AMOUNT_TEMPORARY_LIMITS]: operationalLimitGroups.length,
        [MODIFICATIONS_TABLE]: operationalLimitGroups,
    };
};

const formatOperationalLimitGroupsBackToFront = (group: Modification): Modification[] => {
    const modifications: Modification[] = [];
    console.log(group);
    for (let modification of group.modifications) {
        for (let operationalLimitGroup of modification.operationalLimitsGroup1) {
            let row: Modification = {};
            row[EQUIPMENT_ID] = modification[EQUIPMENT_ID];
            row[SIDE] = operationalLimitGroup[SIDE];
            row[LIMIT_GROUP_NAME] = operationalLimitGroup.id;
            row[MODIFICATION_TYPE] = operationalLimitGroup.modificationType;
            row[PERMANENT_LIMIT] = operationalLimitGroup.currentLimits.permanentLimit;

            const tempLimitFields = formatTemporaryLimitsBackToFront(
                operationalLimitGroup.currentLimits.temporaryLimits
            );
            modifications.push({
                ...row,
                ...tempLimitFields,
            });
        }
    }

    return modifications;
};

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [AMOUNT_TEMPORARY_LIMITS]: yup.number().positive().max(50).required(),
        [MODIFICATIONS_TABLE]: yup.array().min(1, 'ModificationsRequiredTabError').required(),
    })
    .required();
type SchemaType = yup.InferType<typeof formSchema>;

const emptyFormData: SchemaType = {
    [TYPE]: EQUIPMENT_TYPES.LINE,
    [AMOUNT_TEMPORARY_LIMITS]: 1,
    [MODIFICATIONS_TABLE]: [],
};

type LimitSetsTabularModification = {
    [key: string]: any;
};

interface LimitSetsModificationDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    editData: LimitSetsTabularModification;
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
}: LimitSetsModificationDialogProps) {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();

    const { snackError } = useSnackMessage();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(formatBackToFront(editData));
        }
    }, [editData, reset, intl]);

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
                }
                if (modification[SIDE] === BranchSide.TWO) {
                    modification.operationalLimitsGroup2 = [
                        formatOperationalLimitGroupsFrontToBack(modification, amountMaxTemporaryLimits, BranchSide.TWO),
                    ];
                }

                modification.type = modificationType;
                return modification;
            });

            createTabularModification(
                studyUuid,
                currentNodeUuid,
                modificationType,
                modifications,
                !!editData,
                editData?.uuid,
                ModificationType.LIMIT_SETS_TABULAR_MODIFICATION
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularModificationError',
                });
            });
        },
        [currentNodeUuid, editData, getValues, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={onSubmit}
                titleId="LimitSetsTabularModification"
                open={open}
                isDataFetching={dataFetching}
                {...dialogProps}
            >
                <LimitSetsTabularModificationForm dataFetching={dataFetching} />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
