import React, {useState} from 'react';

export interface PopoverContextType {
    onShow: () => void;
    onHide: () => void;
}

export const PopoverContext = React.createContext<PopoverContextType>({
    onShow: () => {},
    onHide: () => {},
});

export function usePopoverHover() {
    const [isPopoverHovered, setIsPopoverHovered] = useState(false);

    const onShow = () => setIsPopoverHovered(true);
    const onHide = () => setIsPopoverHovered(false);

    const contextValue = {onShow, onHide};

    return {isPopoverHovered, contextValue};
}
