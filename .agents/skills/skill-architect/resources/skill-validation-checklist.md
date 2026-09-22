# Lista de Verificación y Aseguramiento de Calidad para Skills en Google Antigravity

Usa esta lista de 10 puntos para validar cualquier skill nueva antes de darla por finalizada o integrarla a un repositorio.

---

### 1. Frontmatter YAML Estricto
- [ ] ¿El archivo `SKILL.md` comienza exactamente en la línea 1 con `---` y cierra el bloque con `---`?
- [ ] ¿El campo `name` está en minúsculas, sin espacios ni caracteres especiales (`kebab-case`)?
- [ ] ¿El campo `description` está presente, redactado en tercera persona y describe claramente el **qué** y el **cuándo**?

### 2. Disparadores Semánticos (Trigger Engineering)
- [ ] ¿La descripción contiene las palabras clave tecnológicas y operativas que el usuario probablemente usará en su prompt?
- [ ] ¿La descripción evita ambigüedades genéricas ("ayuda con código") y define un alcance preciso?

### 3. Divulgación Progresiva (Progressive Disclosure)
- [ ] ¿El archivo `SKILL.md` principal es ágil y conciso (idealmente menor a 150 líneas)?
- [ ] ¿La documentación voluminosa, manuales de API y catálogos de errores se movieron a la carpeta `references/` y están vinculados con enlaces markdown relativos?

### 4. Principio de Scripts como Cajas Negras (Black Boxes)
- [ ] Si la skill incluye scripts en `scripts/`, ¿se instruye al agente a ejecutarlos con `--help` o con argumentos específicos en lugar de leer su código fuente entero?
- [ ] ¿Los scripts son no-interactivos (no se quedan bloqueados esperando inputs en terminal)?

### 5. Determinismo y Decision Trees
- [ ] Si la skill maneja múltiples escenarios o condicionales, ¿incluye un árbol de decisión claro (ej. diagrama `mermaid` o tabla lógica)?
- [ ] ¿Están definidas las precondiciones necesarias antes de cualquier modificación?

### 6. Verificación Explícita y Cierre
- [ ] ¿Cada fase o paso crítico incluye un comando o criterio de verificación observable (código de salida, test, revisión visual o de log)?
- [ ] ¿Existe un procedimiento de rollback o contingencia si algo falla a mitad del proceso?

### 7. Cero Duplicación de Conocimiento General
- [ ] ¿Se eliminaron explicaciones genéricas de programación o conceptos estándar que el modelo ya domina de forma nativa?
- [ ] ¿El contenido se enfoca exclusivamente en las particularidades del proyecto, flujo de trabajo o arquitectura?

### 8. Ubicación y Estructura de Directorios
- [ ] ¿La skill reside en `<workspace>/.agents/skills/<skill-name>/` (workspace) o `~/.gemini/config/skills/<skill-name>/` (global)?
- [ ] ¿Los subdirectorios (`scripts/`, `resources/`, `references/`, `examples/`) están correctamente nombrados y organizados?

### 9. Compatibilidad con Comandos Slash
- [ ] ¿El nombre de la skill es limpio y representativo para que funcione intuitivamente como comando slash (`/<skill-name>`) en la interfaz interactiva?

### 10. Enlaces Relativos Funcionales
- [ ] ¿Todos los hipervínculos markdown a scripts, plantillas y referencias utilizan rutas relativas correctas (ej. `./references/manual.md`, `./scripts/test.ps1`)?
