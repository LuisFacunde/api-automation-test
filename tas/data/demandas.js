const valida = () => ({
   category: "ROAD_MAINTENANCE",
   description: "Buraco de grande porte na pista da direita.",
   location: { latitude: -8.0578, longitude: -34.8829, region: "RPA_3" },
});

const com = (extra) => ({ ...valida(), ...extra });

const USUARIOS = {
   cidada: "ana@exemplo.com",
   gestor: "gestor@exemplo.com",
};

module.exports = { valida, com, USUARIOS };
