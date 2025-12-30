/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    DEFAULT_OUTAGE_RATE,
    FREQUENCY_RESERVE,
    GENERATORS_FILTERS,
    GENERATORS_FREQUENCY_RESERVES,
    GENERATORS_WITH_FIXED_ACTIVE_POWER,
    GENERATORS_WITHOUT_OUTAGE,
    ID,
    LOSS_COEFFICIENT,
    NAME,
    SUBSTATION_IDS,
    SUBSTATIONS_GENERATORS_ORDERING,
} from 'components/utils/field-constants';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import yup from 'components/utils/yup-config';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import GenerationDispatchForm from './generation-dispatch-form';
import { generationDispatch } from '../../../../services/study/network-modifications';
import { addSelectedFieldToRows } from 'components/utils/utils';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { UUID } from 'node:crypto';
import { FetchStatus } from 'services/utils.type';
import { DeepNullable } from '../../../utils/ts-utils';
import { GenerationDispatchModificationInfos } from '../../../../services/network-modification-types';

interface GenerationDispatchProps {
    editData: GenerationDispatchModificationInfos;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

const emptyFormData = {
    [LOSS_COEFFICIENT]: null,
    [DEFAULT_OUTAGE_RATE]: null,
    [GENERATORS_WITHOUT_OUTAGE]: [],
    [GENERATORS_WITH_FIXED_ACTIVE_POWER]: [],
    [GENERATORS_FREQUENCY_RESERVES]: [],
    [SUBSTATIONS_GENERATORS_ORDERING]: [],
};

const getGeneratorsFiltersSchema = () => {
    return yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    );
};

const getGeneratorsFrequencyReserveSchema = () => {
    return yup.array().of(
        yup.object().shape({
            [GENERATORS_FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .min(1),
            [FREQUENCY_RESERVE]: yup.number().nullable().min(0).max(100).required(),
        })
    );
};

const getSubstationsGeneratorsOrderingSchema = () => {
    return yup.array().of(
        yup.object().shape({
            [SUBSTATION_IDS]: yup.array().of(yup.string().required()).min(1).required(),
        })
    );
};

const formSchema = yup
    .object()
    .shape({
        [LOSS_COEFFICIENT]: yup.number().nullable().min(0).max(100).required(),
        [DEFAULT_OUTAGE_RATE]: yup.number().nullable().min(0).max(100).required(),
        [GENERATORS_WITHOUT_OUTAGE]: getGeneratorsFiltersSchema(),
        [GENERATORS_WITH_FIXED_ACTIVE_POWER]: getGeneratorsFiltersSchema(),
        [GENERATORS_FREQUENCY_RESERVES]: getGeneratorsFrequencyReserveSchema(),
        [SUBSTATIONS_GENERATORS_ORDERING]: getSubstationsGeneratorsOrderingSchema(),
    })
    .required();

type GenerationDispatchFormInfos = yup.InferType<typeof formSchema>;

const GenerationDispatchDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<GenerationDispatchProps>) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<GenerationDispatchFormInfos>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<GenerationDispatchFormInfos>>(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (generation: GenerationDispatchModificationInfos) => {
            reset({
                [LOSS_COEFFICIENT]: generation.lossCoefficient,
                [DEFAULT_OUTAGE_RATE]: generation.defaultOutageRate,
                [GENERATORS_WITHOUT_OUTAGE]: generation.generatorsWithoutOutage,
                [GENERATORS_WITH_FIXED_ACTIVE_POWER]: generation.generatorsWithFixedSupply,
                [GENERATORS_FREQUENCY_RESERVES]: generation.generatorsFrequencyReserve
                    ? addSelectedFieldToRows(generation.generatorsFrequencyReserve)
                    : [],
                [SUBSTATIONS_GENERATORS_ORDERING]: generation.substationsGeneratorsOrdering
                    ? addSelectedFieldToRows(generation.substationsGeneratorsOrdering)
                    : [],
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (generation: GenerationDispatchFormInfos) => {
            generationDispatch({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.modificationUuid ?? undefined,
                lossCoefficient: generation?.lossCoefficient,
                defaultOutageRate: generation?.defaultOutageRate,
                generatorsWithoutOutage: generation[GENERATORS_WITHOUT_OUTAGE],
                generatorsWithFixedSupply: generation[GENERATORS_WITH_FIXED_ACTIVE_POWER],
                generatorsFrequencyReserve: generation[GENERATORS_FREQUENCY_RESERVES],
                substationsGeneratorsOrdering: generation[SUBSTATIONS_GENERATORS_ORDERING],
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'GenerationDispatchError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
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
        <CustomFormProvider validationSchema={formSchema} removeOptional={true} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="GenerationDispatch"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <GenerationDispatchForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default GenerationDispatchDialog;
