import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';

const LocationSearchInput = ({ 
  placeholder, 
  value, 
  onChange, 
  onPlaceSelect,
  icon,
  className = '',
  disabled = false,
  name,
  required = false
}) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const location = {
          name: place.formatted_address,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          placeId: place.place_id,
          address: place.formatted_address
        };
        
        setInputValue(place.formatted_address);
        
        if (onPlaceSelect) {
          onPlaceSelect(location);
        }
        
        if (onChange) {
          onChange({
            target: {
              name: name,
              value: place.formatted_address
            }
          });
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newValue
        }
      });
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                const location = {
                  name: results[0].formatted_address,
                  coordinates: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  },
                  placeId: results[0].place_id,
                  address: results[0].formatted_address
                };
                
                setInputValue(results[0].formatted_address);
                
                if (onPlaceSelect) {
                  onPlaceSelect(location);
                }
                
                if (onChange) {
                  onChange({
                    target: {
                      name: name,
                      value: results[0].formatted_address
                    }
                  });
                }
              }
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please ensure location services are enabled.');
        }
      );
    }
  };

  return (
    <div className={`location-search-container ${className}`}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          types: ['geocode'],
          componentRestrictions: { country: 'IN' },
          fields: ['formatted_address', 'geometry', 'place_id', 'name']
        }}
      >
        <div className="input-wrapper">
          {icon && <span className="input-icon">{icon}</span>}
          <input
            ref={inputRef}
            type="text"
            name={name}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            required={required}
            className="location-input"
            autoComplete="off"
          />
          <button 
            type="button" 
            className="location-gps-btn"
            onClick={handleCurrentLocation}
            title="Use current location"
            disabled={disabled}
          >
            📍
          </button>
        </div>
      </Autocomplete>
    </div>
  );
};

export default LocationSearchInput;