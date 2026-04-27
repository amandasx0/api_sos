const getLocation = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    {
      headers: {
        "User-Agent": "sos-app"
      }
    }
  );

  const text = await response.text();

  try {
    const data = JSON.parse(text);

    return {
      endereco: data.display_name || "",
      cidade: data.address.city || data.address.town || "",
      estado: data.address.state || "",
    };

  } catch (error) {
    console.log("Erro ao parsear resposta:", text);
    throw new Error("Erro ao obter localização");
  }
};

module.exports = getLocation;