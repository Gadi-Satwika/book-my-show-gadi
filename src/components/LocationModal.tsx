import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/contexts/LocationContext";

const LocationModal = () => {
  const { showLocationModal, setShowLocationModal, setSelectedLocation, availableLocations } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularLocations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

  return (
    <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for your city..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Popular Locations */}
          {!searchQuery && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Popular Cities</p>
              <div className="flex flex-wrap gap-2">
                {popularLocations.map((location) => (
                  <Button
                    key={location}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* All Locations */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {searchQuery ? 'Search Results' : 'All Cities'}
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => setSelectedLocation(location)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {location}
                </button>
              ))}
              {filteredLocations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No cities found matching "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
