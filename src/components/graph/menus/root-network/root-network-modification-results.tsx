/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { useModificationLabelComputer } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { Modification } from './root-network.types';
import { Typography } from '@mui/material';

interface ModificationResultsProps {
    modifications: Modification[];
}

export const ModificationResults: React.FC<ModificationResultsProps> = ({ modifications }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const getModificationLabel = useCallback(
        (modification?: Modification): React.ReactNode => {
            if (!modification) {
                return '';
            }

            return intl.formatMessage(
                { id: 'network_modifications.' + modification.messageType },
                {
                    // @ts-ignore
                    ...computeLabel(modification),
                }
            );
        },
        [computeLabel, intl]
    );
    return (
        <>
            {modifications.map((modification) => (
                <Typography key={modification.impactedEquipmentId + modification.modificationUuid} variant="body2">
                    <strong>{modification.impactedEquipmentId + ' - '}</strong> {getModificationLabel(modification)}
                </Typography>
            ))}
        </>
    );
};
