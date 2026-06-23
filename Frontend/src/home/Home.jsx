import React from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import BackendStatus from "../components/BackendStatus";

function Home() {
  return (
    <>
      <Navbar />
      <BackendStatus />
      <Banner />
      <Footer />
    </>
  );
}

export default Home;
