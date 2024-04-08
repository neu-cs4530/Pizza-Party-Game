import React from 'react';

import Image from 'next/image';

export default function Trash(): JSX.Element {
  return (
    <button onClick={() => console.log('Trash clicked')}>
      <Image src={'/assets/pizza-party/trash.jpg'} height={120} width={60} />
    </button>
  );
}
