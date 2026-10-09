/*
 * Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

import {
    CustomFormProvider,
    DeepNullable,
    LineAttachToSplitLinesIllustration,
    LinesAttachToSplitLinesFormData,
    LinesAttachToSplittingLinesDto,
    linesAttachToSplittingLinesDtoToForm,
    linesAttachToSplittingLinesEmptyFormData,
    LinesAttachToSplittingLinesForm,
    linesAttachToSplittingLinesFormSchema,
    linesAttachToSplittingLinesFormToDto,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';

import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { linesAttachToSplitLines } from '../../../../services/study/network-modifications';
import { FetchStatus } from 'services/utils.type';
import type { CurrentTreeNode } from '../../../graph/tree-node.type';
import { UUID } from 'node:crypto';
import { useLineOptions } from '../../commons/use-line-options';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../services/study/network';
import useVoltageLevelsListInfos from '../../../../hooks/use-voltage-levels-list-infos';

interface LinesAttachToSplitLinesProps {
    editData?: LinesAttachToSplittingLinesDto;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

/**
 * Dialog to attach a line to a (possibly new) voltage level.
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LinesAttachToSplitLinesDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LinesAttachToSplitLinesProps>) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<LinesAttachToSplitLinesFormData>>({
        defaultValues: linesAttachToSplittingLinesEmptyFormData,
        resolver: yupResolver<DeepNullable<LinesAttachToSplitLinesFormData>>(linesAttachToSplittingLinesFormSchema),
    });

    const { reset } = formMethods;

    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);
    const lineOptions = useLineOptions(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );

    useEffect(() => {
        if (editData) {
            reset(linesAttachToSplittingLinesDtoToForm(editData));
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        (formData: LinesAttachToSplitLinesFormData) => {
            const linesAttachToSplittingLinesDto = {
                ...linesAttachToSplittingLinesFormToDto(formData),
                uuid: editData?.uuid,
            };
            linesAttachToSplitLines({
                linesAttachToSplittingLinesDto: linesAttachToSplittingLinesDto,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LinesAttachToSplitLinesError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(linesAttachToSplittingLinesEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={linesAttachToSplittingLinesFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="LinesAttachToSplitLines"
                subtitle={<LineAttachToSplitLinesIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LinesAttachToSplittingLinesForm
                    voltageLevelOptions={voltageLevelOptions}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                    lineOptions={lineOptions}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LinesAttachToSplitLinesDialog;
