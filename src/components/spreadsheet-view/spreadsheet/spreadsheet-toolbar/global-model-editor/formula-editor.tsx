/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ExpandingTextField, ExpandingTextFieldProps } from '@gridsuite/commons-ui';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormContext, useWatch } from 'react-hook-form';
import { useFormulaSearch } from './formula-search-context';
import { useMemo } from 'react';

const styles = {
    container: {
        position: 'relative',
        flexGrow: 1,
    },
    overlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        whiteSpace: 'pre-wrap' as const,
        color: 'transparent',
        pointerEvents: 'none' as const,
        // mimic default MUI TextField padding
        padding: '16.5px 14px',
        boxSizing: 'border-box' as const,
    },
    textField: {
        position: 'relative' as const,
        backgroundColor: 'transparent',
    },
};

export default function FormulaEditor({ name }: Readonly<ExpandingTextFieldProps>) {
    const theme = useTheme();
    const { control } = useFormContext();
    const value = useWatch({ name, control }) as string | undefined;
    const { searchTerm } = useFormulaSearch();

    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const overlaySx = useMemo(() => {
        const { fontFamily, body1 } = theme.typography;
        return {
            ...styles.overlay,
            fontFamily,
            fontSize: body1?.fontSize,
            fontWeight: body1?.fontWeight,
            lineHeight: '1.4375em',
            letterSpacing: body1?.letterSpacing,
        };
    }, [theme]);

    const highlighted = useMemo(() => {
        const formula = value ?? '';
        if (!searchTerm) {
            return formula;
        }

        const escaped = escapeRegExp(searchTerm);
        const regex = new RegExp(escaped, 'gi');
        const nodes: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let occurrence = 0;

        while ((match = regex.exec(formula)) !== null) {
            const matchIndex = match.index;
            const matchText = match[0];

            if (matchIndex > lastIndex) {
                nodes.push(formula.slice(lastIndex, matchIndex));
            }

            nodes.push(
                <span
                    key={`${matchIndex}-${occurrence}`}
                    style={{ backgroundColor: theme.searchedText.highlightColor }}
                >
                    {matchText}
                </span>
            );

            lastIndex = matchIndex + matchText.length;
            occurrence += 1;

            if (matchText.length === 0) {
                regex.lastIndex += 1;
            }
        }

        if (lastIndex < formula.length) {
            nodes.push(formula.slice(lastIndex));
        }

        return nodes.length > 0 ? nodes : formula;
    }, [searchTerm, theme.searchedText.highlightColor, value]);

    return (
        <Box sx={styles.container}>
            <Box aria-hidden sx={overlaySx}>
                {highlighted}
            </Box>
            <ExpandingTextField name={name} label="" minRows={3} rows={3} sx={styles.textField} />
        </Box>
    );
}
