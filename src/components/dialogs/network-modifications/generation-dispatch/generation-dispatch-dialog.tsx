/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    GenerationDispatchDto,
    generationDispatchDtoToForm,
    generationDispatchEmptyFormData,
    GenerationDispatchForm,
    GenerationDispatchFormData,
    generationDispatchFormSchema,
    generationDispatchFormToDto,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { generationDispatch } from '../../../../services/study/network-modifications';
import { FetchStatus } from 'services/utils.type';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { WithModificationId } from '../../../../services/network-modification-types';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';

interface GenerationDispatchDtoWithId extends GenerationDispatchDto, WithModificationId {}

type GenerationDispatchProps = NetworkModificationDialogProps & {
    editData?: GenerationDispatchDtoWithId;
};

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
    const [substations, setSubstations] = useState<string[]>([]);
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<GenerationDispatchFormData>>({
        defaultValues: generationDispatchEmptyFormData,
        resolver: yupResolver<DeepNullable<GenerationDispatchFormData>>(generationDispatchFormSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset(generationDispatchDtoToForm(editData));
        }
    }, [reset, editData]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                [],
                EquipmentType.SUBSTATION,
                true
            ).then((values: string[]) => {
                setSubstations(values.toSorted((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const onSubmit = useCallback(
        (form: GenerationDispatchFormData) => {
            const dto = generationDispatchFormToDto(form);
            generationDispatch(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'GenerationDispatchError' });
            });
        },
        [editData?.uuid, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(generationDispatchEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={generationDispatchFormSchema} removeOptional={true} {...formMethods}>
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
                <GenerationDispatchForm substationsIds={substations} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default GenerationDispatchDialog;
