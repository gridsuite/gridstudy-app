/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    useStateBoolean,
    UseStateBooleanReturn,
} from '../../../hooks/use-states';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { useCallback, useEffect, useState } from 'react';
import { TABLES_NAMES } from '../utils/config-tables';
import { JsonTextarea } from '../../inputs/json-textarea';

export type CustomColumnDialogProps = {
    open: UseStateBooleanReturn;
    indexTab: number;
    onImport: (content: unknown) => void;
};

//TODO const JsonTextArea = styled(JsonTextarea);

export default function CustomColumnsImExPort({
    open,
    indexTab,
    onImport,
}: Readonly<CustomColumnDialogProps>) {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const contentModified = useStateBoolean(false);
    const resetContentModified = contentModified.setFalse;
    const setContentModified = contentModified.setValue;
    const definitions = useSelector(
        (state: ReduxState) =>
            state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]
    );
    const [definitionsJson, setDefinitionsJson] = useState('');
    const [currentJson, setCurrentJson] = useState('');

    const resetAction = useCallback(() => {
        setCurrentJson(definitionsJson);
        resetContentModified();
    }, [definitionsJson, resetContentModified]);
    useEffect(() => {
        if (open.value) {
            setDefinitionsJson(JSON.stringify(definitions, undefined, 2));
            resetAction();
        }
    }, [open.value, definitions, resetAction]);

    const onContentChange = useCallback(
        (content: string) => {
            setCurrentJson(content);
            setContentModified(definitionsJson !== content);
        },
        [definitionsJson, setContentModified]
    );
    const importAction = useCallback(() => {
        onImport(currentJson);
    }, [currentJson, onImport]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(currentJson);
    }, [currentJson]);

    const pasteFromClipboard = useCallback(() => {
        navigator.clipboard.readText().then(setCurrentJson);
    }, []);
    return (
        <Dialog
            id="custom-column-dialog-json"
            open={open.value}
            onClose={open.setFalse}
            aria-labelledby="custom-column-dialog-json-title"
        >
            <DialogTitle id="custom-column-dialog-json-title">
                <FormattedMessage id="spreadsheet/custom_column/dialog/import_export" />
            </DialogTitle>
            <DialogContent dividers>
                <JsonTextarea
                    name="custom-column-dialog-json-content"
                    defaultValue={definitionsJson}
                    value={currentJson}
                    debounceChangePeriod={1000}
                    onChange={onContentChange}
                    //TODO width+height 100%
                    //TODO validation isJson + json valide? yup?
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={copyToClipboard}
                    variant="contained"
                    color="secondary"
                >
                    <FormattedMessage id="spreadsheet/custom_column/copy" />
                </Button>
                <Button
                    onClick={pasteFromClipboard}
                    variant="contained"
                    color="secondary"
                >
                    <FormattedMessage id="spreadsheet/custom_column/paste" />
                </Button>
                <Button
                    onClick={resetAction}
                    variant="contained"
                    color="warning"
                    disabled={!contentModified.value}
                >
                    <FormattedMessage id="spreadsheet/custom_column/reset" />
                </Button>
                <Button
                    onClick={importAction}
                    variant="contained"
                    color="primary"
                    disabled={!contentModified.value}
                    //TODO disabled also if invalidJson
                >
                    <FormattedMessage id="spreadsheet/custom_column/import" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
