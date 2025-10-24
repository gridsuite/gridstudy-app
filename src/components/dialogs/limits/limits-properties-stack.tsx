/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Avatar, Stack } from '@mui/material';
import { LimitsProperty } from '../../../services/network-modification-types';
import { LimitsTagChip } from './limits-tag-chip';
import { useWatch } from 'react-hook-form';

const MAX_PROPERTIES_TO_RENDER: number = 2;

export interface LimitsPropertiesStackProps {
    fieldName: string;
}

function getLimitsPropertiesToRender(limitsProperties: LimitsProperty[]) {
    return limitsProperties.length < MAX_PROPERTIES_TO_RENDER ? limitsProperties : limitsProperties?.slice(0, 2);
}

export function LimitsPropertiesStack({ fieldName, ...props }: Readonly<LimitsPropertiesStackProps>) {
    const limitsProperties: LimitsProperty[] | undefined = useWatch({ name: fieldName });
    const propertiesToRender: LimitsProperty[] = getLimitsPropertiesToRender(limitsProperties ?? []);

    return (
        <Stack direction="row" {...props}>
            {propertiesToRender.map((property: LimitsProperty) => (
                <LimitsTagChip key={`${property.name}`} limitsProperty={property} />
            ))}
            {limitsProperties && propertiesToRender.length !== limitsProperties.length ? (
                <Avatar>{`+${limitsProperties.length - propertiesToRender.length}`}</Avatar>
            ) : (
                ''
            )}
        </Stack>
    );
}
