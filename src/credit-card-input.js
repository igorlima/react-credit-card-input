// @flow

import React, { useEffect } from 'react';
import styled from 'styled-components';
import useCreditCardInput from './hooks/use-credit-card-input';

const Container = styled.div`
  display: inline-block;
  ${({ styled }) => ({ ...styled })};
`;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  background-color: white;
  padding: 10px;
  border-radius: 3px;
  overflow: hidden;
  ${({ styled }) => ({ ...styled })};

  &.is-invalid {
    border: 1px solid #ff3860;
    ${({ invalidStyled }) => ({ ...invalidStyled })};
  }
`;

const CardImage = styled.img`
  height: 1em;
  ${({ styled }) => ({ ...styled })};
`;

const InputWrapper = styled.label`
  align-items: center;
  display: ${props => (props.isActive ? 'flex' : 'none')};
  margin-left: 0.5em;
  position: relative;
  transition: transform 0.5s;
  transform: translateX(${props => (props.translateX ? '4rem' : '0')});

  &::after {
    content: attr(data-max);
    visibility: hidden;
    height: 0;
  }

  & .credit-card-input {
    border: 0px;
    position: absolute;
    width: 100%;
    font-size: 1em;
    ${({ inputStyled }) => ({ ...inputStyled })};

    &:focus {
      outline: 0px;
    }
  }

  & .zip-input {
    display: ${props => (props.isZipActive ? 'flex' : 'none')};
  }
`;

const DangerText = styled.p`
  font-size: 0.8rem;
  margin: 5px 0 0 0;
  color: #ff3860;
  ${({ styled }) => ({ ...styled })};
`;

type CreditCardInputProps = {
  cardTypes: Object,
  onError?: Function,
  cardExpiryInputProps: Object,
  cardNumberInputProps: Object,
  cardCVCInputProps: Object,
  cardZipInputProps: Object,
  cardImageClassName: string,
  cardImageStyle: Object,
  containerClassName: string,
  containerStyle: Object,
  dangerTextClassName: string,
  dangerTextStyle: Object,
  fieldClassName: string,
  fieldStyle: Object,
  images: Object,
  inputClassName: string,
  inputStyle: Object,
  invalidClassName: string,
  invalidStyle: Object,
  customTextLabels: Object
};

const defaultProps: CreditCardInputProps = {
  cardExpiryInputProps: {},
  cardNumberInputProps: {},
  cardCVCInputProps: {},
  cardZipInputProps: {},
  cardImageClassName: '',
  cardImageStyle: {},
  containerClassName: '',
  containerStyle: {},
  dangerTextClassName: '',
  dangerTextStyle: {},
  fieldClassName: '',
  fieldStyle: {},
  inputClassName: '',
  inputStyle: {},
  invalidClassName: 'is-invalid',
  invalidStyle: {},
  customTextLabels: {}
};

const CreditCardInput = (props: CreditCardInputProps) => {
  const {
    state,
    cardNumberProps,
    cardExpiryProps,
    cardCvcProps,
    cardZipProps
  } = useCreditCardInput(props);

  const {
    cardImageClassName,
    cardImageStyle,
    containerClassName,
    containerStyle,
    dangerTextClassName,
    dangerTextStyle,
    fieldClassName,
    fieldStyle,
    inputStyle,
    invalidClassName,
    invalidStyle
  } = props;

  const { cardImage, enableZipInput, errorText, showZip } = state;

  const setFieldInvalid = (errorText: string) => {
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.add(invalidClassName);
  };

  const setFieldValid = () => {
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.remove(invalidClassName);
  };

  useEffect(() => {
    if (errorText) {
      setFieldInvalid(errorText);
    } else {
      setFieldValid();
    }
  }, [errorText]);

  return (
    <Container className={containerClassName} styled={containerStyle}>
      <FieldWrapper
        id="field-wrapper"
        className={fieldClassName}
        styled={fieldStyle}
        invalidStyled={invalidStyle}
      >
        <CardImage
          className={cardImageClassName}
          styled={cardImageStyle}
          src={cardImage}
        />
        <InputWrapper
          inputStyled={inputStyle}
          isActive
          translateX={false}
          data-max="9999 9999 9999 9999 9999"
        >
          <input name="card-number" {...cardNumberProps} />
        </InputWrapper>
        <InputWrapper
          inputStyled={inputStyle}
          isActive
          data-max="MM / YY 9"
          translateX={enableZipInput && !showZip}
        >
          <input name="expiry" {...cardExpiryProps} />
        </InputWrapper>
        <InputWrapper
          inputStyled={inputStyle}
          isActive
          data-max="99999"
          translateX={enableZipInput && !showZip}
        >
          <input name="cvc" {...cardCvcProps} />
        </InputWrapper>
        <InputWrapper
          data-max="999999"
          isActive={enableZipInput}
          isZipActive={showZip}
          translateX={enableZipInput && !showZip}
        >
          <input name="zip" {...cardZipProps} />
        </InputWrapper>
      </FieldWrapper>
      {errorText && (
        <DangerText className={dangerTextClassName} styled={dangerTextStyle}>
          {errorText}
        </DangerText>
      )}
    </Container>
  );
};

CreditCardInput.defaultProps = defaultProps;

export default CreditCardInput;
