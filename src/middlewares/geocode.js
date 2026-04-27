const geocode = async (endereco, cidade, estado) => {
  try {
    const query = encodeURIComponent(
     `${endereco}, ${cidade}, ${estado}, Brasil, South America`
    );

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
      {
        headers: {
          "User-Agent": "sos-app",
        },
      }
    );

    const text = await response.text();

    const data = JSON.parse(text);

    if (!data || data.length === 0) {
      throw new Error("Endereço não encontrado");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (error) {
    console.log("Erro no geocode:", error.message);
    throw new Error("Erro ao converter endereço em coordenadas");
  }
};

module.exports = geocode;