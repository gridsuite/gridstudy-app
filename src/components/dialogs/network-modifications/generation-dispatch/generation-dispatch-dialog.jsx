/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
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
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import yup from 'components/utils/yup-config';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import ModificationDialog from '../../commons/modificationDialog';
import GenerationDispatchForm from './generation-dispatch-form';
import { generationDispatch } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { addSelectedFieldToRows } from 'components/utils/utils';

const emptyFormData = {
    [LOSS_COEFFICIENT]: null,
    [DEFAULT_OUTAGE_RATE]: null,
    [GENERATORS_WITHOUT_OUTAGE]: [],
    [GENERATORS_WITH_FIXED_ACTIVE_POWER]: [],
    [GENERATORS_FREQUENCY_RESERVES]: [],
    [SUBSTATIONS_GENERATORS_ORDERING]: [],
};

const getGeneratorsFiltersSchema = (id) => ({
    [id]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
        })
    ),
});

const getGeneratorsFrequencyReserveSchema = (id) => ({
    [id]: yup.array().of(
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
    ),
});

const getSubstationsGeneratorsOrderingSchema = (id) => ({
    [id]: yup.array().of(
        yup.object().shape({
            [SUBSTATION_IDS]: yup.array().of(yup.string().required()).min(1).required(),
        })
    ),
});

const formSchema = yup
    .object()
    .shape({
        [LOSS_COEFFICIENT]: yup.number().nullable().min(0).max(100).required(),
        [DEFAULT_OUTAGE_RATE]: yup.number().nullable().min(0).max(100).required(),
        ...getGeneratorsFiltersSchema(GENERATORS_WITHOUT_OUTAGE),
        ...getGeneratorsFiltersSchema(GENERATORS_WITH_FIXED_ACTIVE_POWER),
        ...getGeneratorsFrequencyReserveSchema(GENERATORS_FREQUENCY_RESERVES),
        ...getSubstationsGeneratorsOrderingSchema(SUBSTATIONS_GENERATORS_ORDERING),
    })
    .required();

const GenerationDispatchDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (generation) => {
            reset({
                [LOSS_COEFFICIENT]: generation.lossCoefficient,
                [DEFAULT_OUTAGE_RATE]: generation.defaultOutageRate,
                [GENERATORS_WITHOUT_OUTAGE]: generation.generatorsWithoutOutage,
                [GENERATORS_WITH_FIXED_ACTIVE_POWER]: generation.generatorsWithFixedSupply,
                [GENERATORS_FREQUENCY_RESERVES]: addSelectedFieldToRows(generation.generatorsFrequencyReserve),
                [SUBSTATIONS_GENERATORS_ORDERING]: addSelectedFieldToRows(generation.substationsGeneratorsOrdering),
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
        (generation) => {
            generationDispatch({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? undefined,
                lossCoefficient: generation?.lossCoefficient,
                defaultOutageRate: generation?.defaultOutageRate,
                generatorsWithoutOutage: generation[GENERATORS_WITHOUT_OUTAGE],
                generatorsWithFixedActivePower: generation[GENERATORS_WITH_FIXED_ACTIVE_POWER],
                generatorsFrequencyReserve: generation[GENERATORS_FREQUENCY_RESERVES],
                substationsGeneratorsOrdering: generation[SUBSTATIONS_GENERATORS_ORDERING],
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GenerationDispatchError',
                });
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
                aria-labelledby="dialog-generation-dispatch"
                maxWidth={'md'}
                titleId="GenerationDispatch"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <GenerationDispatchForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

GenerationDispatchDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default GenerationDispatchDialog;
