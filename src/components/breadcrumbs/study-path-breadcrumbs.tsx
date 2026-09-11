/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MoreHoriz } from '@mui/icons-material';
import { Box, Breadcrumbs as MuiBreadcrumbs, type Theme, Tooltip, useMediaQuery } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CurrentSelection from './current-selection';

const styles = {
    tooltipItem: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    breadcrumbItem: {
        maxWidth: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    parentDirectoryItem: {
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
} as const satisfies MuiStyles;

export interface StudyPathBreadcrumbsProps {
    studyName: string | undefined;
    parentDirectoriesNames: string[];
}

export default function StudyPathBreadcrumbs({
    studyName,
    parentDirectoriesNames,
}: Readonly<StudyPathBreadcrumbsProps>) {
    const nearestParentDirectoryName = parentDirectoriesNames?.at(-1);
    const showParentDirectory = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    return (
        <MuiBreadcrumbs
            aria-label="breadcrumb"
            color="text"
            separator={<KeyboardArrowRightIcon fontSize="small" />}
            sx={{ p: 0.25 }}
        >
            <Tooltip
                title={
                    <Box sx={styles.tooltipItem}>
                        {parentDirectoriesNames?.map((directoryName: string, index) => (
                            <Box key={`${directoryName}-${index}`} sx={styles.tooltipItem}>
                                {directoryName}
                                <KeyboardArrowRightIcon fontSize="small" />
                            </Box>
                        ))}
                        <Box sx={styles.tooltipItem}>{studyName}</Box>
                    </Box>
                }
                slotProps={{
                    tooltip: {
                        sx: {
                            maxWidth: 'none', //  to override background of text is auto cut
                        },
                    },
                }}
            >
                <MoreHoriz sx={{ display: 'flex', alignItems: 'center' }} />
            </Tooltip>
            {showParentDirectory && nearestParentDirectoryName && (
                <Tooltip title={nearestParentDirectoryName}>
                    <Box sx={styles.parentDirectoryItem}>{nearestParentDirectoryName}</Box>
                </Tooltip>
            )}
            <Tooltip title={studyName || ''}>
                <Box sx={styles.breadcrumbItem}>{studyName}</Box>
            </Tooltip>
            <CurrentSelection />
        </MuiBreadcrumbs>
    );
}
