import { useEffect, useState } from "react";
import axios from 'axios'

function App() {

  const [code, setCode] = useState('')
  const [numberPhone, setNumberPhone] = useState('')

  // Numero de intentos
  const [intents, setIntents] = useState(0)

  // Capturar cada codigo de cada input
  const [verifyCodes, setVerifyCodes] = useState({
    one: '',
    two: '',
    three: '',
    four: '',
  })

  // Peticion al envio del codigo por SMS
  const requestVerificationCode = () => {
    fetch('http://localhost:3000/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: numberPhone }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        alert("to bien")
        // Manejar la respuesta del servidor, por ejemplo, mostrar un mensaje al usuario
      })
      .catch((error) => {
        console.error('Error al solicitar el código de verificación:', error);
        alert("to mal")
      });
  };

  // Peticion para verificar el codigo
  const verifyCode = async () => {
    try {
      if (intents < 3) {
        const { data } = await axios.post("http://localhost:3000/verify-code", { phoneNumber: numberPhone, verificationCode: code })
        console.log(data);
        alert('to bien')
      }
      else {
        alert('numero de intentos excedidos')
      }
    } catch (error) {
      setIntents(intents + 1)
      console.log(error);
      alert(`Te quedan ${2 - intents} intentos`)
    }
  }

  const handleCodeChange = (e) => {
    setVerifyCodes({
      ...verifyCodes,
      [e.target.name]: e.target.value
    })
  }

  // Cada vez que cambia algun digito del codigo de verificacion se va concatenando y haciendo un solo codigo de 4 digitos
  useEffect(() => {
    const { one, two, three, four } = verifyCodes
    const contanetationCode = one + two + three + four
    setCode(contanetationCode)
  }, [verifyCodes])

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-y-10">
      <input placeholder="Ingrese su numero de telefono" className="border-2 border-black w-64 rounded-lg px-2" value={numberPhone} type="text" onChange={(e) => setNumberPhone(e.target.value)} />
      <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold " onClick={requestVerificationCode}>Iniciar sesión</button>
      <div className="flex items-center gap-x-3">
        <input name="one" onChange={handleCodeChange} type="text" className="w-10 h-10 border border-stone-500 text-black text-center" />
        <input name="two" onChange={handleCodeChange} type="text" className="w-10 h-10 border border-stone-500 text-black text-center" />
        <input name="three" onChange={handleCodeChange} type="text" className="w-10 h-10 border border-stone-500 text-black text-center" />
        <input name="four" onChange={handleCodeChange} type="text" className="w-10 h-10 border border-stone-500 text-black text-center" />
      </div>
      <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold " onClick={verifyCode}>verificar</button>
    </div>
  )
}

export default App
