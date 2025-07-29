/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NAME, PREDEFINED, SELECTED } from 'components/utils/field-constants';
import { CheckboxInput, TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';
import { useWatch } from 'react-hook-form';
import { italicFontTextField } from '../../../dialog-utils';

type PropertyFormProps = {
    name: string;
    index: string;
};

const PropertyForm = ({ name, index }: PropertyFormProps) => {
    const nameField = <TextInput name={`${name}.${index}.${NAME}`} label={'PropertyName'} />;
    const nameReadOnlyField = (
        <TextInput
            name={`${name}.${index}.${NAME}`}
            label={'PropertyName'}
            formProps={{ disabled: true, ...italicFontTextField }}
        />
    );
    const selectionField = <CheckboxInput name={`${name}.${index}.${SELECTED}`} />;

    const watchPredefined = useWatch({
        name: `${name}.${index}.${PREDEFINED}`,
    });

    function renderPropertyLine() {
        return (
            <>
                {watchPredefined ? (
                    <GridItem size={10}>{nameReadOnlyField}</GridItem>
                ) : (
                    <GridItem size={10}>{nameField}</GridItem>
                )}
                <GridItem size={1}>{selectionField}</GridItem>
            </>
        );
    }

    return renderPropertyLine();
};

export default PropertyForm;
