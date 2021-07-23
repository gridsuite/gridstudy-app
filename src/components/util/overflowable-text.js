import React, { useCallback, useEffect, useState } from 'react';
import { Tooltip } from '@material-ui/core';
import PropTypes from 'prop-types';

export const OverflowableText = ({ text, children, childRef }) => {
    const element = childRef;
    const [overflowed, setOverflowed] = useState(false);

    const checkOverflow = useCallback(() => {
        if (!element.current) return;
        setOverflowed(
            element.current.scrollWidth > element.current.clientWidth
        );
    }, [setOverflowed, element]);

    useEffect(() => {
        checkOverflow();
    }, [checkOverflow]);

    useEffect(() => {
        if (element.current != null) {
            const ref = element.current;
            const resetOverflow = () => {
                setOverflowed(ref.scrollWidth > ref.clientWidth);
            };
            window.addEventListener('resize', resetOverflow);
            return () => {
                window.removeEventListener('resize', resetOverflow);
            };
        }
    }, [element, setOverflowed]);

    return (
        <Tooltip title={text || ''} disableHoverListener={!overflowed}>
            {children}
        </Tooltip>
    );
};

OverflowableText.propTypes = {
    childRef: PropTypes.object,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
