/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ExpandingTextField, type ExpandingTextFieldProps, type SxStyle } from '@gridsuite/commons-ui';

const styles = {
    flexGrow: 1,
} as const satisfies SxStyle;

export default function FormulaEditor({ name }: Readonly<ExpandingTextFieldProps>) {
    return <ExpandingTextField name={name} label="" minRows={3} rows={3} sx={styles} />;
}
