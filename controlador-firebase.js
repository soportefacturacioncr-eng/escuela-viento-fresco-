// controlador-firebase.js

// 1. Función para pedir el nombre y los apellidos por separado
function verificarEstudiante() {
    let nombreCompleto = sessionStorage.getItem('estudianteNombre');
    
    if (!nombreCompleto) {
        let nombre = "";
        let apellidos = "";
        
        while (!nombre || nombre.trim() === "") {
            nombre = prompt("👋 ¡Hola! Por favor, ingresa tu NOMBRE (Ej: Juan):");
        }
        
        while (!apellidos || apellidos.trim() === "") {
            apellidos = prompt(`¡Gracias ${nombre.trim()}! \n\nAhora, ingresa tus APELLIDOS.\n(Es obligatorio para no confundir tus notas con las de otro compañero):`);
        }
        
        nombreCompleto = `${nombre.trim()} ${apellidos.trim()}`;
        sessionStorage.setItem('estudianteNombre', nombreCompleto);
    }
    
    return sessionStorage.getItem('estudianteNombre');
}

// 2. Función global para enviar las notas y los errores a Firebase
function enviarNota(nombreMateria, notaFinal, listaErrores = []) {
    const nombreEstudiante = sessionStorage.getItem('estudianteNombre') || 'Estudiante Anónimo';
    const fechaActual = new Date().toLocaleString('es-CR');
    
    const paqueteDatos = {
        nombre: nombreEstudiante,
        materia: nombreMateria,
        nota: notaFinal,
        fecha: fechaActual,
        errores: listaErrores // ¡Aquí se guardarán las preguntas en las que falló!
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
