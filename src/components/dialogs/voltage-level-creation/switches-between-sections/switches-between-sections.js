/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton } from '@mui/material';
import { gridItem } from 'components/dialogs/dialogUtils';
import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    SECTION_COUNT,
    SWITCHES_BETWEEN_SECTIONS,
    SWITCH_KINDS,
    SWITCH_KIND,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CreateSwitchesDialog } from './create-switches-between-sections/create-switches-dialog';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const SwitchesBetweenSections = () => {
    const { getValues, setValue } = useFormContext();
    const [openCreateSwitchesDialog, setOpenCreateSwitchesDialog] =
        useState(false);

    const watchSectionCount = useWatch({ name: SECTION_COUNT });
    const watchSwitchesBetweenSections = useWatch({
        name: SWITCHES_BETWEEN_SECTIONS,
    });

    const addIconAdorment = useCallback((clickCallback) => {
        return (
            <IconButton onClick={clickCallback}>
                <ArrowDropDownIcon />
            </IconButton>
        );
    }, []);

    const handleClickOpenSwitchesPane = useCallback(() => {
        if (watchSectionCount > 1) {
            setOpenCreateSwitchesDialog(true);
        }
    }, [watchSectionCount]);

    const intl = useIntl();
    const handleCreateSwitchesDialog = useCallback(
        (data) => {
            const map = data[SWITCH_KINDS].map((switchData) => {
                return intl.formatMessage({ id: switchData[SWITCH_KIND] });
            });
            setValue(SWITCHES_BETWEEN_SECTIONS, map.join(' / '), {
                shouldValidate: true,
                shouldDirty: true,
            });
            setValue(SWITCH_KINDS, data[SWITCH_KINDS]);
        },
        [intl, setValue]
    );
    const sectionCountRef = useRef(watchSectionCount);
    const switchesBetweenSectionsRef = useRef(watchSwitchesBetweenSections);
    useEffect(() => {
        // If the user changes the section count, we reset the switches between sections
        if (
            sectionCountRef.current !== watchSectionCount &&
            switchesBetweenSectionsRef.current === watchSwitchesBetweenSections
        ) {
            setSwitchsValues();
        }
        sectionCountRef.current = watchSectionCount;
        switchesBetweenSectionsRef.current = watchSwitchesBetweenSections;
    }, [watchSectionCount, setValue, watchSwitchesBetweenSections]);

    const setSwitchsValues = () => {
        const initialKindDisconnector = { switchKind: 'DISCONNECTOR' };
        let list = [];
        if (watchSectionCount) {
            for (let i = 0; i < watchSectionCount - 1; i++) {
                list.push(initialKindDisconnector);
            }
        }
        let data = {};
        data[SWITCH_KINDS] = list;
        const map = data[SWITCH_KINDS].map((switchData) => {
            return intl.formatMessage({ id: switchData[SWITCH_KIND] });
        });
        setValue(SWITCHES_BETWEEN_SECTIONS, map.join(' / '));
        setValue(SWITCH_KINDS, data[SWITCH_KINDS]);
    };

    const switchesBetweenSectionsField = (
        <TextInput
            name={SWITCHES_BETWEEN_SECTIONS}
            label={'SwitchesBetweenSections'}
            formProps={{
                inputProps: { readOnly: true },
                multiline: true,
            }}
            customAdornment={addIconAdorment(handleClickOpenSwitchesPane)}
        >
            <></>
        </TextInput>
    );

    if (watchSectionCount <= 1) {
        return <></>;
    } else {
        return (
            <>
                {gridItem(switchesBetweenSectionsField, 4)}
                {openCreateSwitchesDialog && (
                    <CreateSwitchesDialog
                        openCreateSwitchesDialog={openCreateSwitchesDialog}
                        setOpenCreateSwitchesDialog={
                            setOpenCreateSwitchesDialog
                        }
                        handleCreateSwitchesDialog={handleCreateSwitchesDialog}
                        sectionCount={getValues(SECTION_COUNT)}
                        switchKinds={getValues(SWITCH_KINDS)}
                    />
                )}
            </>
        );
    }
};
