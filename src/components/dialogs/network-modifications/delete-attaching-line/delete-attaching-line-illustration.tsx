/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FC } from 'react';
import GenericIllustrationNetworkModification from 'components/dialogs/illustrations/generic-Illustration-network-modification';
import DeleteAttachingLine from '../../../../images/network-modifications/illustrations/delete-attaching-line-illustration.svg?react';

const replacedTexts = [
    {
        eltId: 'delete-attach-line-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'delete-attach-line-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'delete-attach-line-attachment-point1-left-txt',
        tradId: 'AttachmentPoint',
    },
    {
        eltId: 'delete-attach-line-line1-left-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'delete-attach-line-line2-left-txt',
        tradId: 'Line2',
    },
    {
        eltId: 'delete-attach-attached-line-left-txt',
        tradId: 'LineAttached',
    },
    {
        eltId: 'delete-attach-attached-voltage-level-left-txt',
        tradId: 'AttachedVoltageLevelId',
    },
    {
        eltId: 'delete-attach-line-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'delete-attach-line-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'delete-attach-line-replacing-line-right-txt',
        tradId: 'ReplacingLine',
    },
];

const DeleteAttachingLineIllustration: FC = () => {
    return (
        <GenericIllustrationNetworkModification
            svgComponent={DeleteAttachingLine}
            replacedTexts={replacedTexts}
            backgroundElementId="delete-attach-line-illu-background"
        />
    );
};

export default DeleteAttachingLineIllustration;
