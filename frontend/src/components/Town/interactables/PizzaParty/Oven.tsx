import React from 'react';
import Image from 'next/image';

export default function Oven(): JSX.Element {
  return (
    <button onClick={() => console.log('Oven clicked')}>
      <Image src={'/assets/pizza-party/oven.jpg'} height={200} width={100} unoptimized={true} />
    </button>
  );
}
