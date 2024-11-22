import './Landing.css'

import Navbar from "@/Components/LandingNav.tsx";
import HeroSection from "@/Components/HeroSection.tsx";
import InfoSection from "@/Components/InfoSection.tsx";
import SupportedLangs from "@/Components/SupportedLangs.tsx";
import Footer from "@/Components/Footer.tsx";

function Landing() {
    return (
        <div className="min-h-screen mx-20 min-w-screen text-white">
            <Navbar showButtons={true}/>
            <HeroSection/>
            <InfoSection/>
            <SupportedLangs/>
            <Footer/>
        </div>
    )
}

export default Landing