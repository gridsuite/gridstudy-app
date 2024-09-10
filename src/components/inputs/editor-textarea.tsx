/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github_light_default';
import 'ace-builds/src-noconflict/keybinding-vscode';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { useMemo } from 'react';
import { DARK_THEME, LIGHT_THEME } from '@gridsuite/commons-ui';

export type EditorTextareaProps = Exclude<IAceEditorProps, 'theme'>;

export default function EditorTextarea(props: Readonly<EditorTextareaProps>) {
    const theme = useSelector((state: AppState) => state.theme);
    const aceTheme = useMemo<IAceEditorProps['theme']>(() => {
        switch (theme) {
            case LIGHT_THEME:
                return 'github_light_default';
            case DARK_THEME:
                return 'github_dark';
            default:
                return 'github'; // what is the diff?
        }
    }, [theme]);
    return (
        <AceEditor
            {...props}
            theme={aceTheme}
            editorProps={{
                $blockScrolling: true,
                ...(props.editorProps || {}),
            }}
        />
    );
}
