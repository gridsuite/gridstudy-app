/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LineSplitDiagram from '../../../../images/network-modifications/illustrations/lines-attach-to-split-lines.svg?react';
import GenericIllustrationNetworkModification from 'components/dialogs/illustrations/generic-Illustration-network-modification';

const replacedTexts = [
    {
        eltId: 'lines-attach-illu-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'lines-attach-illu-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'lines-attach-illu-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'lines-attach-illu-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'lines-attach-illu-attachment-point-txt',
        tradId: 'AttachmentPoint',
    },
    {
        eltId: 'lines-attach-illu-line1-left-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'lines-attach-illu-line1-right-txt',
        tradId: 'ReplacingLine1',
    },
    {
        eltId: 'lines-attach-illu-line2-left-txt',
        tradId: 'Line2',
    },
    {
        eltId: 'lines-attach-illu-line2-right-txt',
        tradId: 'ReplacingLine2',
    },
    {
        eltId: 'lines-attach-illu-voltage-level-to-split-at-right-txt',
        tradId: 'VoltageLevelToSplitAt',
    },
    {
        eltId: 'lines-attach-illu-attached-voltage-level-left-txt',
        tradId: 'AttachedVoltageLevelId',
    },
    {
        eltId: 'lines-attach-illu-attached-line-txt',
        tradId: 'AttachedLine',
    },
];

const LineAttachToSplitLinesIllustration: React.FC = () => (
    <GenericIllustrationNetworkModification
        svgComponent={LineSplitDiagram}
        replacedTexts={replacedTexts}
        backgroundElementId="line-split-illu-background"
    />
);
export default LineAttachToSplitLinesIllustration;
