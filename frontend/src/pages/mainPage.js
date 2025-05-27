import React from "react";
import '../styles/mainPage.css';
import Hero from '../components/hero';
import Features from '../components/features';
import Demonstration from "../components/demonstration";

const MainPage = () => {

    return (
        <div>
            <Hero />
            <Features />
            <Demonstration />
        </div>
    )
}

export default MainPage;