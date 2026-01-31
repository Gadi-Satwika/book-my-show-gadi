import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  availableLocations: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const AVAILABLE_LOCATIONS = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow'
];

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<string>(() => {
    const saved = localStorage.getItem('userLocation');
    return saved || '';
  });
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Show modal on first visit if no location is set
    if (!selectedLocation) {
      setShowLocationModal(true);
    }
  }, []);

  const setSelectedLocation = (location: string) => {
    setSelectedLocationState(location);
    localStorage.setItem('userLocation', location);
    setShowLocationModal(false);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        showLocationModal,
        setShowLocationModal,
        availableLocations: AVAILABLE_LOCATIONS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
