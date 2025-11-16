import fetcher from '@/lib/fetcher';
import { User } from '@/types';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function PromotionBanner({ auth }: { auth?: User }) {
  const [isRead, setIsRead] = useState(true);
  const { data, isLoading } = useSWR('/api/promotions/welcome', fetcher);

  useEffect(() => {
    if (!isLoading && data) {
      if (!localStorage.getItem('promotion')) {
        setIsRead(false);
      }
      setIsRead(localStorage.getItem('promotion') === data?.content?.welcomeImage?.url);
    }
  }, [data]);

  const markAsRead = () => {
    localStorage.setItem('promotion', data?.content?.welcomeImage?.url);
    setIsRead(true);
  };

  if (isLoading || isRead || (auth && auth?.roleId !== 6)) {
    return null;
  }

  if (!data?.content?.welcomeStatus) {
    return null;
  }

  return (
    <Modal isOpen={!isRead} onClose={markAsRead} size="5xl" isCentered>
      <ModalOverlay />
      <ModalContent className="p-0 rounded-xl w-auto">
        <ModalCloseButton className="bg-secondary-100 hover:bg-secondary-200" />

        <ModalBody className="p-0 rounded-xl">
          <div className="rounded-xl">
            <img src={data?.content?.welcomeImage?.url} alt="promotion" className="min-w-80 min-h-80 rounded-xl" />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
