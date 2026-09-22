# Guía Exhaustiva de Arquetipos de Skills para Google Antigravity

Esta guía clasifica y profundiza en los **5 Arquetipos Fundamentales de Agent Skills**, estableciendo los criterios de diseño, anatomía recomendada, patrones de activación, casos de uso y antipatrones para cada uno.

---

## Matriz Comparativa de Arquetipos

| Arquetipo | Propósito Principal | Estructura Clave | Enfoque de Contexto | Disparador Típico |
| :--- | :--- | :--- | :--- | :--- |
| **1. Workflow / Runbook** | Guía de procedimientos secuenciales y operaciones DevOps | Checklists, precondiciones, pasos atómicos, rollback | Secuencial / Estado actual | Tareas operativas: desplegar, migrar, revisar PR, publicar |
| **2. Tool Wrapper / CLI** | Puente hacia herramientas de terminal, SDKs y MCPs | `scripts/` ejecutables, flags de ayuda, validación de salida | Cajas negras (*Black box* via `--help`) | Comandos de herramientas específicas o automatización CLI |
| **3. Domain Specialist** | Experto en estándares, arquitectura y librerías | Reglas, antipatrones, guías en `references/` | Divulgación progresiva profunda | Diseño arquitectónico, auditoría de estándares, APIs complejas |
| **4. Scaffolder / Generator** | Creación y generación estructurada de código y archivos | `resources/` (stubs), `examples/` (código modelo) | Basado en plantillas y variables | Generación de componentes, microservicios, tests, boilerplates |
| **5. Diagnostic & Auditor** | Solución sistemática de errores, triage e inspección | Árboles de decisión, diagnóstico de hipótesis | Deductivo / Condicional | Mensajes de error, incidentes, cuellos de botella, bugs |

---

## 1. Arquetipo: Workflow / Runbook (Procedimental)

### Propósito
Guiar al agente paso a paso a través de procedimientos que tienen un orden estricto, donde cometer un error intermedio o saltarse una validación compromete la estabilidad del sistema (ej. migraciones de base de datos, despliegues a producción, lanzamientos de versión, revisión de pull requests).

### Anatomía Recomendada
```text
my-workflow-skill/
├── SKILL.md                 # Contiene el checklist estricto, gates de validación y rollback
├── scripts/
│   ├── pre-check.ps1        # Script para validar precondiciones del entorno
│   └── rollback.ps1         # Script automatizado de reversión en caso de error
└── resources/
    └── report-template.md   # Plantilla para el resumen de salida tras completar el flujo
```

### Directrices de Diseño
* **Pre-Flight Checks**: Comprobar versiones, variables de entorno, estado de git y permisos antes de cualquier acción destructiva.
* **Validación por Fase**: Cada fase debe tener una condición de éxito verificable antes de proceder a la siguiente.
* **Estrategia de Rollback**: Explicar qué hacer si un paso falla para no dejar el entorno en estado inconsistente.

### Antipatrones a Evitar
* ❌ Dejar pasos abiertos a la improvisación del agente sin comandos de verificación.
* ❌ No proveer plan de contingencia ante fallos de red o errores de compilación.

---

## 2. Arquetipo: Tool Wrapper / CLI Bridge (Integración de Herramientas)

### Propósito
Permitir que el agente interactúe con herramientas de consola, CLIs internos, utilidades del repositorio o APIs externas de forma limpia y confiable.

### Anatomía Recomendada
```text
my-tool-skill/
├── SKILL.md                 # Explica cuándo invocar el script y qué parámetros pasar
├── scripts/
│   ├── run-tool.ps1         # Script principal con control de errores y parámetros
│   └── helper.ps1           # Sub-utilidades
└── references/
    └── cli-reference.md     # Documentación completa de parámetros (leída solo a demanda)
```

### Directrices de Diseño (Principio "Black Box")
* **Scripts como Cajas Negras**: El agente NO debe leer los 500 renglones de código del script; debe ejecutarlo directamente pasando banderas o ejecutando con `--help`.
* **Sanitización de Salidas**: Los scripts deben devolver códigos de salida limpios (`0` para éxito, `>0` para error) y logs comprensibles.
* **Independencia de Plataforma**: Diseñar scripts que reconozcan el sistema operativo (PowerShell para Windows, Bash para POSIX) o utilizar scripts Node/Python multiplataforma.

### Antipatrones a Evitar
* ❌ Obligar al agente a examinar y editar el código del script para tareas rutinarias.
* ❌ Scripts interactivos que bloquean la terminal esperando inputs manuales del usuario.

---

## 3. Arquetipo: Domain Specialist (Experto de Dominio y Estándares)

### Propósito
Transformar al agente en un especialista en una tecnología, framework, arquitectura o estándar específico (ej. React 3D con Three.js, Arquitectura Hexagonal, Seguridad OWASP, Estándar de Accesibilidad WCAG).

### Anatomía Recomendada
```text
my-domain-skill/
├── SKILL.md                 # Principios clave, convenciones rápidas y disparadores precisos
├── references/
│   ├── architecture-guidelines.md # Guías exhaustivas de arquitectura y mejores prácticas
│   └── anti-patterns.md           # Errores comunes y cómo evitarlos
└── examples/
    └── idiomatic-example.tsx      # Implementación canónica de referencia
```

### Directrices de Diseño
* **Divulgación Progresiva**: El `SKILL.md` debe ser conciso (máximo 100-150 líneas) y contener enlaces relativos a los archivos en `references/`. El agente solo leerá los manuales si la complejidad de la tarea lo exige.
* **Patrones Idiomáticos vs. Antipatrones**: Contrastar ejemplos de "Correcto" vs "Incorrecto" acelera la precisión del modelo en más de un 80%.

### Antipatrones a Evitar
* ❌ Sobrecargar el `SKILL.md` principal con cientos de líneas de teoría que saturan el contexto.
* ❌ Descripciones vagas como "Use para ayudar con código React"; debe especificar: "Configures and optimizes React 3D scenes using Three.js and React Three Fiber...".

---

## 4. Arquetipo: Scaffolder / Code Generator (Generador de Código)

### Propósito
Acelerar la creación de nuevos módulos, componentes de interfaz, pruebas unitarias, modelos de datos o servicios, garantizando apego estricto a las convenciones y arquitectura del proyecto.

### Anatomía Recomendada
```text
my-scaffolder-skill/
├── SKILL.md                 # Flujo de generación, preguntas de diseño y checklist
├── resources/
│   ├── templates/
│   │   ├── component.template.tsx # Plantilla con marcadores de posición
│   │   └── component.test.template.tsx
│   └── schema.json          # Esquema de validación para propiedades o datos
└── examples/
    └── complete-sample/     # Componente o módulo terminado que sirve como patrón
```

### Directrices de Diseño
* **Stubs Reutilizables**: Guardar plantillas en `resources/templates/` con marcadores claros (ej. `{{ComponentName}}`, `{{PropsType}}`).
* **Coherencia Múltiple**: Generar simultáneamente el archivo de código, su prueba unitaria correspondiente y su archivo de exportación/barrel (`index.ts`).

### Antipatrones a Evitar
* ❌ Generar código que requiera dependencias no instaladas en el repositorio sin avisar o verificar previamente el `package.json`.

---

## 5. Arquetipo: Diagnostic & Auditor / Debugger (Diagnóstico y Triage)

### Propósito
Proveer al agente de un método científico riguroso para depurar fallos, perfilar rendimiento, investigar caídas del sistema o auditar vulnerabilidades de seguridad.

### Anatomía Recomendada
```text
my-diagnostic-skill/
├── SKILL.md                 # Árbol de decisión de triage, matriz de síntomas y protocolo
├── scripts/
│   └── collect-metrics.ps1  # Script para capturar logs, memoria o trazas
└── references/
    └── known-issues.md      # Base de conocimiento de errores conocidos y soluciones
```

### Directrices de Diseño
* **Árbol de Decisión (*Decision Tree*)**: Modelar el flujo de diagnóstico como un árbol condicional (Síntoma A -> Verificar X -> Si falla X, aplicar Solución 1; si X pasa, verificar Y).
* **Protocolo de Hipótesis y Prueba**: Instruir al agente a formular una hipótesis, ejecutar una prueba de comprobación mínima y verificar el resultado antes de proponer cambios masivos.

### Antipatrones a Evitar
* ❌ Aplicar parches "a ciegas" modificando código antes de recopilar información de error o reproducir el fallo.
