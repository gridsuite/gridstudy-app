/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
    CustomMuiDialog,
    fetchDirectoryElementPath,
    isDisabledValidationButton,
    PARAM_DEVELOPER_MODE,
    snackWithFallback,
    useSnackMessage,
    exportNetworkFormSchema,
    emptyExportNetworkFormData,
    NetworkExportInfos,
    exportNetworkFormToDto,
    ExportNetworkForm,
    FILE_NAME,
    EXPORT_PARAMETERS,
    ExportNetworkFormData,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { useParameterState } from '../parameters/use-parameters-state';
import { AppState } from '../../../redux/reducer.type';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * Dialog to export the network case
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {EventListener} onClick Event to submit the export
 * @param {String} studyUuid the uuid of the study to export
 * @param {String} nodeUuid the uuid of the selected node
 */
interface ExportNetworkDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: (nodeUuid: UUID, params: Record<string, any>, exportInfos: NetworkExportInfos) => void;
    studyUuid: UUID;
    nodeUuid: UUID;
}

export function ExportNetworkDialog({
    open,
    onClose,
    onClick,
    studyUuid,
    nodeUuid,
}: Readonly<ExportNetworkDialogProps>) {
    const { snackError } = useSnackMessage();
    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const nodeName = useMemo(() => treeNodes?.find((node) => node.id === nodeUuid)?.data.label, [treeNodes, nodeUuid]);

    const methods = useForm<ExportNetworkFormData>({
        defaultValues: emptyExportNetworkFormData,
        resolver: yupResolver(exportNetworkFormSchema),
    });

    const {
        reset,
        formState: { errors },
    } = methods;
    // fetch study name to build the default file name
    useEffect(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid)
                .then((response) => {
                    const studyName = response[response.length - 1]?.elementName;
                    reset(
                        (formValues) => ({
                            ...formValues,
                            [FILE_NAME]: `${studyName}_${nodeName}`,
                        }),
                        { keepDefaultValues: true }
                    );
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'LoadStudyAndParentsInfoError' });
                });
        }
    }, [studyUuid, nodeName, snackError, reset]);

    const onSubmit = useCallback(
        (data: ExportNetworkFormData) => {
            const dto = exportNetworkFormToDto(data);
            onClick(nodeUuid, data[EXPORT_PARAMETERS], dto);
        },
        [nodeUuid, onClick]
    );

    return (
        <CustomMuiDialog
            onClose={onClose}
            open={open}
            formContext={{
                ...methods,
                validationSchema: exportNetworkFormSchema,
            }}
            disabledSave={isDisabledValidationButton(errors, FILE_NAME)}
            onSave={onSubmit}
            titleId="exportNetwork"
            sx={{
                '.MuiDialog-paper': {
                    minWidth: '30vw',
                },
            }}
        >
            <ExportNetworkForm open={open} isDeveloperMode={isDeveloperMode} />
        </CustomMuiDialog>
    );
}
