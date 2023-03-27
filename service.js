const validarEntradaDeDados = (lancamento) => {
  const { cpf, valor } = lancamento;
  const mensagemResultadoDaValidacao = validarCPF(cpf);

  if (mensagemResultadoDaValidacao) {
    return mensagemResultadoDaValidacao;
  }

  return validarValor(valor);
};

const recuperarSaldosPorConta = (lancamentos) => {
  if (!validarLancamentos(lancamentos)) return lancamentos || [];
  const saldosPorCpf = calcularSaldosPorCpf(lancamentos);
  return ordenarSaldosPorOrdemDeLancamento(lancamentos, saldosPorCpf);
};

const recuperarMaiorMenorLancamentos = (cpf, lancamentos) => {
  if (!validarLancamentos(lancamentos)) return [lancamentos[0], lancamentos[0]] || [];

  const lancamentosCpf = lancamentos.filter(
    (lancamento) => lancamento.cpf === cpf
  );

  lancamentosCpf.sort((a, b) => a.valor - b.valor);

  const menorLancamento = lancamentosCpf[0];
  const maiorLancamento = lancamentosCpf[lancamentosCpf.length - 1];

  return [menorLancamento, maiorLancamento];
};

const recuperarMaioresSaldos = (lancamentos) => {
  if (!validarLancamentos(lancamentos)) return lancamentos || [];

  const saldos = recuperarSaldosPorConta(lancamentos);

  const maioresSaldos = saldos.sort((a, b) => b.valor - a.valor).slice(0, 3);

  return maioresSaldos;
};

const recuperarMaioresMedias = (lancamentos) => {
  if (!validarLancamentos(lancamentos)) return lancamentos || [];

  const saldosPorConta = recuperarSaldosPorConta(lancamentos);

  const mediasPorConta = saldosPorConta
    .map(({ cpf, valor }) => ({
      cpf,
      valor:
        valor /
        lancamentos.filter((lancamento) => lancamento.cpf === cpf).length,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 3);

  return mediasPorConta;
};


const calcularSaldosPorCpf = (lancamentos) => {
  const saldos = {};

  for (const lancamento of lancamentos) {
    const { cpf, valor } = lancamento;

    saldos[cpf] = (saldos[cpf] || 0) + valor;
  }

  return saldos;
};

const ordenarSaldosPorOrdemDeLancamento = (lancamentos, saldosPorCpf) => {
  const saldos = [];

  for (const [cpf, valor] of Object.entries(saldosPorCpf)) {
    saldos.push({ cpf, valor });
  }

  saldos.sort((a, b) => {
    const idxA = lancamentos.findIndex(
      (lancamento) => lancamento.cpf === a.cpf
    );
    const idxB = lancamentos.findIndex(
      (lancamento) => lancamento.cpf === b.cpf
    );
    return idxA - idxB;
  });

  return saldos;
};

function validarLancamentos(lancamentos) {
  return (lancamentos.length > 1);
}

function validarValor(valor) {
  if (isNaN(valor)) {
    return "O valor informado não é um número.";
  }

  if (valor > 15000) {
    return "O valor informado ultrapassa o limite máximo permitido.";
  }

  if (valor < -2000) {
    return "O valor informado é inferior ao limite mínimo permitido.";
  }

  if (valor === null) {
    return "O valor informado não é permitido";
  }

  return null;
}

function validarCPF(cpf) {
  if (!/^\d+$/.test(cpf)) {
    return "O CPF deve conter apenas caracteres numéricos";
  }

  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11) {
    return "O CPF deve ter APENAS 11 números";
  }

  if (/^(\d)\1+$/.test(cpf)) {
    return "O CPF informado é inválido!";
  }

  if (calculaDigitoVerificador(cpf, 0, 9) !== parseInt(cpf.charAt(9))) {
    return "O CPF informado é inválido!";
  }

  if (calculaDigitoVerificador(cpf, 0, 10) !== parseInt(cpf.charAt(10))) {
    return "O CPF informado é inválido!";
  }

  return null;
}

function calculaDigitoVerificador(cpf, inicio, fim) {
  let sum = 0;
  for (let i = inicio; i < fim; i++) {
    sum += parseInt(cpf.charAt(i)) * (fim + 1 - i);
  }
  let digit = 11 - (sum % 11);
  return digit > 9 ? 0 : digit;
}
