/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    DirectoryItemsInput,
    ElementType,
    EquipmentType,
} from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { styles } from '../parameters';

type DirectoryItemsInputLineProps = {
    label: string;
    name: string;
    equipmentTypes: EquipmentType[];
    elementType: ElementType;
    hideErrorMessage: boolean;
};

const ParameterLineDirectoryItemsInput = ({
    label,
    name,
    equipmentTypes,
    elementType,
    hideErrorMessage,
}: DirectoryItemsInputLineProps) => {
    return (
        <Grid item container spacing={1} padding={1}>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item xs={4} sx={styles.controlItem}>
                <DirectoryItemsInput
                    name={name}
                    equipmentTypes={equipmentTypes}
                    elementType={elementType}
                    titleId={label}
                    hideErrorMessage={hideErrorMessage}
                    label={undefined}
                    itemFilter={undefined}
                />
            </Grid>
        </Grid>
    );
};

export default ParameterLineDirectoryItemsInput;
