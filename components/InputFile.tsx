import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { useState } from 'react';
import { z } from 'zod';
import { useToast } from './ui/use-toast';
import { LoadingIcon } from './ui/icons';

const schema = z.object({
  video: z.string(),
});

interface InputFileProps {
  onFileUpload: (base64File: string) => void;
  isLoading?: boolean;
}
export function InputFile(props: Readonly<InputFileProps>) {
  const { toast } = useToast();

  const [file, setFile] = useState<File | undefined>(undefined);

  async function convertFileToBase64(file?: File): Promise<string> {
    if (!file) return Promise.reject(new Error('No file provided'));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader result is not a string'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleUpload() {
    try {
      schema.parse({ video: file?.name });
      const base64File = await convertFileToBase64(file);
      props.onFileUpload(base64File);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Please upload a valid video file',
      });
    }
  }

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="video">Video</Label>
      <div className="flex space-x-1.5">
        <Input
          id="video"
          type="file"
          accept="video/*"
          multiple={false}
          onChange={(event) => {
            const { files } = event.target;
            if (files && files.length > 0) {
              const file = files[0];
              setFile(file);
            }
          }}
        />
        <Button onClick={handleUpload}>
          {props.isLoading ? <LoadingIcon /> : 'Upload'}
        </Button>
      </div>
    </div>
  );
}
