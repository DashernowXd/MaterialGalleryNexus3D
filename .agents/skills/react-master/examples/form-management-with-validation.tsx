import React, { useState, ChangeEvent, FormEvent } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], allValues: T) => string | null;
};

interface UseFormConfig<T> {
  initialValues: T;
  validate?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

/**
 * Custom Hook profesional para gestión de formularios con:
 * - Soporte para estado touched (no muestra errores antes de interactuar)
 * - Validación por campo síncrona/declarativa
 * - Bloqueo de doble submit (isSubmitting)
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormConfig<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof T, value: any): string | null => {
    if (!validate || !validate[name]) return null;
    return validate[name]!(value, values);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues(prev => ({ ...prev, [name]: finalValue }));

    if (touched[name as keyof T]) {
      const errorMsg = validateField(name as keyof T, finalValue);
      setErrors(prev => ({
        ...prev,
        [name]: errorMsg || undefined,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const errorMsg = validateField(name as keyof T, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg || undefined,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Validar todos los campos al enviar
    const validationErrors: Partial<Record<keyof T, string>> = {};
    let hasError = false;

    if (validate) {
      for (const key in validate) {
        const errorMsg = validate[key]!(values[key], values);
        if (errorMsg) {
          validationErrors[key] = errorMsg;
          hasError = true;
        }
      }
    }

    setErrors(validationErrors);
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (hasError) return;

    // 2. Ejecutar submit asíncrono seguro
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}

// Ejemplo de formulario de registro de usuario
interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
}

export function RegistrationForm() {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<RegisterFormValues>({
      initialValues: { username: '', email: '', password: '' },
      validate: {
        username: val => (!val.trim() ? 'El nombre de usuario es requerido' : null),
        email: val => (!val.includes('@') ? 'Ingresa un correo electrónico válido' : null),
        password: val => (val.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null),
      },
      onSubmit: async formValues => {
        // Simular petición a backend
        await new Promise(r => setTimeout(r, 1000));
        alert(`¡Usuario ${formValues.username} registrado con éxito!`);
      },
    });

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label htmlFor="username">Usuario:</label>
        <input
          id="username"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!(touched.username && errors.username)}
          style={{ width: '100%', padding: 8 }}
        />
        {touched.username && errors.username && (
          <span style={{ color: 'red', fontSize: 12 }}>{errors.username}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!(touched.email && errors.email)}
          style={{ width: '100%', padding: 8 }}
        />
        {touched.email && errors.email && (
          <span style={{ color: 'red', fontSize: 12 }}>{errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Contraseña:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!(touched.password && errors.password)}
          style={{ width: '100%', padding: 8 }}
        />
        {touched.password && errors.password && (
          <span style={{ color: 'red', fontSize: 12 }}>{errors.password}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} style={{ padding: 10, cursor: 'pointer' }}>
        {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}
