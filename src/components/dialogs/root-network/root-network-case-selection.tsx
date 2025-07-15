/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TreeViewFinderNodeProps, fetchDirectoryElementPath } from '@gridsuite/commons-ui';
import { FolderOutlined } from '@mui/icons-material';
import { UUID } from 'crypto';
import ImportCaseDialog from '../import-case-dialog';

interface RootNetworkCaseSelectionProps {
    onSelectCase: (selectedCase: TreeViewFinderNodeProps) => void;
    isModification: boolean;
    originalCaseUuid?: UUID;
}

export const RootNetworkCaseSelection = ({
    onSelectCase,
    isModification,
    originalCaseUuid,
}: RootNetworkCaseSelectionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState<UUID[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ id: UUID; path?: string } | null>(null);

    const handleSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        const { id, name, parents } = selectedCase;
        let path;
        if (parents) {
            path = [...parents.map((parent) => parent.name), name].join('/');
        }
        setSelectedItem({ id, path });
        onSelectCase(selectedCase);
        setIsDialogOpen(false);
    };

    useEffect(() => {
        if (isModification && !selectedItem && originalCaseUuid) {
            fetchDirectoryElementPath(originalCaseUuid).then((res) => {
                setExpanded(res.filter((e) => e.elementUuid !== originalCaseUuid).map((e) => e.elementUuid));
                const path = res.map((e) => e.elementName).join('/');
                setSelectedItem({ id: originalCaseUuid, path });
            });
        }
    }, [originalCaseUuid, isModification, selectedItem]);

    return (
        <>
            <Grid container alignItems="center" item>
                <Grid item display="flex" marginLeft={1}>
                    <FolderOutlined />
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight="fontWeightBold">{selectedItem?.path}</Box>
                </Typography>
                <Grid item>
                    <Button
                        variant={isModification ? 'contained' : undefined}
                        size={isModification ? 'small' : 'medium'}
                        onClick={() => setIsDialogOpen(true)}
                    >
                        {isModification ? (
                            <FormattedMessage id={'ModifyFromMenu'} />
                        ) : (
                            <FormattedMessage id={'chooseCase'} />
                        )}
                    </Button>
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight="fontWeightBold">
                        {!selectedItem && isModification ? (
                            <FormattedMessage id={'rootNetwork.originalCaseRemoved'} />
                        ) : null}
                    </Box>
                </Typography>
            </Grid>
            <ImportCaseDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSelectCase={handleSelectCase}
                expanded={expanded}
                selected={selectedItem ? [selectedItem.id] : []}
            />
        </>
    );
};
