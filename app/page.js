import NCRRealty from '@/components/NCRRealty';

// Pins are loaded client-side in NCRRealty component
// This avoids build-time fetch failures on Vercel
export default function HomePage() {
  return <NCRRealty initialPins={[]} />;
}
