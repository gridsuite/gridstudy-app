import { useController } from 'react-hook-form';
import AceEditor from 'react-ace';
import React from 'react';
import { useSelector } from 'react-redux';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-clouds_midnight';

const AceInput = ({ name, ...props }) => {
    const selectedTheme = useSelector((state) => state.theme);
    /**
     * Set name of for the Ace Editor : if theme is light set "github theme" else set "clouds_midnight theme"
     * */
    let themeForAceEditor = () => {
        return selectedTheme === 'Light'
            ? 'github'
            : selectedTheme === 'Dark'
            ? 'clouds_midnight'
            : '';
    };

    const {
        field: { onChange, value },
    } = useController({ name });

    return (
        <AceEditor
            mode="groovy"
            theme={themeForAceEditor()}
            onChange={(val) => onChange(val)}
            value={value}
            {...props}
        />
    );
};

export default AceInput;
