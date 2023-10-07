const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuracion de Twilio
const twilioClient = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

// Configuracion Cors
const corsOptions = {
  origin: '*', // Dominio/s
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Envío de cookies y encabezados de autenticación
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

const verificationCodes = {};
let intents = 0;

// Endpoint para enviar el código de verificación
app.post('/send-verification', (req, res) => {
  console.log('llega');
  const { phoneNumber } = req.body;

  // Generacion de código de verificación aleatorio (4 digitos)
  const verificationCode = Math.floor(1000 + Math.random() * 9000);
  verificationCodes[phoneNumber] = verificationCode;

  // Enviar el código de verificación por SMS
  twilioClient.messages
    .create({
      body: `Tu código de verificación es: ${verificationCode}`,
      from: 'TWILIO_PHONE_NUMBER',
      to: phoneNumber,
    })
    .then(() => {
      res.status(200).json({ message: 'Código de verificación enviado con éxito.' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'No se pudo enviar el código de verificación.' });
    });
});

// Endpoint para verificar el codigo
app.post('/verify-code', (req, res) => {
  const { phoneNumber, verificationCode } = req.body;

  // Obtener el código de verificación almacenado para el número de teléfono
  const storedVerificationCode = verificationCodes[phoneNumber];

  if (!storedVerificationCode) {
    // Si no se encontró un código de verificación para el número de teléfono
    return res.status(404).json({ error: 'Código de verificación no encontrado.' });
  }

  if (verificationCode == storedVerificationCode) {
    // Código de verificación válido, el usuario puede continuar
    res.status(200).json({ message: 'Código de verificación válido.' });
  } else {
    // Código de verificación incorrecto
    res.status(401).json({ error: 'Código de verificación incorrecto.' });
  }

  intents++
  
// Limpia el código de verificación almacenado después de su uso si el numero de intentos es excedido
  if(intents >= 3) delete verificationCodes[phoneNumber];
});

app.listen(port, () => {
  console.log(`Servidor Node.js en funcionamiento en el puerto ${port}`);
});
