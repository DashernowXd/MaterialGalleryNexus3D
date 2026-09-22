---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# Tool Wrapper: {{SKILL_TITLE}}

Instrucciones y protocolo de uso para la herramienta `{{TOOL_NAME}}`.

> [!IMPORTANT]
> **Principio de Caja Negra (*Black Box*)**: No leas el código fuente completo de los scripts auxiliares en contexto. Ejecútalos invocando su ayuda (`--help`) o pasando los parámetros requeridos.

---

## 1. Guía Rápida de Comandos

| Acción | Comando | Propósito |
| :--- | :--- | :--- |
| **Ayuda / Parámetros** | `.\scripts\run-tool.ps1 -Help` | Muestra opciones y flags disponibles |
| **Modo Seco (Dry-Run)** | `.\scripts\run-tool.ps1 -DryRun` | Simula la acción sin efectos colaterales |
| **Ejecución Estándar** | `.\scripts\run-tool.ps1 -Target <valor>` | Aplica la operación objetivo |

---

## 2. Flujo de Ejecución Recomendado

1. **Descubrir Parámetros**: Si tienes dudas sobre los parámetros válidos, ejecuta el script con el flag de ayuda.
2. **Validar Entradas**: Asegúrate de que las rutas relativas o argumentos coincidan con la estructura del proyecto.
3. **Ejecutar y Evaluar**:
   - Inspecciona el código de salida (*exit code*).
   - Analiza los logs producidos en la consola para confirmar el éxito de la operación.

---

## 3. Documentación Adicional

Para consultar la referencia técnica detallada de flags y sintaxis avanzada, lee el documento:
* [Referencia de la Herramienta](./references/tool-reference.md)
