import { Spinner } from '@chakra-ui/react';

export default function LoadingScreen() {
  return (
    <div className="h-screen flex justify-center items-center bg-mdTheme-400 flex-col gap-6">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="secondary.200"
        color="primary.400"
        size="xl"
      />
    </div>
  );
}
