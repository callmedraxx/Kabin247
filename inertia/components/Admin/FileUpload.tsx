import { Image } from 'iconsax-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

export default function FileUpload({
  defaultValue = '',
  onChange,
}: {
  defaultValue?: string;
  onChange: (file: File) => void;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(defaultValue);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    onChange(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      data-is-dragactive={isDragActive}
      {...getRootProps({
        className:
          'border text-secondary-500 border-dashed border-secondary-500 rounded-[6px] p-1 relative h-[120px] data-[is-dragactive=true]:border-primary-500 data-[is-dragactive=true]:border-solid transition-all duration-200 ease-in-out data-[is-dragactive=true]:bg-primary/50',
      })}
    >
      <input {...getInputProps({ className: 'absolute top-0 left-0 w-full h-full' })} />
      {preview ? (
        <div className="w-full h-full relative rounded-md overflow-hidden">
          <img
            src={preview}
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full object-cover"
          />
        </div>
      ) : (
        <div
          data-is-dragactive={isDragActive}
          className="flex items-center justify-center flex-col gap-2.5 py-2.5 p-3 h-full"
        >
          <Image size="32" variant="Bold" />
          <p className="text-sm leading-5 font-normal">
            {t('Drag and drop files here or')}{' '}
            <u className="hover:text-primary-500 hover:cursor-pointer">{t('upload')}</u>
          </p>
        </div>
      )}
    </div>
  );
}
