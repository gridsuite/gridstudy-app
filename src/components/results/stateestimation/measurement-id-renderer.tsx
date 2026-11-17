/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ICellRendererParams } from 'ag-grid-community';
import { useWorkspacePanelActions } from '../../workspace/hooks/use-workspace-panel-actions';
import { useCallback } from 'react';
import { PanelType } from '../../workspace/types/workspace.types';
import Button from '@mui/material/Button';
import { OverflowableText } from '@gridsuite/commons-ui';
import { resultsStyles } from '../common/utils';
import { MeasurementInformationResult } from './state-estimation-result.type';

export const MeasurementIdRenderer = ({ value, data }: ICellRendererParams<MeasurementInformationResult>) => {
    const { openSLD } = useWorkspacePanelActions();
    const locationId = data?.locationId;
    const onClick = useCallback(
        () => locationId && openSLD({ equipmentId: locationId, panelType: PanelType.SLD_VOLTAGE_LEVEL }),
        [openSLD, locationId]
    );

    if (!value) {
        return null;
    }
    if (!locationId) {
        return <OverflowableText text={value} />;
    }
    return (
        <Button sx={resultsStyles.sldLink} onClick={onClick}>
            <OverflowableText text={value} />
        </Button>
    );
};
