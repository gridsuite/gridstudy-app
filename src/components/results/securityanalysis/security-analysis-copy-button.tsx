/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { unzip } from 'fflate';
import Papa from 'papaparse';
import {
    copyToClipboard,
    fetchCsvSeparator,
    getCsvDelimiter,
    GsLangUser,
    MuiStyles,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';

const COPY_SUCCESS_RESET_DELAY_MS = 2000;

// Same bordered/rounded treatment as spreadsheetStyles.spreadsheetButton, for visual
// consistency with the "tableur" toolbar buttons.
const styles = {
    copyButton: {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '6px',
    },
} as const satisfies MuiStyles;

interface SecurityAnalysisCopyButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    enumValueTranslations: Record<string, string>;
    downloadZipResult: (
        studyUuid: UUID,
        nodeUuid: UUID,
        rootNetworkUuid: UUID,
        enumValueTranslations: Record<string, string>,
        language: GsLangUser
    ) => Promise<Blob>;
    disabled?: boolean;
}

/**
 * Extracts the single CSV entry from a zip blob and returns it as text (BOM stripped).
 * Decompression runs off the main thread (fflate's async API) since the copy action
 * can be triggered on large result archives.
 */
async function extractCsvTextFromZipBlob(blob: Blob): Promise<string> {
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const unzipped = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
        unzip(buffer, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
    const entryNames = Object.keys(unzipped);
    const csvEntryName = entryNames.find((name) => name.toLowerCase().endsWith('.csv'));
    if (!csvEntryName) {
        throw new Error('No CSV entry found in zip archive');
    }
    // Decode as UTF-8 and strip a potential BOM (backend prefixes result.csv with one)
    const text = new TextDecoder('utf-8').decode(unzipped[csvEntryName]);
    return text.replace(/^\uFEFF/, '');
}

/**
 * Re-joins CSV fields using the copy separator instead of the file (download) separator.
 * Uses a CSV-aware parser/serializer so quoted fields, embedded separators and embedded
 * newlines are preserved. Values themselves (dates, numbers with decimal comma, translated
 * enums) are left untouched.
 */
function convertDelimiter(csvText: string, fromSeparator: string, toSeparator: string): string {
    if (fromSeparator === toSeparator) {
        return csvText;
    }
    const { data } = Papa.parse<string[]>(csvText, { delimiter: fromSeparator, skipEmptyLines: true });
    return Papa.unparse(data, { delimiter: toSeparator });
}

export const SecurityAnalysisCopyButton: FunctionComponent<SecurityAnalysisCopyButtonProps> = ({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    enumValueTranslations,
    downloadZipResult,
    disabled,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const [isCopyLoading, setIsCopyLoading] = useState(false);
    const [isCopySuccessful, setIsCopySuccessful] = useState(false);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        // reinit the success state when the button is disabled,
        // for example when the calcul status change or results change
        setIsCopySuccessful(false);
    }, [disabled]);

    useEffect(() => {
        return () => clearTimeout(resetTimeoutRef.current);
    }, []);

    const handleCopy = useCallback(() => {
        setIsCopyLoading(true);
        setIsCopySuccessful(false);
        Promise.all([
            downloadZipResult(studyUuid, nodeUuid, rootNetworkUuid, enumValueTranslations, language),
            fetchCsvSeparator(),
        ])
            .then(async ([zipBlob, copySeparator]) => {
                const csvText = await extractCsvTextFromZipBlob(zipBlob);
                const downloadSeparator = getCsvDelimiter(language);
                const textToCopy = convertDelimiter(csvText, downloadSeparator, copySeparator ?? downloadSeparator);
                copyToClipboard(
                    textToCopy,
                    () => {
                        setIsCopySuccessful(true);
                        clearTimeout(resetTimeoutRef.current);
                        resetTimeoutRef.current = setTimeout(
                            () => setIsCopySuccessful(false),
                            COPY_SUCCESS_RESET_DELAY_MS
                        );
                    },
                    () => snackError({ headerId: 'securityAnalysisCopyResultsError' })
                );
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'securityAnalysisCopyResultsError' });
            })
            .finally(() => setIsCopyLoading(false));
    }, [studyUuid, nodeUuid, rootNetworkUuid, enumValueTranslations, language, downloadZipResult, snackError]);

    return (
        <Tooltip title={intl.formatMessage({ id: isCopySuccessful ? 'copiedToClipboard' : 'copyToClipboard' })}>
            <span>
                <IconButton
                    onClick={handleCopy}
                    disabled={disabled || isCopyLoading}
                    size="small"
                    sx={styles.copyButton}
                >
                    {isCopySuccessful ? (
                        <CheckIcon color="success" fontSize="small" />
                    ) : (
                        <ContentCopyIcon fontSize="small" />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};
