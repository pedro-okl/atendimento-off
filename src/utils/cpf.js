/**
 * Remove caracteres especiais do CPF
 */
export function cleanCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }
  return cpf.replace(/\D/g, '');
}

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
export function formatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }
  const cleaned = cleanCPF(cpf);
  if (cleaned.length !== 11) {
    return cleaned;
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida CPF verificando:
 * - Formato (11 dígitos)
 * - Sequências repetidas (como 111.111.111-11)
 * - Dígitos verificadores
 */
export function isValidCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }
  const cleaned = cleanCPF(cpf);

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return false;
  }

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return false;
  }

  return true;
}
