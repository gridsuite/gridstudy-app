/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ICellRendererParams } from 'ag-grid-community';
import { EditNoteIcon, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import React, { SetStateAction, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useIsAnyNodeBuilding } from '../../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import IconButton from '@mui/material/IconButton';

export interface DescriptionRendererProps extends ICellRendererParams<NetworkModificationMetadata> {
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
}

const DescriptionRenderer = (props: DescriptionRendererProps) => {
    const { data, api, setModifications } = props;
    const [isLoading, setIsLoading] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);

    const description: string | undefined = data?.description;

    const modifyDescription = () => {};

    return (
        <Tooltip title={description} arrow>
            <IconButton
                color="primary"
                onClick={modifyDescription}
                disabled={isLoading || isAnyNodeBuilding || mapDataLoading}
            >
                <EditNoteIcon empty={description === undefined || description === ''} />
            </IconButton>
        </Tooltip>
    );
};

export default DescriptionRenderer;
