import React from 'react';
import { Button } from '@chakra-ui/react';
import ovenImage from './ovenImage.png'; // Import your oven image

export default function OvenButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <Button
      onClick={onClick}
      bgImage={`url(${ovenImage})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      width="200px" // Adjust width according to your design
      height="200px" // Adjust height according to your design
      position="relative"
      _hover={{ cursor: 'pointer' }} // Change cursor on hover
    >
    </Button>
  );
}
