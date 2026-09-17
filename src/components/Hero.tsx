const Hero = () => {
  return (
    <section className="relative w-full min-h-[35vh] lg:min-h-[85vh] bg-black overflow-hidden">
      {/* Fight Night Background Image - Responsive */}
      <img
        src="/hero.png"
        alt="Fight Night"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark gradient overlay for readability */}

      {/* Content container - keeps section height, prevents collapse */}
      <div className="relative z-10 w-full h-full min-h-[35vh] lg:min-h-[85vh]" />
    </section>
  );
};

export default Hero;
