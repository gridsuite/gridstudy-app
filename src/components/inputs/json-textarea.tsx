/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import EditorTextarea, { EditorTextareaProps } from './editor-textarea';
import 'ace-builds/src-noconflict/mode-json'; // /!\ must be AFTER import of EditorTextarea
import { useId } from 'react';

export type JsonTextareaProps = Exclude<EditorTextareaProps, 'mode' | 'name'>;

export function JsonTextarea(props: Readonly<JsonTextareaProps>) {
    const id = useId();
    return <EditorTextarea placeholder="{}" showPrintMargin={false} {...props} mode="json" name={id} />;
}
