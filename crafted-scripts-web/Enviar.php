<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = htmlspecialchars($_POST["nombre"]);
    $email = htmlspecialchars($_POST["email"]);
    $mensaje = htmlspecialchars($_POST["mensaje"]);
    $empresa = isset($_POST["empresa"]) ? htmlspecialchars($_POST["empresa"]) : "-";
    $telefono = isset($_POST["telefono"]) ? htmlspecialchars($_POST["telefono"]) : "-";

    $destinatario = "nosferatulopeta@gmail.com"; // ← CAMBIA ESTO POR TU CORREO
    $asunto = "Nueva solicitud de llamada de descubrimiento";
    $contenido = "Nombre: $nombre\nCorreo: $email\nMensaje:\n$mensaje";
    $headers = "From: $email";

    if (mail($destinatario, $asunto, $contenido, $headers)) {
        header("location: index.html#contacto"); // redirige tras enviar el correo
        exit();
        echo "Mensaje enviado con éxito.";
    } else {
        echo "Error al enviar el mensaje.";
    }
} else {
    echo "Acceso no válido.";
}
?>