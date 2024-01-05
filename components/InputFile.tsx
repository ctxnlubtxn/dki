import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { useState } from 'react';
import { z } from 'zod';
import { useToast } from './ui/use-toast';

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
          {props.isLoading ? (
            <svg
              className="animate-spin mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            'Upload'
          )}
        </Button>
      </div>
    </div>
  );
}
