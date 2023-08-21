/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ImportParameters } from './import-parameters';
import {
    CaseImportParameters,
    getCaseImportParameters,
} from 'services/network-conversion';
import { UUID } from 'crypto';
import { UploadFileButton } from './upload-file-button';
import { createCase } from 'services/case';
import { recreateStudyNetworkFromExistingCase } from 'services/study/study';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useSnackMessage } from '@gridsuite/commons-ui';

interface CreateStudyDialogProps {
    closeDialog: () => void;
}

export const CreateStudyDialog: FunctionComponent<CreateStudyDialogProps> = ({
    closeDialog,
}) => {
    const { snackError } = useSnackMessage();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentParameters, setCurrentParameters] = useState<
        Record<string, any>
    >({});
    const [formatWithParameters, setFormatWithParameters] = useState<
        CaseImportParameters[]
    >([]);
    const [isUploadingFileInProgress, setUploadingFileInProgress] =
        useState(false);

    const [generatedCaseUuid, setGeneratedCaseUuid] = useState<
        UUID | undefined
    >();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);

    const isCreationAllowed = !!selectedFile && !isUploadingFileInProgress;

    const onChange = useCallback(
        (paramName: string, value: any, isEdit: boolean) => {
            if (!isEdit) {
                setCurrentParameters((prevCurrentParameters) => {
                    return {
                        ...prevCurrentParameters,
                        ...{ [paramName]: value },
                    };
                });
            }
        },
        []
    );

    const handleCreateNewStudy = useCallback(() => {
        if (generatedCaseUuid) {
            recreateStudyNetworkFromExistingCase(
                generatedCaseUuid,
                studyUuid,
                currentParameters
            )
                .then(() => {
                    closeDialog();
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'networkRecreationError',
                    });
                });
        }
    }, [
        currentParameters,
        generatedCaseUuid,
        closeDialog,
        snackError,
        studyUuid,
    ]);

    const getCaseImportParams = useCallback((caseUuid: UUID) => {
        getCaseImportParameters(caseUuid)
            .then((result) => {
                // sort possible values alphabetically to display select options sorted
                result.parameters = result.parameters?.map((p) => {
                    p.possibleValues = p.possibleValues?.sort((a, b) =>
                        a.localeCompare(b)
                    );
                    return p;
                });
                setFormatWithParameters(result.parameters);
            })
            .catch(() => {
                setFormatWithParameters([]);
            });
    }, []);

    useEffect(() => {
        if (selectedFile) {
            setUploadingFileInProgress(true);
            createCase(selectedFile)
                .then((caseUuid) => {
                    setGeneratedCaseUuid(caseUuid);
                    getCaseImportParams(caseUuid);
                })
                .catch((error) => {})
                .finally(() => {
                    setUploadingFileInProgress(false);
                });
        }
    }, [selectedFile, getCaseImportParams]);

    return (
        <Dialog
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth="md"
            open={true}
        >
            <DialogTitle id="form-dialog-title">
                <FormattedMessage id="importNewSituation" />
            </DialogTitle>
            <DialogContent>
                <UploadFileButton
                    isLoading={isUploadingFileInProgress}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    label="uploadCase"
                />
                <ImportParameters
                    formatWithParameters={formatWithParameters}
                    currentParameters={currentParameters}
                    onChange={onChange}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCreateNewStudy}
                    disabled={!isCreationAllowed}
                    variant="outlined"
                >
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
