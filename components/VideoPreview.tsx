import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  videoPreviewRef: React.MutableRefObject<HTMLVideoElement | null>;
  videoPreviewCurrentSeconds: number;
  videoResultRef: React.MutableRefObject<HTMLVideoElement | null>;
}
export function VideoPreview(props: Readonly<VideoPreviewProps>) {
  useEffect(() => {
    if (props.videoPreviewRef.current) {
      props.videoPreviewRef.current.src = props.videoPreviewRef.current.src;
      props.videoPreviewRef.current.currentTime =
        props.videoPreviewCurrentSeconds;
    }
    if (props.videoResultRef?.current) {
      props.videoResultRef.current.src = props.videoResultRef.current.src;
    }
  }, [
    props.videoPreviewRef,
    props.videoResultRef,
    props.videoPreviewCurrentSeconds,
  ]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full min-h-[400px] rounded-md border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full flex-col items-center justify-center p-4">
          <span className="font-semibold">Preview</span>
          <video
            controls
            ref={props.videoPreviewRef}
            className={
              props.videoPreviewRef.current?.src.includes('blob')
                ? 'block'
                : 'hidden'
            }
          />
          <Skeleton
            className={cn(
              'w-full h-1/2',
              !props.videoPreviewRef.current?.src.includes('blob')
                ? 'block'
                : 'hidden'
            )}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full flex-col items-center justify-center p-4">
          <span className="font-semibold">Result</span>
          <video
            controls
            ref={props.videoResultRef}
            className={
              props.videoResultRef.current?.src.includes('blob')
                ? 'block'
                : 'hidden'
            }
          />
          <Skeleton
            className={cn(
              'w-full h-1/2',
              !props.videoResultRef.current?.src.includes('blob')
                ? 'block'
                : 'hidden'
            )}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
