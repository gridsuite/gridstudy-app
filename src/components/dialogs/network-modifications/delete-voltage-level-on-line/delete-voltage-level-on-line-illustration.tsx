/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import GenericIllustrationNetworkModification from 'components/dialogs/illustrations/generic-Illustration-network-modification';
import DeleteAttachingLine from '../../../../images/network-modifications/illustrations/delete-voltage-level-on-line.svg?react';

const replacedTexts = [
    {
        eltId: 'delete-voltage-level-on-line-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'delete-voltage-level-on-line-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'delete-voltage-level-to-split-at-left-txt',
        tradId: 'VoltageLevelToSplitAt',
    },
    {
        eltId: 'delete-voltage-level-on-line-line1-left-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'delete-voltage-level-on-line-line2-left-txt',
        tradId: 'Line2',
    },
    {
        eltId: 'delete-voltage-level-on-line-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'delete-voltage-level-on-line-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'delete-voltage-level-on-line-replacing-line-right-txt',
        tradId: 'ReplacingLine',
    },
];

const DeleteVoltageLevelOnLineIllustration: FunctionComponent = () => {
    return (
        <GenericIllustrationNetworkModification
            svgComponent={DeleteAttachingLine}
            replacedTexts={replacedTexts}
            backgroundElementId="delete-voltage-level-on-line-illu-background"
        />
    );
};

export default DeleteVoltageLevelOnLineIllustration;
