import { FLASH_MESSAGE, CLEAR_CURRENT_FLASH_MESSAGE } from "./types";

export const sendFlashMessage = (message, className) => {
  return {
    type: FLASH_MESSAGE,
    payload: {
      message,
      className
    }
  };
};

export const clearcurrentFlashMessage = () => {
  return {
    type: CLEAR_CURRENT_FLASH_MESSAGE
  };
};
