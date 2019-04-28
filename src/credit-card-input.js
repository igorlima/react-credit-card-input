// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import CardNumberInput from './card-number-input';
import CardExpiryInput from './card-expiry-input';
import CardCvcInput from './card-cvc-input';
import CardZipInput from './card-zip-input';

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

type Props = {
  CARD_TYPES: Object,
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
  enableZipInput: boolean,
  images: Object,
  inputClassName: string,
  inputStyle: Object,
  invalidClassName: string,
  invalidStyle: Object,
  customTextLabels: Object
};

type State = {
  cardImage: string,
  cardNumber: ?string,
  errorText: ?string,
  showZip: boolean
};

class CreditCardInput extends Component<Props, State> {
  cardExpiryField: any;
  cardNumberField: any;
  cvcField: any;
  zipField: any;

  static defaultProps = {
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
    enableZipInput: false,
    fieldClassName: '',
    fieldStyle: {},
    inputClassName: '',
    inputStyle: {},
    invalidClassName: 'is-invalid',
    invalidStyle: {},
    customTextLabels: {}
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      cardImage: null,
      cardNumber: null,
      errorText: null,
      showZip: false
    };
  }

  setFieldInvalid = (onInputError?: ?Function) => (errorText: string) => {
    const { invalidClassName, onError } = this.props;
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.add(invalidClassName);
    this.setState({ errorText });

    if (onInputError) {
      onInputError(errorText);
    }

    if (onError) {
      onError({ error: errorText });
    }
  };

  setFieldValid = () => {
    const { invalidClassName } = this.props;
    // $FlowFixMe
    document.getElementById('field-wrapper').classList.remove(invalidClassName);
    this.setState({ errorText: null });
  };

  watchCardNumberInputState = ({ cardImage, cardNumber, showZip }) => {
    this.setState({ cardImage, cardNumber, showZip });
  };

  render = () => {
    const { cardImage, cardNumber, errorText, showZip } = this.state;
    const {
      CARD_TYPES,
      cardImageClassName,
      cardImageStyle,
      cardCVCInputProps,
      cardZipInputProps,
      cardExpiryInputProps,
      cardNumberInputProps,
      containerClassName,
      containerStyle,
      dangerTextClassName,
      dangerTextStyle,
      enableZipInput,
      fieldClassName,
      fieldStyle,
      images,
      inputClassName,
      inputStyle,
      invalidStyle,
      customTextLabels
    } = this.props;

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
            <CardNumberInput
              CARD_TYPES={CARD_TYPES}
              autoAdvance={() => this.cardExpiryField.focus()}
              cardNumberInputProps={cardNumberInputProps}
              customTextLabels={customTextLabels}
              enableZipInput={enableZipInput}
              images={images}
              inputClassName={inputClassName}
              setFieldInvalid={this.setFieldInvalid(
                cardNumberInputProps.onError
              )}
              setFieldValid={this.setFieldValid}
              watchState={this.watchCardNumberInputState}
              ref={cardNumberField => {
                this.cardNumberField = cardNumberField;
              }}
            />
          </InputWrapper>
          <InputWrapper
            inputStyled={inputStyle}
            isActive
            data-max="MM / YY 9"
            translateX={enableZipInput && !showZip}
          >
            <CardExpiryInput
              autoAdvance={() => this.cvcField.focus()}
              cardExpiryInputProps={cardExpiryInputProps}
              customTextLabels={customTextLabels}
              inputClassName={inputClassName}
              setFieldInvalid={this.setFieldInvalid(
                cardExpiryInputProps.onError
              )}
              setFieldValid={this.setFieldValid}
              setback={() => this.cardNumberField.focus()}
              ref={cardExpiryField => {
                this.cardExpiryField = cardExpiryField;
              }}
            />
          </InputWrapper>
          <InputWrapper
            inputStyled={inputStyle}
            isActive
            data-max="99999"
            translateX={enableZipInput && !showZip}
          >
            <CardCvcInput
              autoAdvance={() => this.zipField.focus()}
              cardCVCInputProps={cardCVCInputProps}
              cardNumber={cardNumber}
              customTextLabels={customTextLabels}
              enableZipInput={enableZipInput}
              inputClassName={inputClassName}
              setFieldInvalid={this.setFieldInvalid(cardCVCInputProps.onError)}
              setFieldValid={this.setFieldValid}
              setback={() => this.cardExpiryField.focus()}
              showZip={showZip}
              ref={cvcField => {
                this.cvcField = cvcField;
              }}
            />
          </InputWrapper>
          <InputWrapper
            data-max="999999"
            isActive={enableZipInput}
            isZipActive={showZip}
            translateX={enableZipInput && !showZip}
          >
            <CardZipInput
              cardNumber={cardNumber}
              cardZipInputProps={cardZipInputProps}
              customTextLabels={customTextLabels}
              inputClassName={inputClassName}
              setFieldInvalid={this.setFieldInvalid(cardZipInputProps.onError)}
              setFieldValid={this.setFieldValid}
              setback={() => this.cvcField.focus()}
              ref={zipField => {
                this.zipField = zipField;
              }}
            />
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
}

export default CreditCardInput;
