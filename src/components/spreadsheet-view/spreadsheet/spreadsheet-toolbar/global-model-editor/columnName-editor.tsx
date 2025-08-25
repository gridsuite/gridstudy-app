/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TextInput } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

interface ColumnNameEditorProps {
    name: string;
    rowIndex: number;
    generateColumnId: (rowIndex: number, columnName: string) => void;
}

export default function ColumnNameEditor({ name, rowIndex, generateColumnId }: ColumnNameEditorProps) {
    const columnName = useWatch({
        name: name,
    });
    const onBlurColumnName = useCallback(() => {
        generateColumnId(rowIndex, columnName);
    }, [columnName, rowIndex, generateColumnId]);

    return (
        <TextInput
            name={name}
            formProps={{
                autoFocus: true,
                onBlur: onBlurColumnName,
            }}
        />
    );
}
