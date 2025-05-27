document.getElementById('formSolicitudProcedimiento').addEventListener('submit', function(event) {
  event.preventDefault();

  // Obtener valores del formulario
  const nombrePaciente    = document.getElementById('nombrePaciente').value;
  const fechaCita         = document.getElementById('fechaCita').value;   // formato ISO esperado: yyyy-mm-dd
  const horaCita          = document.getElementById('horaCita').value;    // formato: hh:mm (24h)
  const motivoCita        = document.getElementById('motivoCita').value;

  // Validar campos esenciales
  if (!nombrePaciente || !fechaCita || !horaCita) {
    alert('Por favor complete todos los campos obligatorios.');
    return;
  }

  // Combinar fecha y hora en formato ISO 8601
  const startDateTime = `${fechaCita}T${horaCita}:00`;
  const endDateTime = `${fechaCita}T${horaCita}:30`; // Asume una duración de 30 minutos

  // Construir recurso FHIR Appointment
  const appointment = {
    resourceType: "Appointment",
    status: "booked", // Estado: booked = programada
    description: motivoCita,
    start: startDateTime,
    end: endDateTime,
    participant: [
      {
        actor: {
          reference: "Patient/example", // Reemplazar por el ID real del paciente
          display: nombrePaciente
        },
        status: "accepted"
      },
      {
        actor: {
          reference: "Location/quirófano-1", // Reemplazar por ID real del quirófano
          display: "Quirófano Principal"
        },
        status: "accepted"
      }
    ]
  };

  // Enviar al servidor FHIR
  fetch('https://hl7-fhir-ehr-karol-1.onrender.com/Appointment/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al crear la cita: ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Appointment creado:', data);
    alert('¡Cita quirúrgica registrada correctamente! ID: ' + data.id);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Hubo un error al registrar la cita: ' + error.message);
  });
});
