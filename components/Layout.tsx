'use client';

import { InputFile } from '@/components/InputFile';
import { Button } from '@/components/ui/button';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

import bgm from '../bgm.json';
import { VideoPreview } from './VideoPreview';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  EXTRACT_VIDEO_COMMAND,
  MERGE_COMMAND,
  MERGE_COMMAND_WITHOUT_ORIGINAL,
  determineStart,
} from '@/lib/utils';

import { z, ZodError } from 'zod';
import { useToast } from './ui/use-toast';
import { Checkbox } from './ui/checkbox';
import { LoadingIcon } from './ui/icons';

interface FileDataWithBuffer {
  buffer: ArrayBuffer;
}

const schema = z.object({
  startSeconds: z.number().min(0).max(1000),
  base64: z.string(),
});

export default function Layout() {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoResultRef = useRef<HTMLVideoElement>(null);
  const [videoBase64, setVideoBase64] = useState<string | undefined>(undefined);
  const [seconds, setSeconds] = useState<number>();
  const [isRetainAudio, setIsRetainAudio] = useState(true);

  const load = async () => {
    setIsDownloading(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });
    setLoaded(true);
    setIsDownloading(false);
  };

  useEffect(() => {
    load();
  }, []);

  async function handleFileUpload(base64File: string) {
    setIsPreviewLoading(true);
    setVideoBase64(base64File);

    const ffmpeg = ffmpegRef.current;
    ffmpeg.writeFile('input.mp4', await fetchFile(base64File));
    await ffmpeg.exec(['-i', 'input.mp4', '-c:v', 'copy', 'output.mp4']);

    const data = (await ffmpeg.readFile('output.mp4')) as FileDataWithBuffer;
    videoPreviewRef.current!.src = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );
    setIsPreviewLoading(false);
  }

  async function mergeFile() {
    try {
      schema.parse({ startSeconds: seconds ?? 0, base64: videoBase64 });
      setIsMerging(true);

      const start = determineStart(seconds ?? 0);
      const ffmpeg = ffmpegRef.current;

      await ffmpeg.writeFile('input.mp4', await fetchFile(videoBase64));
      await ffmpeg.writeFile('bgm.mp3', await fetchFile(bgm.base64));

      await ffmpeg.exec(EXTRACT_VIDEO_COMMAND(start));
      await ffmpeg.exec(
        isRetainAudio ? MERGE_COMMAND : MERGE_COMMAND_WITHOUT_ORIGINAL
      );

      const data = (await ffmpeg.readFile('output.mp4')) as FileDataWithBuffer;
      videoResultRef.current!.src = URL.createObjectURL(
        new Blob([data.buffer], { type: 'video/mp4' })
      );

      setIsMerging(false);
    } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
        console.error(error.issues);
        error.errors.forEach((error) => {
          toast({
            title: 'Error',
            description: `${error.path.join('.')} ${error.message}`,
          });
        });
      }
    }
  }

  function handleDownload() {
    if (!videoResultRef.current?.src.includes('blob')) {
      return toast({
        title: 'Error',
        description: 'Please merge the video first',
      });
    }
    const a = document.createElement('a');
    a.href = videoResultRef.current.src;
    a.download = 'result.mp4';
    a.click();
  }

  return (
    <main className="flex space-y-4 min-h-screen h-full flex-col md:p-24 p-6 ${inter.className} bg-white">
      <h1 className="font-bold text-center text-2xl">dki-warkopification</h1>
      <div className="flex flex-col space-y-2 h-full">
        <InputFile
          onFileUpload={handleFileUpload}
          isLoading={isPreviewLoading}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="seconds">Start Seconds</Label>
            <Input
              id="seconds"
              type="number"
              onChange={(event) => {
                const { value } = event.target;
                setSeconds(Number(value));
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="audio"
              onCheckedChange={() => {
                setIsRetainAudio(!isRetainAudio);
              }}
              checked={isRetainAudio}
            />
            <label
              htmlFor="audio"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Keep original audio
            </label>
          </div>
        </div>
        <Button onClick={mergeFile}>
          {isDownloading ? (
            <span className="flex">
              <LoadingIcon className="mr-2" /> Downloading FFmpeg...{' '}
            </span>
          ) : isMerging ? (
            <span className="flex">
              <LoadingIcon className="mr-2" /> Merging...
            </span>
          ) : (
            'Merge'
          )}
        </Button>
      </div>
      <div className="md:col-span-2 h-full w-full">
        <VideoPreview
          videoPreviewRef={videoPreviewRef}
          videoResultRef={videoResultRef}
        />
      </div>
      <Button onClick={handleDownload}>Download</Button>
    </main>
  );
}
