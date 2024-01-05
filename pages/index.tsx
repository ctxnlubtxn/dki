'use client';

import Layout from '@/components/Layout';
import NoSSRWrapper from '@/components/NoSSRWrapper';
import { Toaster } from '@/components/ui/toaster';

export default function Index() {
  return (
    <NoSSRWrapper>
      <Layout />
      <Toaster />
    </NoSSRWrapper>
  );
}
