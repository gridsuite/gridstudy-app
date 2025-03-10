/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Grid, Typography } from '@mui/material';
import { CASE_ID, CASE_NAME } from 'components/utils/field-constants';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ImportCaseDialog from '../import-case-dialog';
import { TreeViewFinderNodeProps, fetchDirectoryElementPath, useSnackMessage } from '@gridsuite/commons-ui';
import { useWatch } from 'react-hook-form';
import { FolderOutlined } from '@mui/icons-material';

interface RootNetworkCaseSelectionProps {
    onSelectCase: (selectedCase: TreeViewFinderNodeProps) => void;
    isModification: boolean;
}

export const RootNetworkCaseSelection = ({ onSelectCase, isModification }: RootNetworkCaseSelectionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const caseNameWatch = useWatch({ name: CASE_NAME });
    const caseIdWatch = useWatch({ name: CASE_ID });
    const [directoryName, setDirectoryName] = useState('');
    const { snackError } = useSnackMessage();

    const handleSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        onSelectCase(selectedCase);
        setIsDialogOpen(false);
    };

    // fetch folder name of selected case to build default file name
    useEffect(() => {
        if (caseIdWatch) {
            fetchDirectoryElementPath(caseIdWatch)
                .then((res) => {
                    if (!res || res.length < 2) {
                        snackError({
                            headerId: 'rootNetworkDirectoryFetchingError',
                        });
                        return;
                    }
                    const parentFolderIndex = res.length - 2;
                    setDirectoryName(res[parentFolderIndex].elementName);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'rootNetworkDirectoryFetchingError',
                    });
                });
        }
    }, [caseIdWatch, snackError]);

    return (
        <>
            <Grid container item>
                <Typography m={1} component="span">
                    <Box fontWeight="fontWeightBold" display="flex" justifyContent="center" alignItems="center">
                        <FolderOutlined />
                        <span>
                            &nbsp;
                            {directoryName} &nbsp;
                        </span>
                    </Box>
                </Typography>
                <Grid item>
                    <Button
                        variant={caseNameWatch ? 'contained' : undefined}
                        size={caseNameWatch ? 'small' : 'medium'}
                        onClick={() => setIsDialogOpen(true)}
                    >
                        {caseNameWatch || isModification ? (
                            <FormattedMessage id={'ModifyFromMenu'} />
                        ) : (
                            <FormattedMessage id={'chooseCase'} />
                        )}
                    </Button>
                </Grid>
            </Grid>
            <ImportCaseDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSelectCase={handleSelectCase}
            />
        </>
    );
};
