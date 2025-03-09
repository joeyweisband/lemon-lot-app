/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, ChangeEvent, FormEvent, JSX } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
import Head from 'next/head';

interface VehicleData {
  color: string;
  licencePlate: string;
  receiveNotifications: boolean;
}

export default function VehicleInformation(): JSX.Element {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter(); // No conditional needed with next/navigation
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    color: '',
    licencePlate: '',
    receiveNotifications: false
  });

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Save data to localStorage or context/state management
    localStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    // Navigate to the next page
    router.push('/reserve-time');
  };
  
  return (
    <>
      <Head>
        <title>Vehicle Information | Lemon Lot Parking</title>
        <meta name="description" content="Enter your vehicle information for parking" />
      </Head>
      
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Vehicle Information</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Car Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={vehicleData.color}
              onChange={handleChange}
              placeholder="Color"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="licencePlate" className="block text-sm font-medium text-gray-700 mb-1">
              Licence Plate Number: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="licencePlate"
              name="licencePlate"
              value={vehicleData.licencePlate}
              onChange={handleChange}
              placeholder="Licence Plate Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="receiveNotifications"
                  name="receiveNotifications"
                  type="checkbox"
                  checked={vehicleData.receiveNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="receiveNotifications" className="font-medium text-gray-700">
                  I Consent to Receive SMS Notifications, Alerts & Communication from Lemon Lot Parking. You can reply STOP to unsubscribe at any time. I agree to the terms of service to park in this location.
                </label>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Confirm Time!
          </button>
        </form>
      </div>
    </>
  );
}