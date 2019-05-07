// @flow

import { useEffect, useRef } from 'react';
import payment from 'payment';
import { hasZipReachedMaxLength, isHighlighted } from '../utils/formatter';
import isZipValid from '../utils/is-zip-valid';
import checkIsNumeric from '../utils/check-is-numeric';
import handleKeyDown from '../utils/handle-key-down';
import { CHANGE_ERROR_TEXT } from '../reducer/actions';

type CardZipInputProps = {
  cardZipInputProps: Object,
  dispatch: Function,
  state: Object
};

const defaultProps: CardZipInputProps = {
  cardZipInputProps: {}
};

const useCardZipInput = (props: CardZipInputProps = defaultProps) => {
  const zipField = useRef(null);
  const { cardZipInputProps, dispatch, state } = props;
  const { cardNumber, customTextLabels, events, inputClassName } = state;

  useEffect(() => {
    const subscription = events.subscribe(
      events.types.FOCUS_ON_CARD_ZIP,
      () => {
        zipField.current.focus();
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const setFieldInvalid = (errorText: string) => {
    const { onError } = cardZipInputProps;
    dispatch({ type: CHANGE_ERROR_TEXT, errorText });
    if (onError) {
      onError({ error: errorText });
    }
  };

  const setFieldValid = () => {
    dispatch({ type: CHANGE_ERROR_TEXT, errorText: null });
  };

  const handleCardZipBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    if (!isZipValid(e.target.value)) {
      setFieldInvalid(customTextLabels.invalidZipCode || 'Zip code is invalid');
    }

    cardZipInputProps.onBlur && cardZipInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  const handleCardZipChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const zip = e.target.value;
    const zipLength = zip.length;

    setFieldValid();

    if (zipLength >= 5 && !isZipValid(zip)) {
      setFieldInvalid(customTextLabels.invalidZipCode || 'Zip code is invalid');
    }

    cardZipInputProps.onChange && cardZipInputProps.onChange(e);
    onChange && onChange(e);
  };

  const handleCardZipKeyPress = (e: any) => {
    const cardType = payment.fns.cardType(cardNumber);
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasZipReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  return {
    id: 'zip',
    ref: zipField,
    maxLength: '6',
    className: `credit-card-input zip-input ${inputClassName}`,
    pattern: '[0-9]*',
    placeholder: customTextLabels.zipPlaceholder || 'Zip',
    type: 'text',
    ...cardZipInputProps,
    onBlur: handleCardZipBlur(),
    onChange: handleCardZipChange(),
    onKeyDown: handleKeyDown(() => {
      events.publish(events.types.FOCUS_ON_CARD_CVC);
    }),
    onKeyPress: handleCardZipKeyPress
  };
};

export default useCardZipInput;
