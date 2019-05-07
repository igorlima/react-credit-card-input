// @flow

import { useEffect, useRef } from 'react';
import payment from 'payment';
import {
  formatCvc,
  hasCVCReachedMaxLength,
  isHighlighted
} from '../utils/formatter';
import checkIsNumeric from '../utils/check-is-numeric';
import handleKeyDown from '../utils/handle-key-down';
import { CHANGE_ERROR_TEXT } from '../reducer/actions';

type CardCVCInputProps = {
  cardCVCInputProps: Object,
  dispatch: Function,
  state: Object
};

const defaultProps: CardCVCInputProps = {
  cardCVCInputProps: {}
};

const useCardCVCInput = (props: CardCVCInputProps = defaultProps) => {
  const cvcField = useRef(null);
  const { cardCVCInputProps, dispatch, state } = props;
  const {
    cardNumber,
    customTextLabels,
    enableZipInput,
    events,
    inputClassName,
    showZip
  } = state;

  useEffect(() => {
    const subscription = events.subscribe(
      events.types.FOCUS_ON_CARD_CVC,
      () => {
        cvcField.current.focus();
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const setFieldInvalid = (errorText: string) => {
    const { onError } = cardCVCInputProps;
    dispatch({ type: CHANGE_ERROR_TEXT, errorText });
    if (onError) {
      onError({ error: errorText });
    }
  };

  const setFieldValid = () => {
    dispatch({ type: CHANGE_ERROR_TEXT, errorText: null });
  };

  const handleCardCVCBlur = (
    { onBlur }: { onBlur?: ?Function } = { onBlur: null }
  ) => (e: SyntheticInputEvent<*>) => {
    if (!payment.fns.validateCardCVC(e.target.value)) {
      setFieldInvalid(customTextLabels.invalidCvc || 'CVC is invalid');
    }
    cardCVCInputProps.onBlur && cardCVCInputProps.onBlur(e);
    onBlur && onBlur(e);
  };

  const handleCardCVCChange = (
    { onChange }: { onChange?: ?Function } = { onChange: null }
  ) => (e: SyntheticInputEvent<*>) => {
    const value = formatCvc(e.target.value);
    cvcField.current.value = value;
    const CVC = value;
    const CVCLength = CVC.length;
    const isZipFieldAvailable = enableZipInput && showZip;
    const cardType = payment.fns.cardType(cardNumber);

    setFieldValid();
    if (CVCLength >= 4) {
      if (!payment.fns.validateCardCVC(CVC, cardType)) {
        setFieldInvalid(customTextLabels.invalidCvc || 'CVC is invalid');
      }
    }

    if (isZipFieldAvailable && hasCVCReachedMaxLength(cardType, CVCLength)) {
      events.publish(events.types.FOCUS_ON_CARD_ZIP);
    }

    cardCVCInputProps.onChange && cardCVCInputProps.onChange(e);
    onChange && onChange(e);
  };

  const handleCardCVCKeyPress = (e: any) => {
    const cardType = payment.fns.cardType(cardNumber);
    const value = e.target.value;
    checkIsNumeric(e);
    if (value && !isHighlighted()) {
      const valueLength = value.split(' / ').join('').length;
      if (hasCVCReachedMaxLength(cardType, valueLength)) {
        e.preventDefault();
      }
    }
  };

  return {
    id: 'cvc',
    ref: cvcField,
    maxLength: '5',
    autoComplete: 'off',
    className: `credit-card-input ${inputClassName}`,
    placeholder: customTextLabels.cvcPlaceholder || 'CVC',
    type: 'tel',
    ...cardCVCInputProps,
    onBlur: handleCardCVCBlur(),
    onChange: handleCardCVCChange(),
    onKeyDown: handleKeyDown(() => {
      events.publish(events.types.FOCUS_ON_CARD_EXPIRY);
    }),
    onKeyPress: handleCardCVCKeyPress
  };
};

export default useCardCVCInput;
