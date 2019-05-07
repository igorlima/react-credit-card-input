// @flow

import { useEffect, useReducer } from 'react';
import useCardNumberInput from './use-card-number-input';
import useCardExpiryInput from './use-card-expiry-input';
import useCardCvcInput from './use-card-cvc-input';
import useCardZipInput from './use-card-zip-input';
import { inititalState, reducer } from '../reducer';
import {
  CHANGE_CARD_TYPES,
  CHANGE_IMAGES,
  CHANGE_CUSTOM_TEXT_LABELS,
  CHANGE_INPUT_CLASS_NAME,
  ENABLE_ZIP_INPUT
} from '../reducer/actions';

type CreditCardInputProps = {
  cardTypes: Object,
  onError?: Function,
  cardExpiryInputProps: Object,
  cardNumberInputProps: Object,
  cardCVCInputProps: Object,
  cardZipInputProps: Object,
  images: Object,
  inputClassName: string,
  customTextLabels: Object
};

const defaultProps: CreditCardInputProps = {
  cardExpiryInputProps: {},
  cardNumberInputProps: {},
  cardCVCInputProps: {},
  cardZipInputProps: {},
  inputClassName: '',
  customTextLabels: {}
};

const useCreditCardInput = (props: CreditCardInputProps = defaultProps) => {
  const [state, dispatch] = useReducer(reducer, inititalState);

  const {
    cardCVCInputProps,
    cardZipInputProps,
    cardExpiryInputProps,
    cardNumberInputProps,
    onError
  } = props;

  const { errorText } = state;

  useEffect(() => {
    const {
      images,
      inputClassName,
      cardTypes,
      customTextLabels,
      enableZipInput
    } = props;
    dispatch({ type: CHANGE_CARD_TYPES, cardTypes });
    dispatch({ type: CHANGE_IMAGES, images });
    dispatch({ type: ENABLE_ZIP_INPUT, enableZipInput });
    dispatch({ type: CHANGE_CUSTOM_TEXT_LABELS, customTextLabels });
    dispatch({ type: CHANGE_INPUT_CLASS_NAME, inputClassName });
  }, []);

  const setFieldInvalid = (errorText: string) => {
    if (onError) {
      onError({ error: errorText });
    }
  };

  const setFieldValid = () => {};

  useEffect(() => {
    if (errorText) {
      setFieldInvalid(errorText);
    } else {
      setFieldValid();
    }
  }, [errorText]);

  return {
    cardNumberProps: useCardNumberInput({
      cardNumberInputProps,
      dispatch,
      state
    }),
    cardExpiryProps: useCardExpiryInput({
      cardExpiryInputProps,
      dispatch,
      state
    }),
    cardCvcProps: useCardCvcInput({ cardCVCInputProps, dispatch, state }),
    cardZipProps: useCardZipInput({ cardZipInputProps, dispatch, state }),
    state
  };
};

export default useCreditCardInput;
