document.getElementById('formSolicitudProcedimiento').addEventListener('submit', function (event) {
  event.preventDefault();

  // Obtener los valores del formulario
  const nombrePaciente = document.getElementById('nombrePaciente').value;
  const idPaciente = document.getElementById('idPaciente').value;
  const generoPaciente = document.getElementById('generoPaciente').value;

  const nombreMedico = document.getElementById('nombreMedico').value;
  const cedulaMedico = document.getElementById('cedulaMedico').value;

  const diagnostico = document.getElementById('diagnostico').value;
  const procedimiento = document.getElementById('procedimiento').value;
  const justificacion = document.getElementById('justificacion').value;
  const fechaConsulta = document.getElementById('fechaConsulta').value;

  const fechaCita = document.getElementById('fechaCita').value; // formato: yyyy-mm-dd
  const horaCita = document.getElementById('horaCita').value;   // formato: HH:mm
  const motivoCita = document.getElementById('motivoCita').value;
  const locationId = document.getElementById('locationId').value; // Ej: quirófano-1

  const fechaHoraInicio = `${fechaCita}T${horaCita}:00`;
  const fechaHoraFin = `${fechaCita}T${horaCita.slice(0, 2)}:${parseInt(horaCita.slice(3)) + 30}:00`;

  // Crear identificador único
  const uuid = 'req-' + Date.now();

  // ---------- 1. CREAR SERVICE REQUEST ----------
  const serviceRequestFHIR = {
    resourceType: "ServiceRequest",
    id: uuid,
    status: "active",
    intent: "order",
    priority: "routine",
    code: {
      text: procedimiento
    },
    subject: {
      reference: `Patient/${idPaciente}`,
      display: nombrePaciente
    },
    requester: {
      reference: `Practitioner/${cedulaMedico}`,
      display: nombreMedico
    },
    authoredOn: fechaConsulta,
    reasonCode: [
      { text: diagnostico }
    ],
    note: [
      { text: "Justificación: " + justificacion }
    ]
  };

  console.log("Creando ServiceRequest...");
  fetch('https://hl7-fhir-ehr-karol-1.onrender.com/service-request/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceRequestFHIR)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error al crear ServiceRequest");
    }
    return response.json();
  })
  .then(serviceRequestResponse => {
    console.log("ServiceRequest creado:", serviceRequestResponse);

    // ---------- 2. CREAR APPOINTMENT ----------
    const appointmentFHIR = {
      resourceType: "Appointment",
      status: "booked",
      description: motivoCita,
      start: fechaHoraInicio,
      end: fechaHoraFin,
      participant: [
        {
          actor: {
            reference: `Patient/${idPaciente}`,
            display: nombrePaciente
          },
          status: "accepted"
        },
        {
          actor: {
            reference: `Location/${locationId}`,
            display: "Quirófano"
          },
          status: "accepted"
        }
      ]
    };

    console.log("Creando Appointment...");
    return fetch('https://hl7-fhir-ehr-karol-1.onrender.com/appointment/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentFHIR)
    });
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Error al crear Appointment");
    }
    return response.json();
  })
  .then(appointmentResponse => {
    console.log("Appointment creado:", appointmentResponse);
    alert("Solicitud y cita programada exitosamente.");
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Hubo un error: " + error.message);
  });
});
