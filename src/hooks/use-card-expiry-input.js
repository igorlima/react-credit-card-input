// @flow

import { useEffect, useRef } from 'react';
import { CHANGE_ERROR_TEXT } from '../reducer/actions';
import { formatExpiry, isHighlighted } from '../utils/formatter';
import isExpiryInvalid from '../utils/is-expiry-invalid';
import checkIsNumeric from '../utils/check-is-numeric';
import handleKeyDown from '../utils/handle-key-down';
import isMonthDashKey from '../utils/is-month-dash-key';

type CardExpiryInputProps = {
  cardExpiryInputProps: Object,
  dispatch: Function,
  state: Object
};

const defaultProps: CardExpiryInputProps = {
  cardExpiryInputProps: {}
};

const useCardExpiryInput = (props: CardExpiryInputProps = defaultProps) => {
  const cardExpiryField = useRef(null);
  const { cardExpiryInputProps, dispatch, state } = props;
  const { customTextLabels, events, inputClassName } = state;

  useEffect(() => {
    const subscription = events.subscribe(
      events.types.FOCUS_ON_CARD_EXPIRY,
      () => {
        cardExpiryField.current.focus();
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const setFieldInvalid = (errorText: string) => {
    const { onError } = cardExpiryInputProps;
    dispatch({ type: CHANGE_ERROR_TEXT, errorText });
    if (onError) {
      onError({ error: errorText });
    }
  };

  const setFieldValid = () => {
    dispatch({ type: CHANGE_ERROR_TEXT, errorText: null });
  };

  const handleCardExpiryBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const cardExpiry = e.target.value.split(' / ').join('/');
    const expiryError = isExpiryInvalid(
      cardExpiry,
      customTextLabels.expiryError
    );
    if (expiryError) {
      setFieldInvalid(expiryError);
    }

    cardExpiryInputProps.onBlur && cardExpiryInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  const handleCardExpiryChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    cardExpiryField.current.value = formatExpiry(e);
    const value = cardExpiryField.current.value.split(' / ').join('/');

    setFieldValid();

    const expiryError = isExpiryInvalid(value, customTextLabels.expiryError);
    if (value.length > 4) {
      if (expiryError) {
        setFieldInvalid(expiryError);
      } else {
        events.publish(events.types.FOCUS_ON_CARD_CVC);
      }
    }

    cardExpiryInputProps.onChange && cardExpiryInputProps.onChange(e);
    onChange && onChange(e);
  };

  const handleCardExpiryKeyPress = (e: any) => {
    const value = e.target.value;

    if (!isMonthDashKey(e)) {
      checkIsNumeric(e);
    }

    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (valueLength >= 4) {
        e.preventDefault();
      }
    }
  };

  return {
    id: 'card-expiry',
    ref: cardExpiryField,
    autoComplete: 'cc-exp',
    className: `credit-card-input ${inputClassName}`,
    placeholder: customTextLabels.expiryPlaceholder || 'MM/YY',
    type: 'tel',
    ...cardExpiryInputProps,
    onBlur: handleCardExpiryBlur(),
    onChange: handleCardExpiryChange(),
    onKeyDown: handleKeyDown(() => {
      events.publish(events.types.FOCUS_ON_CARD_NUMBER);
    }),
    onKeyPress: handleCardExpiryKeyPress
  };
};

export default useCardExpiryInput;
