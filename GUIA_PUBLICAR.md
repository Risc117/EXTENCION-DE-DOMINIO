# Cómo publicar la web en Netlify Drop

Netlify Drop sube una carpeta arrastrándola; no necesitas saber de servidores. Te da un link con **HTTPS**, que es obligatorio para que el navegador deje usar la cámara.

## 1. Crear la carpeta `dist`

En la carpeta del proyecto, abre una terminal y corre:

```
npm install
npm run build
```

Si todo sale bien, aparece la carpeta `dist` dentro del proyecto. Es lo único que se sube.

## 2. Subirla a Netlify

1. Entra a <https://app.netlify.com/drop>.
2. Abre la carpeta del proyecto en el Explorador de archivos de Windows.
3. Arrastra la carpeta **`dist`** completa (la carpeta, no su contenido suelto) a la zona que dice "Drag and drop your site output folder here".
4. Espera unos segundos. Netlify te muestra un link como `https://nombre-aleatorio.netlify.app`.

> Si no tienes cuenta, Netlify puede pedirte que la crees (es gratis) para que el sitio no se borre solo después de un tiempo. Con la cuenta, además, puedes cambiar el nombre del sitio en "Site configuration".

## 3. Probar el link

Ábrelo en **Chrome** y en **Edge**:

- [ ] Se ve la pantalla inicial y, al entrar, el tanque en 3D.
- [ ] El mouse gira y acerca el tanque.
- [ ] "Iniciar demo" recorre los pasos.
- [ ] "Activar gestos" pide permiso de cámara. Si lo permites, la mano mueve el tanque; si lo niegas, aparece un aviso y sigue funcionando con el mouse.
- [ ] En el celular se ve completo y se puede entrar al panel de "Nivel y caudales".

## Para actualizar

Cambia lo que necesites, corre otra vez `npm run build` y arrastra la nueva carpeta `dist` al sitio desde el panel de Netlify (pestaña **Deploys**).

## Si algo falla

- **Pantalla en blanco**: confirma que subiste la carpeta `dist` y no la del proyecto.
- **La cámara no pide permiso**: revisa que el link empiece con `https://`.
- **Los gestos no arrancan**: el modelo de la mano pesa unos MB; espera unos segundos la primera vez.
