import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../error';

describe('getErrorMessage', () => {
  it('extracts message from an Error instance', () => {
    const error = new Error('Something went wrong');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('extracts message from an object with a message property', () => {
    const error = { message: 'Object error' };
    expect(getErrorMessage(error)).toBe('Object error');
  });

  it('returns the string if the error is a string', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('returns "Unknown error" for null', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
  });

  it('returns "Unknown error" for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('returns "Unknown error" for objects without a message property', () => {
    expect(getErrorMessage({ code: 500 })).toBe('Unknown error');
  });
});
