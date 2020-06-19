import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import DestinationFragment from "./DestinationFragment/DestinationFragment";
import HotelFragment from "./HotelFragment/HotelFragment";
import CarFragment from "./CarFragment/CarFragment";

import TabHolder from "./TabHolder";

const SplitPaneLayout = ({ children, panelWidth, breakpoint }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const reportWindowSize = (e) => {
      setWindowWidth(e.target.innerWidth);
    };
    window.addEventListener("resize", reportWindowSize);
    return () => window.removeEventListener("resize", reportWindowSize);
  }, []);

  const [left, right] = children;

  if (windowWidth < parseInt(breakpoint, 10)) {
    return (
      <>
        <div
          style={{
            width: "100%",
            background: "#ffffff",
          }}
        >
          {left}
        </div>
        <div
          style={{
            background: "#f4f4f4",
            overflow: "auto",
          }}
        >
          {right}
        </div>
      </>
    );
  }
  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: panelWidth,
          background: "#ffffff",
        }}
      >
        {left}
      </div>
      <div
        style={{
          position: "fixed",
          left: panelWidth,
          top: 0,
          bottom: 0,
          right: 0,
          background: "#f4f4f4",
          overflow: "auto",
          paddingLeft: "1px",
        }}
      >
        {right}
      </div>
    </>
  );
};

const Content = ({ location }) => {
  const { country, city } = useParams();

  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadDestination = async () => {
      const destinationResponse = await fetch(
        `/api/v1/destinations/${country}/${city}`
      );
      const destination = await destinationResponse.json();
      console.log("DESTINATION : ", destination);
      setLatitude(destination.latitude);
      setLongitude(destination.longitude);
      setDescription(destination.description);
      setCityName(destination.city);
      setCountryName(destination.country);
      setImages(destination.images);
    };

    if (city && country) {
      loadDestination();
    }
  }, [city, country]);

  return (
    <SplitPaneLayout panelWidth="464px" breakpoint="1250px">
      <DestinationFragment
        cityName={cityName}
        countryName={countryName}
        latitude={latitude}
        longitude={longitude}
        description={description}
        images={images}
      />
      <TabHolder location={location}>
        <HotelFragment city={city} country={country} search={location.search} />
        <CarFragment city={city} country={country} search={location.search} />
      </TabHolder>
    </SplitPaneLayout>
  );
};

export default Content;
