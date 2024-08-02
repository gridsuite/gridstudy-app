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
import { ReduxState } from '../../redux/reducer.type';
import { useMemo } from 'react';
import { DARK_THEME, LIGHT_THEME } from '@gridsuite/commons-ui';

/* TODO look into extensions:
ext-beautify.js
ext-code_lens.js
ext-command_bar.js
ext-elastic_tabstops_lite.js
ext-emmet.js
ext-error_marker.js
ext-hardwrap.js
ext-inline_autocomplete.js
ext-keybinding_menu.js
ext-language_tools.js
ext-linking.js
ext-modelist.js
ext-options.js
ext-prompt.js
ext-rtl.js
ext-searchbox.js
ext-settings_menu.js
ext-simple_tokenizer.js
ext-spellcheck.js
ext-split.js
ext-static_highlight.js
ext-statusbar.js
ext-textarea.js
ext-themelist.js
ext-whitespace.js
 */

export type EditorTextareaProps = Exclude<IAceEditorProps, 'theme'>;

export default function EditorTextarea(props: Readonly<EditorTextareaProps>) {
    const theme = useSelector((state: ReduxState) => state.theme);
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
