import { useState } from 'react';
import { Button, Dialog, Flex } from '@radix-ui/themes';

type ConfirmDialogProps = {
  triggerText: string;
  triggerClassName?: string;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  triggerText,
  triggerClassName,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <button type="button" className={triggerClassName}>
          {triggerText}
        </button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px">
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={pending}>
              {cancelText}
            </Button>
          </Dialog.Close>
          <Button color="red" onClick={() => void handleConfirm()} disabled={pending}>
            {pending ? 'Processing...' : confirmText}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
