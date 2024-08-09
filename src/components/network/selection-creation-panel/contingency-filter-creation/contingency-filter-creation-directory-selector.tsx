/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DirectoryItemSelector, ElementType, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { FolderOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectionCreationPanelFormSchema } from '../selection-creation-schema';
import { DESTINATION_FOLDER, FOLDER_ID, FOLDER_NAME } from 'components/utils/field-constants';
import { useState } from 'react';
import { UUID } from 'crypto';

export const SelectionCreationPanelDirectorySelector = (props: { pendingState: boolean }) => {
    const { pendingState } = props;
    const intl = useIntl();

    const { setValue } = useFormContext<SelectionCreationPanelFormSchema>();
    const destinationFolderWatcher = useWatch<SelectionCreationPanelFormSchema, typeof DESTINATION_FOLDER>({
        name: DESTINATION_FOLDER,
    });
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);

    const handleChangeFolder = () => {
        setOpenDirectorySelector(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== destinationFolderWatcher?.folderId) {
                setValue(DESTINATION_FOLDER, {
                    [FOLDER_ID]: folder[0].id as UUID,
                    [FOLDER_NAME]: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };

    return (
        <>
            <Grid container>
                {/* icon directory */}

                <Typography m={1} component="span">
                    <Box fontWeight={'fontWeightBold'} display="flex" justifyContent="center" alignItems="center">
                        <FolderOutlined />
                        <span>
                            &nbsp;{destinationFolderWatcher?.folderName || ''}
                            &nbsp;
                        </span>
                    </Box>
                </Typography>
                <Button onClick={handleChangeFolder} variant="contained" size="small" disabled={pendingState}>
                    <FormattedMessage id={'button.changeType'} />
                </Button>
            </Grid>
            <Grid container>
                <DirectoryItemSelector
                    open={openDirectorySelector}
                    onClose={setSelectedFolder}
                    types={[ElementType.DIRECTORY]}
                    onlyLeaves={false}
                    multiSelect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                    title={intl.formatMessage({
                        id: 'showSelectDirectoryDialog',
                    })}
                />
            </Grid>
        </>
    );
};
