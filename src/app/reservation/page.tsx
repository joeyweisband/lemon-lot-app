"use client";

import { useState, useEffect, ChangeEvent, FormEvent, JSX } from 'react';
import Head from 'next/head';

interface VehicleData {
  color: string;
  licencePlate: string;
  receiveNotifications: boolean;
}

interface ParkingOption {
  id: string;
  label: string;
  price: number;
  duration: string;
}

interface ReservationData {
  fullName: string;
  email: string;
  phone: string;
  parkingOption: string;
  paymentMethod: string;
  price?: number;
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  country: string;
  zipCode: string;
}

export default function ReserveTime(): JSX.Element {
  const [reservationData, setReservationData] = useState<ReservationData>({
    fullName: '',
    email: '',
    phone: '',
    parkingOption: '30 Minute Parking',
    paymentMethod: 'Card',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    country: 'United States',
    zipCode: ''
  });
  
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  useEffect(() => {
    // Get vehicle data from localStorage or context/state management
    const savedVehicleData = localStorage.getItem('vehicleData');
    if (savedVehicleData) {
      setVehicleData(JSON.parse(savedVehicleData));
    }
  }, []);
  
  const parkingOptions: ParkingOption[] = [
    { id: '30min', label: '30 Minute Parking', price: 5.00, duration: '30 minutes' },
    { id: '1hour', label: '1 Hour Parking', price: 8.00, duration: '1 hour' },
    { id: '1hour30min', label: '1 Hour 30 Minute Parking', price: 10.00, duration: '1 hour 30 minutes' },
    { id: '2hour', label: '2 Hour Parking', price: 12.00, duration: '2 hours' },
    { id: '2hour30min', label: '2 Hour 30 Minute Parking', price: 15.00, duration: '2 hours 30 minutes' },
    { id: '3hour', label: '3 Hour Parking', price: 17.00, duration: '3 hours' }
  ];
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    if (type === 'radio' && name === 'parkingOption') {
      const option = parkingOptions.find(opt => opt.label === value);
      if (option) {
        setReservationData({
          ...reservationData,
          parkingOption: value,
          price: option.price
        });
      }
    } else if (type === 'radio' && name === 'paymentMethod') {
      setReservationData({
        ...reservationData,
        paymentMethod: value
      });
    } else {
      setReservationData({
        ...reservationData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Find the selected parking option
      const selectedOption = parkingOptions.find(option => option.label === reservationData.parkingOption) || parkingOptions[0];
      
      // Get current time for start
      const startTime = new Date();
      
      // Calculate end time based on selected duration
      const endTime = new Date(startTime);
      
      // Parse the duration and add to end time
      if (selectedOption.duration.includes('hour')) {
        const hourMatch = selectedOption.duration.match(/(\d+)\s+hour/);
        if (hourMatch) {
          endTime.setHours(endTime.getHours() + parseInt(hourMatch[1], 10));
        }
      }
      
      if (selectedOption.duration.includes('minute')) {
        const minuteMatch = selectedOption.duration.match(/(\d+)\s+minute/);
        if (minuteMatch) {
          endTime.setMinutes(endTime.getMinutes() + parseInt(minuteMatch[1], 10));
        }
      }
      
      // Create event details
      const summary = `Parking Reservation - ${reservationData.fullName}`;
      const description = `
        Vehicle: ${vehicleData?.color || ''} - ${vehicleData?.licencePlate || ''}
        Duration: ${selectedOption.duration}
        Price: $${selectedOption.price.toFixed(2)}
        Contact: ${reservationData.email}, ${reservationData.phone}
        Payment Method: ${reservationData.paymentMethod}
      `;
      
      // Call the server API to create calendar event
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create calendar event');
      }
      
      // Here you would typically send the reservation data to your database as well
      console.log('Reservation Data:', reservationData);
      console.log('Vehicle Data:', vehicleData);
      
      // Show success state
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('There was an error creating your reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Find the selected parking option
  const selectedOption = parkingOptions.find(option => option.label === reservationData.parkingOption) || parkingOptions[0];
  
  return (
    <>
      <Head>
        <title>Reserve Time | Lemon Lot Parking</title>
        <meta name="description" content="Reserve your parking time" />
      </Head>
      
      <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-6">Reserve Time</h1>
        
        {isSuccess ? (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Reservation Successful!</h2>
            <p className="mb-4">Your spot has been reserved and added to the calendar.</p>
            <p className="text-sm text-gray-600">A confirmation email will be sent to {reservationData.email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={reservationData.fullName}
                onChange={handleChange}
                placeholder="Full Name..."
                className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <input
                type="email"
                id="email"
                name="email"
                value={reservationData.email}
                onChange={handleChange}
                placeholder="Email Address..."
                className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <input
                type="tel"
                id="phone"
                name="phone"
                value={reservationData.phone}
                onChange={handleChange}
                placeholder="Phone Number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Payment Options */}
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-3">PAYMENT</h2>
              
              <div className="space-y-2">
                {parkingOptions.map((option) => (
                  <div key={option.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        id={option.id}
                        name="parkingOption"
                        type="radio"
                        value={option.label}
                        checked={reservationData.parkingOption === option.label}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor={option.id} className="ml-3 text-sm font-medium text-gray-700">
                        {option.label}
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">1</span>
                      <span className="text-sm font-medium text-blue-600">${option.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mb-6">
              <h2 className="text-center text-sm font-medium text-gray-700 mb-3">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Item</span>
                <div className="flex items-center space-x-16">
                  <span className="text-sm font-medium">Quantity</span>
                  <span className="text-sm font-medium">amount</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-600">{selectedOption.label}</span>
                <div className="flex items-center space-x-24">
                  <span className="text-sm">1</span>
                  <span className="text-sm text-blue-600">$ {selectedOption.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium">Order Total</span>
                <span className="text-sm font-medium text-blue-600">$ {selectedOption.price.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div 
                className={`border p-4 rounded-md text-center cursor-pointer ${reservationData.paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setReservationData({...reservationData, paymentMethod: 'Card'})}
              >
                <div className="flex justify-center mb-2">
                  <div className="w-6 h-6 text-blue-500">
                    {/* Credit card icon placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm">Card</span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={reservationData.paymentMethod === 'Card'}
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
              
              <div 
                className={`border p-4 rounded-md text-center cursor-pointer ${reservationData.paymentMethod === 'Amazon Pay' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setReservationData({...reservationData, paymentMethod: 'Amazon Pay'})}
              >
                <span className="text-sm">Amazon Pay</span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Amazon Pay"
                  checked={reservationData.paymentMethod === 'Amazon Pay'}
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
              
              <div 
                className={`border p-4 rounded-md text-center cursor-pointer ${reservationData.paymentMethod === 'Cash App Pay' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setReservationData({...reservationData, paymentMethod: 'Cash App Pay'})}
              >
                <span className="text-sm">Cash App Pay</span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash App Pay"
                  checked={reservationData.paymentMethod === 'Cash App Pay'}
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
              
              <div 
                className={`border p-4 rounded-md text-center cursor-pointer ${reservationData.paymentMethod === 'Klarna' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setReservationData({...reservationData, paymentMethod: 'Klarna'})}
              >
                <span className="text-sm">Klarna</span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Klarna"
                  checked={reservationData.paymentMethod === 'Klarna'}
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Secure Checkout */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-700">Secure, 1-click checkout with Link</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            
              {/* Credit Card Information */}
              {reservationData.paymentMethod === 'Card' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={reservationData.cardNumber}
                      onChange={handleChange}
                      placeholder="Card number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="flex space-x-2 mt-1">
                      <span className="text-xs text-gray-500">Visa</span>
                      <span className="text-xs text-gray-500">Mastercard</span>
                      <span className="text-xs text-gray-500">Amex</span>
                      <span className="text-xs text-gray-500">Discover</span>
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      value={reservationData.expirationDate}
                      onChange={handleChange}
                      placeholder="MM / YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      id="securityCode"
                      name="securityCode"
                      value={reservationData.securityCode}
                      onChange={handleChange}
                      placeholder="CVC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      aria-label="Show security code info"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1.5 1.5 0 000 3z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <select
                      id="country"
                      name="country"
                      value={reservationData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={reservationData.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Reserve My Spot
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-2">*100% Secure & Safe Payments*</p>
          </form>
        )}
      </div>
    </>
  );
}