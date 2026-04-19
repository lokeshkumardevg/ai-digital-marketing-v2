function TrustedBy() {
  const brands = [
    {
      name: "Meta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    },
    {
      name: "Google Cloud",
      logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
    },
    {
      name: "OpenAI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    },
    {
      name: "Shopify",
      logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    },
  ];

  return (
<section className="relative mt-26 py-24 bg-gradient-to-b from-[#040816] via-[#050a1f] to-[#040816]">
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <p className="mb-6 text-white/100 text-m tracking-wide">
          Powered by Industry Leaders
        </p>

        <div className="relative overflow-hidden">
          
          {/* PERFECT gradient match */}
          {/* <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#040816] to-transparent z-10"></div> */}
          {/* <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#040816] to-transparent z-10"></div> */}

          <div className="flex gap-8 w-max animate-scroll">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex h-[90px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-8 object-contain opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;   