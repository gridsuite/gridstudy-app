/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldValues, UseFormGetValues } from 'react-hook-form';
import { ElementType } from '@gridsuite/commons-ui';
import { createParameter } from 'services/explore';
import ElementCreationDialog, { IElementCreationDialog } from '../../element-creation-dialog';

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
    const saveParameters = ({ name, description, folderName, folderId }: IElementCreationDialog) => {
        createParameter(parameterFormatter(parameterValues()), name, parameterType, description, folderId);
    };

    return (
        <ElementCreationDialog
            open={open}
            onClose={onClose}
            onSave={saveParameters}
            type={parameterType}
            titleId={'saveParameters'}
        />
    );
};

export default CreateParameterDialog;
