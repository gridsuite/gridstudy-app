/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Grid, Typography } from '@mui/material';
import { CASE_NAME } from 'components/utils/field-constants';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ImportCaseDialog from '../import-case-dialog';
import { TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { useWatch } from 'react-hook-form';
import { FolderOutlined } from '@mui/icons-material';

interface RootNetworkCaseSelectionProps {
    onSelectCase: (selectedCase: TreeViewFinderNodeProps) => void;
}

export const RootNetworkCaseSelection = ({ onSelectCase }: RootNetworkCaseSelectionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const caseNameWatch = useWatch({ name: CASE_NAME });

    const handleSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        onSelectCase(selectedCase);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Grid container item>
                <Typography m={1} component="span">
                    <Box fontWeight="fontWeightBold" display="flex" justifyContent="center" alignItems="center">
                        <FolderOutlined />
                        <span>
                            &nbsp;
                            {caseNameWatch ? caseNameWatch : ''}
                        </span>
                    </Box>
                </Typography>
                <Grid item>
                    <Button onClick={() => setIsDialogOpen(true)} variant="contained" size={'small'}>
                        {caseNameWatch ? (
                            <FormattedMessage id={'ModifyFromMenu'} />
                        ) : (
                            <FormattedMessage id={'ChooseCase'} />
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
