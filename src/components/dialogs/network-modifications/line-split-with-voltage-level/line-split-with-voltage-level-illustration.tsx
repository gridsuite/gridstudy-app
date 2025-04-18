/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LineSplitDiagram from '../../../../images/network-modifications/illustrations/line-split-with-voltage-level.svg?react';
import GenericIllustrationNetworkModification from 'components/dialogs/illustrations/generic-Illustration-network-modification';

const replacedTexts = [
    {
        eltId: 'line-split-illu-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-split-illu-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-split-illu-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-split-illu-voltage-level-to-split-at-right-txt',
        tradId: 'VoltageLevelToSplitAt',
    },
    {
        eltId: 'line-split-illu-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-split-illu-line-to-split-left-txt',
        tradId: 'LineToSplit',
    },
    {
        eltId: 'line-split-illu-line1-right-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'line-split-illu-line2-right-txt',
        tradId: 'Line2',
    },
];

const LineSplitWithVoltageLevelIllustration: React.FC = () => (
    <GenericIllustrationNetworkModification
        svgComponent={LineSplitDiagram}
        replacedTexts={replacedTexts}
        backgroundElementId="line-split-illu-background"
    />
);
export default LineSplitWithVoltageLevelIllustration;
