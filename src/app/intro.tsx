import { useRouter } from 'expo-router';

import { IntroCarousel } from '@/components/intro/intro-carousel';

export default function IntroScreen() {
  const router = useRouter();

  return <IntroCarousel onFinish={() => router.push('/create-profile')} />;
}
