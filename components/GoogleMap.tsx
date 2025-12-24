interface GoogleMapProps {
  address: string;
  city: string;
}

export default function GoogleMap({ address, city }: GoogleMapProps) {
  const query = encodeURIComponent(`${address}, ${city}, India`);

  return (
    <div className="map-container">
      <iframe
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${address}, ${city}`}
      />
    </div>
  );
}
