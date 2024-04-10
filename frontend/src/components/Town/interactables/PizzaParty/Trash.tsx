import React from 'react';
import Image from 'next/image';

interface TrashProps {
  onClick: () => void;
}

export default function Trash({ onClick }: TrashProps): JSX.Element {
  return (
    <button onClick={onClick}>
      <Image src={'/assets/pizza-party/trash.jpg'} height={120} width={60} />
    </button>
  );
}
