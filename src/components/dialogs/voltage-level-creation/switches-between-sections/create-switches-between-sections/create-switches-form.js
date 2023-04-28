/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DialogContent, DialogTitle, Grid } from '@mui/material';
import { SWITCH_TYPE } from 'components/network/constants';
import EnumInput from 'components/utils/rhf-inputs/enum-input';
import { SWITCH_KIND } from 'components/utils/field-constants';
import { useFieldArray } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const CreateSwitchesForm = ({ id }) => {
    const { fields: rows } = useFieldArray({ name: `${id}` });
    return (
        <>
            <DialogTitle>
                <FormattedMessage id="SwitchesBetweenSections" />
            </DialogTitle>
            <DialogContent>
                <Grid
                    container
                    spacing={2}
                    direction={'column'}
                    style={{
                        paddingTop: '5px',
                    }}
                >
                    {rows.map((value, index) => {
                        return (
                            <Grid container item key={value.id}>
                                <EnumInput
                                    options={Object.values(SWITCH_TYPE)}
                                    name={`${id}.${index}.${SWITCH_KIND}`}
                                    label={'SwitchBetweenSectionsLabel'}
                                    labelValues={{
                                        index1: index + 1,
                                        index2: index + 2,
                                    }}
                                    size={'small'}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>
        </>
    );
};

export default CreateSwitchesForm;
