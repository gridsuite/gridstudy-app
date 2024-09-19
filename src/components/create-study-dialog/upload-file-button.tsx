/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import React, { FunctionComponent, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface UploadFileButtonProps {
    isLoading: boolean;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    label: string;
}

export const UploadFileButton: FunctionComponent<UploadFileButtonProps> = ({
    selectedFile,
    setSelectedFile,
    isLoading,
    label,
}) => {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let files = e.currentTarget.files;
        if (files?.length === 0) {
            setSelectedFile(null);
        } else {
            setSelectedFile(files?.[0] ?? null);
        }
    };

    const displayButton = useCallback(() => {
        if (selectedFile?.name === undefined) {
            return <FormattedMessage id="uploadMessage" />;
        }

        if (isLoading) {
            return <CircularProgress size="1rem" />;
        }

        return selectedFile.name;
    }, [selectedFile?.name, isLoading]);

    return (
        <table>
            <tbody>
                <tr>
                    <th>
                        <Button variant="contained" color="primary" component="label">
                            <FormattedMessage id={label} />
                            <input
                                type="file"
                                name="file"
                                onChange={(e) => handleFileUpload(e)}
                                style={{ display: 'none' }}
                            />
                        </Button>
                    </th>
                    <th>
                        <p>{displayButton()}</p>
                    </th>
                </tr>
            </tbody>
        </table>
    );
};
