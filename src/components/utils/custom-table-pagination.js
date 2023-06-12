/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { TablePagination } from '@mui/material';

const CustomTablePagination = (props) => {
    const intl = useIntl();
    const tablePaginationRef = useRef(null);

    const customLabelDisplayedRows = ({ from, to, count }) => {
        return `${from}-${to} ${intl.formatMessage({
            id: 'muiTablePaginationOfLabel',
        })} ${count}`;
    };

    const customLabelRowsPerPage = intl.formatMessage({
        id: 'muiTablePaginationLabelRowsPerPage',
    });

    const customLabelNextPage = intl.formatMessage({
        id: 'muiTablePaginationNext',
    });

    const customLabelPreviousPage = intl.formatMessage({
        id: 'muiTablePaginationPrevious',
    });

    const customLabelFirstPage = intl.formatMessage({
        id: 'muiTablePaginationFirst',
    });

    const customLabelLastPage = intl.formatMessage({
        id: 'muiTablePaginationLast',
    });

    useEffect(() => {
        const { current } = tablePaginationRef || {};
        if (current) {
            const buttons =
                current.querySelectorAll('.MuiButtonBase-root') || [];
            const firstButton = buttons[0];
            const lastButton = buttons[buttons.length - 1];

            firstButton?.setAttribute('aria-label', customLabelFirstPage);
            firstButton?.setAttribute('title', customLabelFirstPage);

            lastButton?.setAttribute('aria-label', customLabelLastPage);
            lastButton?.setAttribute('title', customLabelLastPage);
        }
    }, [customLabelFirstPage, customLabelLastPage, tablePaginationRef]);

    return (
        <TablePagination
            ref={tablePaginationRef}
            component="div"
            showFirstButton={true}
            showLastButton={true}
            labelDisplayedRows={customLabelDisplayedRows}
            labelRowsPerPage={customLabelRowsPerPage}
            nextIconButtonProps={{
                'aria-label': customLabelNextPage,
                title: customLabelNextPage,
            }}
            backIconButtonProps={{
                'aria-label': customLabelPreviousPage,
                title: customLabelPreviousPage,
            }}
            {...props}
        >
            {props.children}
        </TablePagination>
    );
};

CustomTablePagination.propTypes = {
    children: PropTypes.node,
};

export default CustomTablePagination;
