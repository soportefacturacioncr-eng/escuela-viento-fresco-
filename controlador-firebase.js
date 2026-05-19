// controlador-firebase.js

// 1. Función para pedir el nombre del estudiante
function verificarEstudiante() {
    let nombreEstudiante = sessionStorage.getItem('estudianteNombre');
    if (!nombreEstudiante) {
        nombreEstudiante = prompt("¡Hola! Por favor, ingresa tu nombre y apellido para comenzar a estudiar:");
        while (!nombreEstudiante || nombreEstudiante.trim() === "") {
            nombreEstudiante = prompt("Necesitamos tu nombre para guardar tu progreso. Por favor, ingrésalo:");
        }
        sessionStorage.setItem('estudianteNombre', nombreEstudiante.trim());
    }
    return sessionStorage.getItem('estudianteNombre');
}

// 2. Función global para enviar las notas a Firebase
function enviarNota(nombreMateria, notaFinal) {
    const nombreEstudiante = sessionStorage.getItem('estudianteNombre') || 'Estudiante Anónimo';
    const fechaActual = new Date().toLocaleString('es-CR');
    
    const paqueteDatos = {
        nombre: nombreEstudiante,
        materia: nombreMateria,
        nota: notaFinal,
        fecha: fechaActual
    };

    fetch('https://escuela-viento-fresco-default-rtdb.firebaseio.com/calificaciones.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paqueteDatos)
    })
    .then(respuesta => respuesta.json())
    .then(datos => {
        alert(`¡Felicidades ${nombreEstudiante}! Terminaste con una nota de ${notaFinal}. Respuestas enviadas a la profesora.`);
    })
    .catch(error => {
        console.error("Error al conectar con Firebase:", error);
        alert(`Tu nota es ${notaFinal}, pero hubo un error de internet al guardarla.`);
    });
}
