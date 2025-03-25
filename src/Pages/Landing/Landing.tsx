import './Landing.css'

import Navbar from "@/Components/LandingNav.tsx";
import HeroSection from "@/Components/HeroSection.tsx";
import InfoSection from "@/Components/InfoSection.tsx";
import SupportedLangs from "@/Components/SupportedLangs.tsx";
import Footer from "@/Components/Footer.tsx";

function Landing() {
    return (
        <div className="flex flex-col w-screen h-screen overflow-y-scroll">
            <Navbar showButtons={true}/>
            <HeroSection/>
            <InfoSection/>
            <SupportedLangs/>
            <Footer/>
        </div>
    )
}

export default Landing