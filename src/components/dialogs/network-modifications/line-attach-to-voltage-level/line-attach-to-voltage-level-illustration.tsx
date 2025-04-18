/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LineSplitDiagram from '../../../../images/network-modifications/illustrations/line-attach-to-voltage-level.svg?react';
import GenericIllustrationNetworkModification from 'components/dialogs/illustrations/generic-Illustration-network-modification';

const replacedTexts = [
    {
        eltId: 'line-attach-illu-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-attach-illu-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-attach-illu-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-attach-illu-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-to-attach-to-illu-txt',
        tradId: 'LineToAttachTo',
    },
    {
        eltId: 'line-attach-illu-line1-right-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'line-attach-illu-line2-right-txt',
        tradId: 'Line2',
    },
    {
        eltId: 'attached-line-illu-txt',
        tradId: 'AttachedLine',
    },
    {
        eltId: 'attachment-point-illu-txt',
        tradId: 'AttachmentPoint',
    },
    {
        eltId: 'attached-voltage-level-illu-txt',
        tradId: 'AttachedVoltageLevelId',
    },
];

const LineAttachToVoltageLevelIllustration: React.FC = () => (
    <GenericIllustrationNetworkModification
        svgComponent={LineSplitDiagram}
        replacedTexts={replacedTexts}
        backgroundElementId="line-attach-illu-background"
    />
);
export default LineAttachToVoltageLevelIllustration;
