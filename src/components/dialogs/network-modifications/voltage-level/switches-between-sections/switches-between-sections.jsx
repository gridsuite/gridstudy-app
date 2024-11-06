/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton } from '@mui/material';
import { TextInput } from '@gridsuite/commons-ui';
import { SECTION_COUNT, SWITCHES_BETWEEN_SECTIONS, SWITCH_KINDS, SWITCH_KIND } from 'components/utils/field-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CreateSwitchesDialog } from './create-switches-between-sections/create-switches-dialog';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GridItem from '../../../commons/grid-item';

export const SwitchesBetweenSections = () => {
    const { getValues, setValue } = useFormContext();
    const [openCreateSwitchesDialog, setOpenCreateSwitchesDialog] = useState(false);

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
    const setSwitchesKinds = useCallback(
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

    const handleCreateSwitchesDialog = useCallback(
        (data) => {
            setSwitchesKinds(data);
        },
        [setSwitchesKinds]
    );

    const sectionCountRef = useRef(watchSectionCount);
    const switchesBetweenSectionsRef = useRef(watchSwitchesBetweenSections);
    useEffect(() => {
        // If the user changes the section count, we reset the switches between sections
        if (
            sectionCountRef.current !== watchSectionCount &&
            switchesBetweenSectionsRef.current === watchSwitchesBetweenSections
        ) {
            const initialKindDisconnector = { switchKind: 'DISCONNECTOR' };
            let list = [];
            if (watchSectionCount >= 1) {
                list = Array(watchSectionCount - 1).fill(initialKindDisconnector);
            }
            const data = { switchKinds: list };
            setSwitchesKinds(data);
        }
        sectionCountRef.current = watchSectionCount;
        switchesBetweenSectionsRef.current = watchSwitchesBetweenSections;
    }, [watchSectionCount, watchSwitchesBetweenSections, setSwitchesKinds]);

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

    if (isNaN(watchSectionCount) || watchSectionCount <= 1) {
        return <></>;
    } else {
        return (
            <>
                <GridItem size={4}>{switchesBetweenSectionsField}</GridItem>
                {openCreateSwitchesDialog && (
                    <CreateSwitchesDialog
                        openCreateSwitchesDialog={openCreateSwitchesDialog}
                        setOpenCreateSwitchesDialog={setOpenCreateSwitchesDialog}
                        handleCreateSwitchesDialog={handleCreateSwitchesDialog}
                        sectionCount={getValues(SECTION_COUNT)}
                        switchKinds={getValues(SWITCH_KINDS)}
                    />
                )}
            </>
        );
    }
};
