import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import CreditCardInput from '.';
import './index.stories.css';

const containerStyle = {
  fontFamily: ['Helvetica Neue', 'Helvetica', 'sans-serif'],
  fontSize: '16px',
  fontVariant: 'normal',
  margin: 0,
  padding: '20px',
  WebkitFontSmoothing: 'antialiased'
};

storiesOf('CreditCardInput', module)
  .add('default', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        cardCVCInputProps={{
          onBlur: e => console.log('cvc blur', e),
          onChange: e => console.log('cvc change', e),
          onError: err => console.log(`cvc error: ${err}`)
        }}
        cardExpiryInputProps={{
          onBlur: e => console.log('expiry blur', e),
          onChange: e => console.log('expiry change', e),
          onError: err => console.log(`expiry error: ${err}`)
        }}
        cardNumberInputProps={{
          onBlur: e => console.log('number blur', e),
          onChange: e => console.log('number change', e),
          onError: err => console.log(`number error: ${err}`)
        }}
      />
    </div>
  ))
  .add('mobile friendly enabled', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        enableMobileFriendlyMode
        fieldStyle={{ border: '1px solid #b5b5b5' }}
        customTextLabels={{
          cardNumberPlaceholder: 'Card Number'
        }}
        animationOption={{
          defaultTranslateX: '0',
          mobileTranslateX: '0',
          inititalTranslateX: '0',
          hideCreditCardStyle: {
            transform: 'translateX(-320px)',
            zIndex: 0
          },
          showCreditCardStyle: {
            transform: 'translateX(0px)'
          }
        }}
      />
    </div>
  ))
  .add('with zip field enabled', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput enableZipInput />
    </div>
  ))
  .add('with pre-filled values', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        cardCVCInputProps={{ value: '123' }}
        cardExpiryInputProps={{ value: '05 / 21' }}
        cardNumberInputProps={{ value: '4242 4242 4242 4242' }}
      />
    </div>
  ))
  .add('custom styling (container)', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        containerClassName="custom-container"
        containerStyle={{
          backgroundColor: 'gray',
          padding: '20px',
          fontSize: '30px'
        }}
      />
    </div>
  ))
  .add('custom styling (field wrapper)', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        fieldClassName="custom-field"
        fieldStyle={{ padding: '20px', color: 'gray' }}
        invalidClassName="is-invalid-custom"
        invalidStyle={{ border: '3px solid red' }}
      />
    </div>
  ))
  .add('custom styling (input)', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        inputClassName="custom-input"
        inputStyle={{ color: 'red' }}
      />
    </div>
  ))
  .add('custom styling (danger text)', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        dangerTextClassName="custom-danger-text"
        dangerTextStyle={{ color: 'green' }}
        invalidStyle={{ border: '1px solid green' }}
      />
    </div>
  ))
  .add('custom renderers', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        cardCVCInputRenderer={({ handleCardCVCChange, props }) => (
          <input
            {...props}
            onChange={handleCardCVCChange(e => console.log('cvc change', e))}
          />
        )}
        cardExpiryInputRenderer={({ handleCardExpiryChange, props }) => (
          <input
            {...props}
            onChange={handleCardExpiryChange(e =>
              console.log('expiry change', e)
            )}
          />
        )}
        cardNumberInputRenderer={({ handleCardNumberChange, props }) => (
          <input
            {...props}
            onChange={handleCardNumberChange(e =>
              console.log('number change', e)
            )}
          />
        )}
      />
    </div>
  ))
  .add('custom text values', () => (
    <div
      style={Object.assign({}, containerStyle, { backgroundColor: '#f0f0f0' })}
    >
      <CreditCardInput
        customTextLabels={{
          invalidCardNumber: 'El número de la tarjeta es inválido',
          expiryError: {
            invalidExpiryDate: 'La fecha de expiración es inválida',
            monthOutOfRange: 'El mes de expiración debe estar entre 01 y 12',
            yearOutOfRange: 'El año de expiración no puede estar en el pasado',
            dateOutOfRange: 'La fecha de expiración no puede estar en el pasado'
          },
          invalidCvc: 'El código de seguridad es inválido',
          invalidZipCode: 'El código postal es inválido',
          cardNumberPlaceholder: 'Número de tarjeta',
          expiryPlaceholder: 'MM/AA',
          cvcPlaceholder: 'COD',
          zipPlaceholder: 'C.P.'
        }}
      />
    </div>
  ));
