/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Grid, Input } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import {
    API_CALL,
    CASE_FILE,
    CASE_NAME,
    CASE_UUID,
} from '../../utils/field-constants';
import {
    createCaseWithoutDirectoryElementCreation,
    deleteCase,
} from '../../../utils/rest-api';

interface UploadNewCaseProps {
    isNewStudyCreation?: boolean;
    getCurrentCaseImportParams?: (uuid: string) => void;
    handleApiCallError?: ErrorCallback;
}

const MAX_FILE_SIZE_IN_MO = 100;
const MAX_FILE_SIZE_IN_BYTES = MAX_FILE_SIZE_IN_MO * 1024 * 1024;

const UploadNewCase: React.FunctionComponent<UploadNewCaseProps> = ({
    isNewStudyCreation = false,
    getCurrentCaseImportParams,
    handleApiCallError,
}) => {
    const intl = useIntl();

    const [caseFileLoading, setCaseFileLoading] = useState(false);

    const {
        field: { ref, value, onChange: onValueChange },
    } = useController({
        name: CASE_FILE,
    });

    const {
        field: { onChange: onCaseUuidChange },
    } = useController({
        name: CASE_UUID,
    });

    const { clearErrors, setError, getValues, setValue } = useFormContext();

    const caseFile = value as File;
    const { name: caseFileName } = caseFile || {};

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        clearErrors(CASE_FILE);
        clearErrors(`root.${API_CALL}`);

        const files = event.target.files;

        if (files?.length) {
            const currentFile = files[0];

            if (currentFile.size <= MAX_FILE_SIZE_IN_BYTES) {
                onValueChange(currentFile);

                const { name: caseFileName } = currentFile;

                if (isNewStudyCreation) {
                    // Create new case
                    setCaseFileLoading(true);
                    createCaseWithoutDirectoryElementCreation(currentFile)
                        .then((newCaseUuid) => {
                            const prevCaseUuid = getValues(CASE_UUID);

                            if (prevCaseUuid && prevCaseUuid !== newCaseUuid) {
                                deleteCase(prevCaseUuid).catch(
                                    handleApiCallError
                                );
                            }

                            onCaseUuidChange(newCaseUuid);

                            if (getCurrentCaseImportParams) {
                                getCurrentCaseImportParams(newCaseUuid);
                            }
                        })
                        .catch(handleApiCallError)
                        .finally(() => {
                            setCaseFileLoading(false);
                        });
                } else {
                    const caseName = getValues(CASE_NAME);
                    if (caseFileName && !caseName) {
                        clearErrors(CASE_NAME);
                        setValue(
                            CASE_NAME,
                            caseFileName.substring(
                                0,
                                caseFileName.indexOf('.')
                            ),
                            {
                                shouldDirty: true,
                            }
                        );
                    }
                }
            } else {
                setError(CASE_FILE, {
                    type: 'caseFileSize',
                    message: intl
                        .formatMessage(
                            {
                                id: 'uploadFileExceedingLimitSizeErrorMsg',
                            },
                            {
                                maxSize: MAX_FILE_SIZE_IN_MO,
                            }
                        )
                        .toString(),
                });
            }
        }
    };

    return (
        <Grid container alignItems="center" spacing={1} pt={1}>
            <Grid item>
                <Button variant="contained" color="primary" component="label">
                    <FormattedMessage id="uploadCase" />
                    <Input
                        ref={ref}
                        type="file"
                        name="file"
                        onChange={onChange}
                        sx={{ display: 'none' }}
                    />
                </Button>
            </Grid>
            <Grid item sx={{ fontWeight: 'bold' }}>
                <p>
                    {caseFileLoading ? (
                        <CircularProgress size="1rem" />
                    ) : caseFileName ? (
                        <span>{caseFileName}</span>
                    ) : (
                        <FormattedMessage id="uploadMessage" />
                    )}
                </p>
            </Grid>
        </Grid>
    );
};

export default UploadNewCase;
