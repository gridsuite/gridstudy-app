/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NAME, SELECTED } from 'components/utils/field-constants';
import { CheckboxInput, TextInput } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';

type PropertyFormProps = {
    name: string;
    index: string;
};

const PropertyForm = ({ name, index }: PropertyFormProps) => {
    const nameField = <TextInput name={`${name}.${index}.${NAME}`} label={'PropertyName'} />;
    const selectionField = <CheckboxInput name={`${name}.${index}.${SELECTED}`} />;

    function renderPropertyLine() {
        return (
            <>
                <GridItem size={6}>{nameField}</GridItem>
                <GridItem size={1}>{selectionField}</GridItem>
            </>
        );
    }

    return renderPropertyLine();
};

export default PropertyForm;
