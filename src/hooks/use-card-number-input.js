// @flow

import { useEffect, useRef } from 'react';
import payment from 'payment';
import creditCardType from 'credit-card-type';
import checkIsNumeric from '../utils/check-is-numeric';
import {
  formatCardNumber,
  hasCardNumberReachedMaxLength,
  isHighlighted
} from '../utils/formatter';
import {
  CHANGE_CARD_IMAGE,
  CHANGE_CARD_NUMBER,
  CHANGE_ERROR_TEXT,
  SHOW_ZIP
} from '../reducer/actions';

type CardNumberInputProps = {
  cardNumberInputProps: Object,
  dispatch: Function,
  state: Object
};

const defaultProps: CardNumberInputProps = {
  cardNumberInputProps: {}
};

const useCardNumberInput = (props: CardNumberInputProps = defaultProps) => {
  const cardNumberField = useRef(null);
  const { cardNumberInputProps, dispatch, state } = props;
  const {
    cardTypes: CARD_TYPES,
    customTextLabels,
    enableZipInput,
    events,
    images,
    inputClassName
  } = state;

  useEffect(() => {
    const subscription = events.subscribe(
      events.types.FOCUS_ON_CARD_NUMBER,
      () => {
        cardNumberField.current.focus();
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const setFieldInvalid = (errorText: string) => {
    const { onError } = cardNumberInputProps;
    dispatch({ type: CHANGE_ERROR_TEXT, errorText });
    if (onError) {
      onError({ error: errorText });
    }
  };

  const setFieldValid = () => {
    dispatch({ type: CHANGE_ERROR_TEXT, errorText: null });
  };

  const handleCardNumberBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    if (!payment.fns.validateCardNumber(e.target.value)) {
      setFieldInvalid(
        customTextLabels.invalidCardNumber || 'Card number is invalid'
      );
    }

    cardNumberInputProps.onBlur && cardNumberInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  const handleCardNumberChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const cardNumber = e.target.value;
    const cardNumberLength = cardNumber.split(' ').join('').length;
    const cardType = payment.fns.cardType(cardNumber);
    const cardTypeInfo =
      creditCardType.getTypeInfo(creditCardType.types[CARD_TYPES[cardType]]) ||
      {};
    const cardTypeLengths = cardTypeInfo.lengths || [16];

    cardNumberField.current.value = formatCardNumber(cardNumber);

    dispatch({
      type: CHANGE_CARD_IMAGE,
      cardImage: images[cardType] || images.placeholder
    });
    dispatch({
      type: CHANGE_CARD_NUMBER,
      cardNumber
    });

    if (enableZipInput) {
      dispatch({
        type: SHOW_ZIP,
        showZip: cardNumberLength >= 6
      });
    }

    setFieldValid();
    if (cardTypeLengths) {
      const lastCardTypeLength = cardTypeLengths[cardTypeLengths.length - 1];
      for (let length of cardTypeLengths) {
        if (
          length === cardNumberLength &&
          payment.fns.validateCardNumber(cardNumber)
        ) {
          events.publish(events.types.FOCUS_ON_CARD_EXPIRY);
          break;
        }
        if (cardNumberLength === lastCardTypeLength) {
          setFieldInvalid(
            customTextLabels.invalidCardNumber || 'Card number is invalid'
          );
        }
      }
    }

    cardNumberInputProps.onChange && cardNumberInputProps.onChange(e);
    onChange && onChange(e);
  };

  const handleCardNumberKeyPress = (e: any) => {
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' ').join('').length;
      if (hasCardNumberReachedMaxLength(value, valueLength)) {
        e.preventDefault();
      }
    }
  };

  return {
    id: 'card-number',
    ref: cardNumberField,
    maxLength: '19',
    autoComplete: 'cc-number',
    className: `credit-card-input ${inputClassName}`,
    placeholder: customTextLabels.cardNumberPlaceholder || 'Card number',
    type: 'tel',
    ...cardNumberInputProps,
    onBlur: handleCardNumberBlur(),
    onChange: handleCardNumberChange(),
    onKeyPress: handleCardNumberKeyPress
  };
};

export default useCardNumberInput;
