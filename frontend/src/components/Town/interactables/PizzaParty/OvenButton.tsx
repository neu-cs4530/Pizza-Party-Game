import React from 'react';
import Image from 'next/image';

export type ButtonProp = {
  onClick: () => void;
};

export default function OvenButton({ onClick }: ButtonProp): JSX.Element {
  return (
    <button onClick={onClick}>
      <Image
        src={'/assets/pizza-party/cooking-button.png'}
        alt='button'
        width={50}
        height={50}
        unoptimized={true}
      />
    </button>
  );
}
