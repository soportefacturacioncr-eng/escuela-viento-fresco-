// controlador-firebase.js

// 1. Normalización avanzada (agrupa nombres similares, quita tildes, convierte a minúsculas)
function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes
        .replace(/z/g, "s")   // Agrupa Z y S
        .replace(/v/g, "b")   // Agrupa V y B
        .replace(/ll/g, "y")  // Agrupa LL y Y
        .trim();
}

// 2. Genera o recupera un ID único para el dispositivo actual
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// 3. Verificación de Estudiante: Pide datos, autoriza contra lista blanca y controla sesión
async function verificarEstudiante() {
    let idEstudiante = localStorage.getItem('estudianteID');
    const myDeviceId = getDeviceId();

    // Si no está registrado en el navegador, pedimos los datos
    if (!idEstudiante) {
        let nombre = "";
        let apellido1 = "";
        let apellido2 = "";
        
        while (!nombre || nombre.trim() === "") nombre = prompt("👋 ¡Hola! Ingresa tu NOMBRE:");
        while (!apellido1 || apellido1.trim() === "") apellido1 = prompt("Tu PRIMER APELLIDO:");
        while (!apellido2 || apellido2.trim() === "") apellido2 = prompt("Tu SEGUNDO APELLIDO:");
        
        idEstudiante = normalizarTexto(`${nombre}${apellido1}${apellido2}`);
        localStorage.setItem('estudianteNombreReal', `${nombre} ${apellido1} ${apellido2}`);
        localStorage.setItem('estudianteID', idEstudiante);
    }

    // A. VERIFICAR SI ESTÁ AUTORIZADO (Lista blanca en Firebase)
    const responseAuth = await fetch(`https://escuela-viento-fresco-default-rtdb.firebaseio.com/usuarios_autorizados/${idEstudiante}.json`);
    const autorizado = await responseAuth.json();

    if (!autorizado) {
        alert("❌ Acceso denegado: No estás en la lista de estudiantes. Contacta a la profesora.");
        localStorage.removeItem('estudianteID');
        return false;
    }

    // B. REGISTRAR SESIÓN ACTUAL (Sobrescribe cualquier dispositivo anterior automáticamente)
    await fetch(`https://escuela-viento-fresco-default-rtdb.firebaseio.com/sesiones/${idEstudiante}.json`, {
        method: 'PUT',
        body: JSON.stringify({ deviceId: myDeviceId, lastLogin: new Date().toLocaleString('es-CR') })
    });
    return true;
}

// 4. Envío de notas a Firebase
function enviarNota(nombreMateria, notaFinal, listaErrores = []) {
    const nombreReal = localStorage.getItem('estudianteNombreReal') || 'Estudiante Anónimo';
    const idUnico = localStorage.getItem('estudianteID') || 'anonimo';
    
    const paqueteDatos = {
        id_estudiante: idUnico,
        nombre_completo: nombreReal, 
        materia: nombreMateria,
        nota: notaFinal,
        fecha: new Date().toLocaleString('es-CR'),
        errores: listaErrores
    };

    return fetch('https://escuela-viento-fresco-default-rtdb.firebaseio.com/calificaciones.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paqueteDatos)
    })
    .then(respuesta => {
        if (!respuesta.ok) throw new Error("Error en red");
        alert(`¡Felicidades ${nombreReal}! Tu nota de ${notaFinal} se guardó correctamente.`);
        return true;
    })
    .catch(error => {
        console.error("Error Firebase:", error);
        alert("Hubo un error al guardar la nota. Verifica tu conexión.");
        return false;
    });
}
