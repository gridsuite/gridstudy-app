/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import LabelledButton, { LabelledButtonProps } from './labelled-button';
import React from 'react';

export type CloseButtonProps = Omit<LabelledButtonProps, 'callback' | 'label'> & {
    hideParameters: LabelledButtonProps['callback'];
};

export default function CloseButton({ hideParameters, ...props }: Readonly<CloseButtonProps>) {
    return <LabelledButton callback={hideParameters} label={'close'} {...props} />;
}
