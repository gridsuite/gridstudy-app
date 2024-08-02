/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import EditorTextarea, { EditorTextareaProps } from './editor-textarea';
import 'ace-builds/src-noconflict/mode-json'; // /!\ muste be AFTER import of EditorTextarea

export type JsonTextareaProps = Exclude<EditorTextareaProps, 'mode'>;

export function JsonTextarea(props: Readonly<JsonTextareaProps>) {
    return (
        <EditorTextarea
            placeholder="{}"
            showPrintMargin={false}
            {...props}
            mode="json"
            name="UNIQUE_ID_OF_DIV"
        />
    );
}
