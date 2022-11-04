import React, { useEffect, useState } from "react";
//Isnt used currently:
const useGeolocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: {lat: "", lng: ""}
    }); 

    const onSucces = location => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
        });
    };

    const onError = error => {
        setLocation({
            loaded: true,
            error,
        });
    };

    const options = { // Options for the currentPosition method.
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };


    useEffect(() => {
        if(!("geolocation" in navigator)){
            onError({
                code: 0,
                message: 'Geolocation not supported',
            });
        }

        navigator.geolocation.getCurrentPosition(onSucces, onError, options);

    },[]);

    return location;
};

export default useGeolocation;