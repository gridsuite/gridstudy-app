/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldValues, UseFormGetValues } from 'react-hook-form';
import {
    ElementSaveDialog,
    ElementType,
    IElementCreationDialog,
    IElementUpdateDialog,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { createParameter, updateParameter } from 'services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useCallback } from 'react';

interface CreateParameterProps<T extends FieldValues> {
    open: boolean;
    onClose: () => void;
    parameterValues: UseFormGetValues<T> | any;
    parameterType: ElementType;
    parameterFormatter: (newParams: any) => any;
}

const CreateParameterDialog = <T extends FieldValues>({
    open,
    onClose,
    parameterValues,
    parameterType,
    parameterFormatter,
}: CreateParameterProps<T>) => {
    const { snackError, snackInfo } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const saveParameters = useCallback(
        (element: IElementCreationDialog) => {
            createParameter(
                parameterFormatter(parameterValues()),
                element.name,
                parameterType,
                element.description,
                element.folderId
            )
                .then(() => {
                    snackInfo({
                        headerId: 'paramsCreationMsg',
                        headerValues: {
                            directory: element.folderName,
                        },
                    });
                })
                .catch((error) => {
                    console.error(error);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsCreatingError',
                    });
                });
        },
        [parameterFormatter, parameterType, parameterValues, snackError, snackInfo]
    );

    const updateParameters = ({ id, name, description, elementFullPath }: IElementUpdateDialog) => {
        updateParameter(id, parameterFormatter(parameterValues()), name, parameterType, description)
            .then(() => {
                snackInfo({
                    headerId: 'paramsUpdateMsg',
                    headerValues: {
                        directory: elementFullPath,
                    },
                });
            })
            .catch((error) => {
                console.error(error);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsUpdatingError',
                });
            });
    };

    return (
        studyUuid && (
            <ElementSaveDialog
                open={open}
                onClose={onClose}
                onSave={saveParameters}
                OnUpdate={updateParameters}
                type={parameterType}
                titleId={'saveParameters'}
                studyUuid={studyUuid}
                selectorTitleId="directory"
                createLabelId="createParameter"
                updateLabelId="updateParameter"
            />
        )
    );
};

export default CreateParameterDialog;
