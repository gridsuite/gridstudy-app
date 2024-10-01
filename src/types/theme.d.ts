import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        link: {
            color: string;
        };
        node: {
            background: string;
            hover: string;
            border: string;
        };
        selectedRow: {
            background: string;
        };
        editableCell: {
            outline: string;
            border: string;
            borderRadius: string;
            boxShadow: string;
        };
        editableCellError: {
            outline: string;
            border: string;
            borderRadius: string;
            boxShadow: string;
        };
        tooltipTable: {
            background: string;
        };
        formFiller: {
            background: string;
        };
        aggridValueChangeHighlightBackgroundColor: string;
    }

    // allow configuration using `createTheme`
    interface ThemeOptions {
        link?: {
            color?: string;
        };
        node?: {
            background?: string;
            hover?: string;
            border?: string;
        };
        selectedRow?: {
            background?: string;
        };
        editableCell?: {
            outline?: string;
            border?: string;
            borderRadius?: string;
            boxShadow?: string;
        };
        editableCellError?: {
            outline?: string;
            border?: string;
            borderRadius?: string;
            boxShadow?: string;
        };
        tooltipTable?: {
            background?: string;
        };
        formFiller?: {
            background?: string;
        };
        aggridValueChangeHighlightBackgroundColor?: string;
    }
}
