/** Mantém apenas os dígitos do CPF. */
export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/** Valida o formato e os dígitos verificadores do CPF. */
export function cpfValido(cpf: string): boolean {
  const digitos = normalizarCpf(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }
  const calcularDigito = (base: string): number => {
    const soma = [...base].reduce((total, d, i) => total + Number(d) * (base.length + 1 - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const primeiro = calcularDigito(digitos.slice(0, 9));
  const segundo = calcularDigito(digitos.slice(0, 10));
  return primeiro === Number(digitos[9]) && segundo === Number(digitos[10]);
}

/** Exibe o CPF mascarado, no formato ***.456.789-**. */
export function mascararCpf(cpf: string): string {
  const d = normalizarCpf(cpf);
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : '***';
}

/** Gera a versão do nome usada na busca: minúsculas, sem acentos e sem espaços extras. */
export function nomeParaBusca(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
