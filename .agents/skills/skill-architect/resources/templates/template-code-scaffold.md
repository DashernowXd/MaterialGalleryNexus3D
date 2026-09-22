---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# Generador de Código: {{SKILL_TITLE}}

Protocolo para la generación estandarizada de artefactos de tipo `{{ARTIFACT_TYPE}}`.

---

## 1. Esquema de Archivos a Generar

Para cada nuevo elemento generado, deben crearse en sincronía los siguientes archivos:
1. **Archivo Principal**: `src/.../{{Name}}.tsx`
2. **Pruebas Unitarias**: `src/.../__tests__/{{Name}}.test.tsx`
3. **Punto de Entrada / Barrel Export**: Actualización de `index.ts` correspondiente.

---

## 2. Variables de Configuración

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `{{Name}}` | Nombre en PascalCase del módulo o componente | `UserProfileCard` |
| `{{Description}}` | Breve resumen de la responsabilidad del archivo | `Tarjeta para mostrar avatar y datos de usuario` |

---

## 3. Protocolo de Generación

1. **Obtener Requisitos**: Confirmar con el usuario el nombre y características específicas si no fueron especificadas.
2. **Cargar Plantilla Base**:
   - Consultar la plantilla base en [`resources/templates/base-template.txt`](./resources/templates/base-template.txt).
3. **Escribir Archivos**:
   - Generar el código adaptado cumpliendo con el tipado estricto y sin placeholders vacíos.
4. **Verificación Inmediata**:
   - Ejecutar linter o suite de pruebas para confirmar que el código compila limpiamente:
     ```powershell
     npm run test -- {{Name}}
     ```
