import React, { FC } from 'react';

interface TitleProps {
    title: string;
}

const Title: FC<TitleProps> = ({ title }) => {
    return (
        <>
            <h2>test h2</h2>
            <h1>{title}</h1>
        </>
    );
};

export default Title;
