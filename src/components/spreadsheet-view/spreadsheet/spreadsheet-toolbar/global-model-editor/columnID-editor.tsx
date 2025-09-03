/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TableTextInput } from '@gridsuite/commons-ui';

interface ColumnIDEditorProps {
    readonly name: string;
}

export default function ColumnIDEditor({ name }: ColumnIDEditorProps) {
    return (
        <TableTextInput
            name={name}
            inputProps={{
                autoFocus: true,
            }}
        />
    );
}
