// Conversões entre o formato usado nos componentes (camelCase, tudo string,
// igual aos <input>) e o formato das colunas do Postgres (snake_case, com
// datas/numeros tipados). Mantém o resto do app sem precisar saber que existe
// um banco de dados por trás.

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const str = (v) => (v === "" || v === null || v === undefined ? null : v);

export function beneficioToDb(f) {
  return {
    situacao: f.situacao,
    status: f.status,
    tipo: f.tipo,
    nome: f.nome,
    cpf: str(f.cpf),
    data_parto: str(f.dataParto),
    data_der: str(f.dataDER),
    data_concessao: str(f.dataConcessao),
    data_inicio_pagamento: str(f.dataInicioPagamento),
    dia_util_pagamento: num(f.diaUtilPagamento),
    data_cessacao: str(f.dataCessacao),
    qtd_parcelas: num(f.qtdParcelas),
    valor_beneficio: num(f.valorBeneficio),
    valor_honorarios: num(f.valorHonorarios),
    data_pagamento: str(f.dataPagamento),
    observacoes: str(f.observacoes),
  };
}

export function beneficioFromDb(r) {
  return {
    id: r.id,
    situacao: r.situacao || "Em Análise",
    status: r.status || "-",
    tipo: r.tipo || "SM Urbano",
    nome: r.nome || "",
    cpf: r.cpf || "",
    dataParto: r.data_parto || "",
    dataDER: r.data_der || "",
    dataConcessao: r.data_concessao || "",
    dataInicioPagamento: r.data_inicio_pagamento || "",
    diaUtilPagamento: r.dia_util_pagamento ?? "",
    dataCessacao: r.data_cessacao || "",
    qtdParcelas: r.qtd_parcelas ?? "",
    valorBeneficio: r.valor_beneficio ?? "",
    valorHonorarios: r.valor_honorarios ?? "",
    dataPagamento: r.data_pagamento || "",
    observacoes: r.observacoes || "",
  };
}

export function partoToDb(f) {
  return {
    nome: f.nome,
    contato: str(f.contato),
    tipo: f.tipo,
    status: f.status,
    dpp: str(f.dpp),
    situacao: f.situacao,
    observacao: str(f.observacao),
  };
}

export function partoFromDb(r) {
  return {
    id: r.id,
    nome: r.nome || "",
    contato: r.contato || "",
    tipo: r.tipo || "SM Urbano",
    status: r.status || "Lead",
    dpp: r.dpp || "",
    situacao: r.situacao || "Pré-parto",
    observacao: r.observacao || "",
  };
}
