// app/vehicle-information/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Information | Lemon Lot Parking',
  description: 'Enter your vehicle information for parking',
};

export default function VehicleInformationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8">
        {children}
      </main>
    </div>
  );
}