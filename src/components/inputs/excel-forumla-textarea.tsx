/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import EditorTextarea, { EditorTextareaProps } from './editor-textarea';
import 'ace-builds/src-noconflict/mode-text'; // /!\ must be AFTER import of EditorTextarea
import { useId } from 'react';
import { useIntl } from 'react-intl';

/* TODO write syntax coloration for excel formulas (keywords, syntax ("&,=-+/*$...), indent, ...)
https://ace.c9.io/tool/mode_creator.html
https://stackoverflow.com/questions/63440458/ace-editor-custom-mode-adding-highlight-rules-to-existing-set
https://medium.com/@jackub/writing-custom-ace-editor-mode-5a7aa83dbe50
 */

export type ExcelFormulaTextareaProps = Exclude<EditorTextareaProps, 'mode' | 'name'>;

export function ExcelFormulaTextarea(props: Readonly<ExcelFormulaTextareaProps>) {
    const intl = useIntl();
    const id = useId();
    return (
        <EditorTextarea
            placeholder={intl.formatMessage({ id: 'spreadsheet/custom_column/dialog_edit/placeholder' })}
            showPrintMargin={false}
            {...props}
            mode="text" //TODO excel
            name={id}
        />
    );
}
