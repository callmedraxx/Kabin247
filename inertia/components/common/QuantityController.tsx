import { HStack, IconButton, Input } from '@chakra-ui/react';
import { Add, Minus } from 'iconsax-react';
import React from 'react';

interface IQuantityController {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  incrementButtonClassName?: string;
  decrementButtonClassName?: string;
  containerClassName?: string;
  className?: string;
}

export default function QuantityController({
  value,
  defaultValue = 1,
  onValueChange,
  disabled = false,
  incrementButtonClassName = '',
  decrementButtonClassName = '',
  containerClassName = '',
  className,
}: IQuantityController) {
  const [quantity, setQuantity] = React.useState(defaultValue);

  // Increment
  const increment = (currentQuantity: number) => {
    setQuantity(currentQuantity + 1);
    onValueChange?.(currentQuantity + 1);
  };

  // Decrement
  const decrement = (currentQuantity: number) => {
    if (currentQuantity > 1) {
      setQuantity(currentQuantity - 1);
      onValueChange?.(currentQuantity - 1);
    } else {
      setQuantity(1);
      onValueChange?.(1);
    }
  };

  const memoValue = React.useMemo(() => value, [value]);

  // if value provide then update quantity state
  React.useEffect(() => {
    if (memoValue) {
      setQuantity(memoValue);
    }
  }, [memoValue]);

  return (
    <HStack gap={0} align="center" className={containerClassName}>
      <IconButton
        aria-label="quantityDecrementButton"
        type="button"
        colorScheme="red"
        size="sm"
        className={`${decrementButtonClassName} w-8 h-8`}
        onClick={() => decrement(quantity)}
        disabled={disabled || quantity <= 1}
      >
        <Minus size={16} color="currentColor" />
      </IconButton>
      <Input
        type="number"
        value={quantity}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = parseInt(e.target.value);
          if (value > 0) {
            setQuantity(value);
            onValueChange?.(value);
          }
        }}
        textAlign="center"
        width="40px"
        size="sm"
        border="none"
        disabled={disabled}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
        className={className}
      />
      <IconButton
        aria-label="quantityIncrementButton"
        type="button"
        colorScheme="green"
        size="sm"
        className={`${incrementButtonClassName} w-8 h-8`}
        disabled={disabled}
        onClick={() => increment(quantity)}
      >
        <Add size={16} color="currentColor" />
      </IconButton>
    </HStack>
  );
}
