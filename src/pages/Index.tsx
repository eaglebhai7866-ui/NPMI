import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MapViewer from "@/components/MapViewer";
import Timeline from "@/components/Timeline";
import TechStack from "@/components/TechStack";
import TeamStructure from "@/components/TeamStructure";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <MapViewer />
      <Timeline />
      <TechStack />
      <TeamStructure />
      <Footer />
    </div>
  );
};

export default Index;
