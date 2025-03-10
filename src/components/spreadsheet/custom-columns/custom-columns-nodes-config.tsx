/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { useStateBoolean } from '@gridsuite/commons-ui';
import CustomColumnNodesDialog from './custom-columns-nodes-dialog';
import BuildIcon from '@mui/icons-material/Build';
import { spreadsheetStyles } from '../utils/style';
import { NodeAlias } from './node-alias.type';

const styles = {
    icon: {
        height: '20px',
        width: '20px',
    },
};

type CustomColumnsNodesConfigProps = {
    disabled?: boolean;
    nodeAliases: NodeAlias[];
    setNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

export default function CustomColumnsNodesConfig({
    disabled,
    nodeAliases,
    setNodeAliases,
}: Readonly<CustomColumnsNodesConfigProps>) {
    const dialogOpen = useStateBoolean(false);

    return (
        <>
            <Button
                sx={spreadsheetStyles.spreadsheetButton}
                size={'small'}
                onClick={dialogOpen.setTrue}
                disabled={disabled}
            >
                <BuildIcon sx={styles.icon} />
                <FormattedMessage id="spreadsheet/custom_column/nodes" />
            </Button>

            <CustomColumnNodesDialog open={dialogOpen} nodeAliases={nodeAliases} setNodeAliases={setNodeAliases} />
        </>
    );
}
