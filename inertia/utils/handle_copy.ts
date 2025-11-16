import { toast } from 'sonner';

export default function handleCopy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!');
}
