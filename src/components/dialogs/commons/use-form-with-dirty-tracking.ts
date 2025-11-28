/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldValues, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';

export function useFormWithDirtyTracking<T extends FieldValues>(props: UseFormProps<T>): UseFormReturn<T> {
    const methods = useForm<T>(props);
    // Destructure isDirty to ensure React Hook Form tracks dirty state correctly even though the value is not used.
    // React Hook Form only tracks dirty fields when you explicitly subscribe to the form state.
    // Without this line, the keepDirty: true option in reset() will not work properly because
    // React Hook Form won't be tracking which fields are dirty. This is a consequence of
    // React Hook Form's performance optimization that only subscribes to form state
    // that is explicitly destructured/accessed in the component.
    const {
        formState: { isDirty },
    } = methods;
    return methods;
}
