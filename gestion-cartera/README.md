# Sistema de Gestión de Cartera

Sistema web completo para la gestión de cartera de deudores con envío de notificaciones masivas por correo electrónico y recordatorios para WhatsApp.

## 🚀 Características

- ✅ **Gestión de Deudores**: Carga masiva desde Excel
- 📊 **Proyectos**: Organiza tu cartera (ej: "10 Mayores Deudores", "Acuerdos de Pago")
- 📧 **Correos Masivos**: Envío de notificaciones por email
- 💬 **Recordatorios WhatsApp**: Genera mensajes para envío manual
- 📈 **Reportes**: Dashboard con estadísticas y análisis
- 🔐 **Autenticación**: Login seguro con Firebase Auth

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Procesamiento Excel**: xlsx
- **Iconos**: Lucide React
- **Routing**: React Router v6

## 📋 Requisitos Previos

- Node.js 16+ instalado
- Cuenta de Firebase (gratuita)
- Gmail o servicio de email para envíos masivos

## ⚙️ Instalación

### 1. Clonar e instalar dependencias

\`\`\`bash
cd gestion-cartera
npm install
\`\`\`

### 2. Configurar Firebase

#### Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Authentication** (Email/Password)
4. Habilita **Firestore Database** (modo producción)

#### Paso 2: Obtener credenciales

1. En Firebase Console, ve a **Project Settings** (⚙️)
2. En la sección "Your apps", crea una **Web App**
3. Copia las credenciales de configuración

#### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):

\`\`\`bash
cp .env.example .env
\`\`\`

Edita `.env` y agrega tus credenciales de Firebase:

\`\`\`env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
\`\`\`

O edita directamente el archivo \`src/config/firebase.js\` y reemplaza los valores.

### 3. Crear usuario administrador

1. En Firebase Console, ve a **Authentication** > **Users**
2. Haz clic en **Add user**
3. Ingresa un email y contraseña (este será tu usuario admin)

### 4. Configurar reglas de Firestore

En Firebase Console > **Firestore Database** > **Rules**, usa estas reglas básicas:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## 🚀 Ejecutar el Proyecto

### Modo desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en: `http://localhost:5173`

### Construir para producción

\`\`\`bash
npm run build
\`\`\`

Los archivos se generarán en la carpeta `dist/`

### Vista previa de producción

\`\`\`bash
npm run preview
\`\`\`

## 📖 Uso del Sistema

### 1. Iniciar Sesión

Usa el email y contraseña que creaste en Firebase Authentication.

### 2. Cargar Deudores

1. Ve a **Deudores** en el menú lateral
2. Descarga la plantilla Excel haciendo clic en "Descargar Plantilla"
3. Llena el Excel con los datos de tus deudores:
   - **nombre**: Nombre completo
   - **email**: Correo electrónico
   - **telefono**: Número de teléfono (con código de país)
   - **monto_deuda**: Monto adeudado (número)
   - **cedula** (opcional): Identificación
   - **direccion** (opcional): Dirección
   - **notas** (opcional): Observaciones

4. Carga el archivo Excel

### 3. Crear Proyectos

1. Ve a **Proyectos** en el menú
2. Haz clic en "Nuevo Proyecto"
3. Selecciona el tipo:
   - **Mayores Deudores**: Selecciona automáticamente los N mayores deudores
   - **Acuerdos de Pago**: Para deudores con acuerdos
   - **Vencidos**: Para deudores con pagos atrasados
   - **Personalizado**: Proyecto personalizado

### 4. Enviar Notificaciones

#### Correos Masivos

1. Ve a **Notificaciones**
2. Selecciona el proyecto o "Todos los deudores"
3. En la pestaña **Correos Masivos**:
   - Escribe el asunto
   - Escribe el mensaje
   - Marca si deseas incluir el monto de la deuda
4. Haz clic en "Enviar"

**Nota**: Para envíos reales, debes configurar Firebase Functions con un servicio de email. Ver sección "Configurar Envío de Emails".

#### Recordatorios WhatsApp

1. Ve a **Notificaciones**
2. Selecciona el proyecto o "Todos los deudores"
3. En la pestaña **Recordatorios WhatsApp**:
   - Haz clic en "Generar Recordatorios"
   - Se mostrarán todos los mensajes preparados
   - Haz clic en "Copiar" para cada mensaje
   - Pega y envía manualmente desde tu WhatsApp Business

### 5. Ver Reportes

Ve a **Reportes** para ver:
- Total de deudores
- Deuda total y promedio
- Top 5 mayores deudores
- Actividad reciente de notificaciones
- Exportar datos a CSV

## 📧 Configurar Envío de Emails (Opcional)

Para envíos reales de correos, necesitas configurar Firebase Functions:

### Opción 1: Gmail SMTP (Límite 500 correos/día)

1. Genera una contraseña de aplicación en Gmail:
   - Ve a tu cuenta de Google > Seguridad
   - Activa "Verificación en dos pasos"
   - Genera una "Contraseña de aplicación"

2. Agrega a tu `.env`:
\`\`\`env
VITE_EMAIL_USER=tu_email@gmail.com
VITE_EMAIL_APP_PASSWORD=tu_contraseña_de_app
\`\`\`

### Opción 2: SendGrid (100 correos/día gratis)

1. Crea una cuenta en [SendGrid](https://sendgrid.com/)
2. Genera una API Key
3. Agrega a tu `.env`:
\`\`\`env
VITE_SENDGRID_API_KEY=tu_api_key_aqui
\`\`\`

**Nota**: Para implementar el envío real, necesitarás crear Firebase Functions. Consulta la documentación de Firebase.

## 📱 Desplegar en Firebase Hosting

\`\`\`bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init hosting

# Construir proyecto
npm run build

# Desplegar
firebase deploy
\`\`\`

## 🗂️ Estructura del Proyecto

\`\`\`
gestion-cartera/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx          # Layout principal con sidebar
│   ├── config/
│   │   └── firebase.js             # Configuración de Firebase
│   ├── context/
│   │   └── AuthContext.jsx         # Contexto de autenticación
│   ├── pages/
│   │   ├── Login.jsx               # Pantalla de login
│   │   ├── Dashboard.jsx           # Dashboard principal
│   │   ├── Deudores.jsx            # Gestión de deudores
│   │   ├── Proyectos.jsx           # Gestión de proyectos
│   │   ├── Notificaciones.jsx      # Envío de notificaciones
│   │   └── Reportes.jsx            # Reportes y estadísticas
│   ├── services/
│   │   ├── debtorService.js        # Servicio para deudores
│   │   ├── projectService.js       # Servicio para proyectos
│   │   └── notificationService.js  # Servicio para notificaciones
│   ├── utils/
│   │   └── excelProcessor.js       # Procesamiento de Excel
│   ├── App.jsx                     # Componente principal con rutas
│   ├── main.jsx                    # Punto de entrada
│   └── index.css                   # Estilos globales
├── .env                            # Variables de entorno
├── .env.example                    # Ejemplo de variables
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
\`\`\`

## 🔒 Seguridad

- Las credenciales de Firebase deben estar en `.env` (nunca commitear al repositorio)
- Las reglas de Firestore deben restringir acceso solo a usuarios autenticados
- Para producción, mejora las reglas de Firestore con validaciones más estrictas
- Considera usar Firebase Security Rules más robustas

## 🐛 Solución de Problemas

### Error de autenticación

- Verifica que las credenciales de Firebase sean correctas
- Asegúrate de haber habilitado Email/Password en Firebase Auth

### Error al cargar Excel

- Verifica que el archivo tenga los campos requeridos
- Asegúrate de que el formato sea .xlsx o .xls

### Los correos no se envían

- El sistema actualmente solo registra los correos en la BD
- Para envío real, debes configurar Firebase Functions

## 📝 Próximas Mejoras

- [ ] Implementar Firebase Functions para envío real de emails
- [ ] Integración con WhatsApp Business API
- [ ] Recordatorios automáticos programados
- [ ] Registro de pagos y seguimiento
- [ ] Múltiples usuarios con roles
- [ ] Historial de cambios por deudor
- [ ] Gráficos y métricas avanzadas
- [ ] Exportar reportes en PDF

## 📄 Licencia

Este proyecto es de uso privado.

## 👨‍💻 Soporte

Para preguntas o problemas, contacta al desarrollador.

---

**Desarrollado con ❤️ para gestión de cartera**
