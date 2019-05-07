// @flow

const BACKSPACE_KEY_CODE = 8;

const handleKeyDown = (callback: Function) => {
  return (e: SyntheticInputEvent<*>) => {
    if (e.keyCode === BACKSPACE_KEY_CODE && !e.target.value) {
      callback && callback();
    }
  };
};

export default handleKeyDown;
