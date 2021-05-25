import React from 'react';
import PropTypes from 'prop-types';

import './togglelist.scss';
function ToggleButton({
    currentList,
    listTarget,
    newMessage,
    setCurrentList,
    text,
    width,
}) {
    return (
        <button className={"toggle" + (currentList === listTarget ? " active" : "")}
            onClick={() => {
                setCurrentList(listTarget);
            }}
            style={{
                width
            }}
        >
            <span>{text}</span>
            {
                newMessage > 0 &&
                <div className="new-message">
                    {newMessage}
                </div>
            }
        </button>
    );
}
export function ToggleList({
    className,
    currentList,
    setCurrentList,
    toggleButtons,
    width,
}) {
    const buttonWidth = (1 / toggleButtons.length).toFixed(2) * 100 + "%";
    return (
        <div className={"toggle-list" + (className ? " " + className : "")}
            style={{ width: width + 'px' }}
        >
            {
                toggleButtons.map((button, key) => (
                    <ToggleButton key={key}
                        currentList={currentList}
                        listTarget={button.target}
                        newMessage={button.newMessage}
                        setCurrentList={setCurrentList}
                        text={button.text}
                        width={buttonWidth}
                    />
                ))
            }
        </div>
    );
}
ToggleList.propTypes = {
    width: PropTypes.number.isRequired
};