/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { IconButton, Box, Theme, SelectChangeEvent, MenuItem, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AskTextDialog from '../../utils/ask-text-dialog';
import { lighten, darken } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { OverflowableText } from '@gridsuite/commons-ui';
import { RootNetworkMetadata } from './network-modification-menu.type';
import { fetchRootNetworks } from 'services/root-network';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'redux/reducer';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import { UUID } from 'crypto';

const styles = {
    header: (theme: Theme) => ({
        backgroundColor:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
        padding: theme.spacing(1),
        color: theme.palette.getContrastText(
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2)
        ),
        display: 'flex',
        alignItems: 'center',
    }),
    nodeNameTitle: {
        flexGrow: 1,
        fontWeight: 'bold',
    },
};

interface EditableTitleProps {
    name: string;
    onClose: () => void;
    onChange?: (value: string) => void;
}

export const EditableTitle: FunctionComponent<EditableTitleProps> = ({ name, onClose, onChange }) => {
    const [openEditTitle, setOpenEditTitle] = useState(false);
    const intl = useIntl();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [rootNetworks, setRootNetworks] = useState<RootNetworkMetadata[]>([]);
    const [selectedRootNetworkUuid, setSelectedRootNetworkUuid] = useState<UUID | undefined>(undefined);

    const dispatch = useDispatch();

    const doFetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    setRootNetworks(res);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [studyUuid]);

    useEffect(() => {
        doFetchRootNetworks();
    }, [doFetchRootNetworks]);

    useEffect(() => {
        if (!currentRootNetworkUuid) {
            return;
        }
        setSelectedRootNetworkUuid(currentRootNetworkUuid);
    }, [doFetchRootNetworks, currentRootNetworkUuid]);

    const handleRootNetworkChange = (event: SelectChangeEvent<string>) => {
        const selectedRootNetworkUuid = event.target.value;
        setSelectedRootNetworkUuid(selectedRootNetworkUuid as UUID);
        dispatch(setCurrentRootNetworkUuid(selectedRootNetworkUuid as UUID));
    };

    return (
        <Box sx={styles.header}>
            <IconButton size={'small'} onClick={() => setOpenEditTitle(true)} disabled={onChange === undefined}>
                <EditIcon />
            </IconButton>
            <OverflowableText text={name} sx={styles.nodeNameTitle} />

            <Select
                labelId="root-network-label"
                defaultValue={currentRootNetworkUuid || ''}
                value={selectedRootNetworkUuid}
                onChange={handleRootNetworkChange}
                size="small"
                displayEmpty
                renderValue={(selected) => {
                    // Find the selected network object
                    const selectedNetwork = rootNetworks.find((option) => option.rootNetworkUuid === selected);
                    if (!selectedNetwork) {
                        return '';
                    }
                    return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <VisibilityIcon fontSize="small" color="primary" />
                            <FormattedMessage id="visibleRootNetwork" />
                            {selectedNetwork.tag}
                        </span>
                    );
                }}
            >
                {rootNetworks.map((option) => (
                    <MenuItem key={option.rootNetworkUuid} value={option.rootNetworkUuid}>
                        {option.name}
                    </MenuItem>
                ))}
            </Select>

            <IconButton size={'small'} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <AskTextDialog
                show={openEditTitle}
                title={intl.formatMessage({ id: 'NewName' })}
                value={name}
                onValidate={(e) => {
                    onChange?.(e);
                }}
                onClose={() => setOpenEditTitle(false)}
            />
        </Box>
    );
};
