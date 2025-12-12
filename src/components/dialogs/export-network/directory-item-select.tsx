import { Box, Button, FormHelperText, Stack, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useState } from 'react';
import { DirectoryItemSelector, DirectoryItemSelectorProps, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import { separator } from './export-network-utils';
import { useController } from 'react-hook-form';

export interface DirectoryItemSelectProps extends Omit<DirectoryItemSelectorProps, 'onClose' | 'open'> {
    name: string;
}

export function DirectoryItemSelect({ name, ...props }: Readonly<DirectoryItemSelectProps>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    const onNodeChanged = useCallback(
        (nodes: TreeViewFinderNodeProps[]) => {
            if (nodes.length > 0) {
                let updatedFolder: string = nodes[0].name;
                let parentNode: TreeViewFinderNodeProps = nodes[0];
                while (parentNode.parents && parentNode.parents?.length > 0) {
                    parentNode = parentNode?.parents[0];
                    updatedFolder = parentNode.name + separator + updatedFolder;
                }
                updatedFolder = separator + updatedFolder;
                onChange(updatedFolder);
            }
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <Box>
            <Stack direction={'row'} alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary" noWrap>
                    {value || <FormattedMessage id="NoFolder" />}
                    {error?.message && (
                        <FormHelperText error>{intl.formatMessage({ id: error?.message })}</FormHelperText>
                    )}
                </Typography>

                <Button onClick={() => setIsOpen(true)} variant="contained" color="primary" component="label">
                    <FormattedMessage id={value ? 'edit' : 'Select'} />
                </Button>
            </Stack>

            <DirectoryItemSelector open={isOpen} onClose={onNodeChanged} {...props} />
        </Box>
    );
}
