---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# Workflow: {{SKILL_TITLE}}

Protocolo de ejecución secuencial para {{WORKFLOW_OBJECTIVE}}.

## 1. Pre-Flight Checklist (Precondiciones)

Antes de iniciar la ejecución, valida obligatoriamente:
- [ ] El entorno de trabajo está limpio (`git status --porcelain` no debe tener cambios no guardados si se requiere).
- [ ] Las dependencias requeridas están instaladas y funcionales.
- [ ] Variables de entorno o credenciales necesarias están presentes.

> [!CAUTION]
> Si alguna precondición falla, detén la ejecución e informa al usuario antes de modificar cualquier archivo.

---

## 2. Protocolo de Ejecución Paso a Paso

### Fase 1: Preparación y Validación Inicial
1. Ejecutar script de verificación previa:
   ```powershell
   # Comando de verificación
   ```
2. Verificar que la salida indique estado satisfactorio (`Exit Code 0`).

### Fase 2: Ejecución de Cambios
1. Aplicar la operación principal:
   ```powershell
   # Comando o tarea de ejecución
   ```
2. Registrar cualquier identificador o salida generada.

### Fase 3: Comprobación de Post-Ejecución
1. Ejecutar pruebas de sanidad / validación:
   ```powershell
   # Comando de test o verificación
   ```
2. Confirmar que no se hayan introducido efectos secundarios ni regresiones.

---

## 3. Procedimiento de Rollback (Contingencia)

Si ocurre algún error crítico durante la Fase 2 o 3:
1. Revertir cambios locales o restaurar estado anterior.
2. Limpiar artefactos temporales creados.
3. Notificar el fallo con el log detallado del error.
