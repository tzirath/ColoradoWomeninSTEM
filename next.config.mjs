

const nextConfig = {
  // All images served from the same origin — no external domains needed

  // Renamed initiatives: keep old links working with permanent (301) redirects
  async redirects() {
    return [
      { source: "/initiatives/skill-swap", destination: "/initiatives/curiosity-exchange", statusCode: 301 },
      { source: "/initiatives/members-network", destination: "/initiatives/grow-bold", statusCode: 301 },
      { source: "/initiatives/mentorship", destination: "/initiatives/champions-circle", statusCode: 301 },
      { source: "/initiatives/cws-voices", destination: "/initiatives/real-talk", statusCode: 301 },
    ];
  },
};

export default nextConfig;
