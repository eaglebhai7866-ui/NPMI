import FullScreenMapViewer from "@/components/FullScreenMapViewer";

const MapOnly = () => {
  const handleDocsClick = () => {
    // Redirect to main website - replace with your actual website URL
    window.open("https://your-main-website.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map View - Full Screen */}
      <div className="h-screen w-full">
        <FullScreenMapViewer showDocsButton={true} onDocsClick={handleDocsClick} />
      </div>
    </div>
  );
};

export default MapOnly;