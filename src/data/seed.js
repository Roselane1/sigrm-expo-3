export const PDF_SAMPLE_HEADER = {
  arquivo: "MOA_FAD_OS40439",
  osContrato: "40.439",
  centro: "US01",
  solicitante: "ROSELANE - Planejador (a)",
  nomeObra: "ELÉTRICA - AVCB GASÔMETRO",
  elementoPep: "P_UIP4US1008",
  responsavel: "WESLEY - Supervisor",
  emissao: "09/12/2025",
};

export const PDF_SAMPLE_ITEMS = [
  { indice: "19", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15000446", descricaoMaterial: 'CONDULETE AL 3/4" 2E BSP LB 47X60X116MM', qdt: "27,0", ubm: "UN", obs: "" },
  { indice: "20", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15986680", descricaoMaterial: 'CONDULETE TOM 2P+T 10A AL 3/4" 1E BSP E', qdt: "44,0", ubm: "UN", obs: "" },
  { indice: "21", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15930609", descricaoMaterial: "ARRUELA LISA BICROM DN 5MM DIN 125A", qdt: "33,0", ubm: "UN", obs: "" },
  { indice: "22", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15000971", descricaoMaterial: "PARAFUSO CAB CHATA FENDA ATA 4,80 CL 5*", qdt: "32,0", ubm: "UN", obs: "" },
  { indice: "23", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15987732", descricaoMaterial: "LUM EMERG BIVOLT LED 3000LM 14-18W 3-*", qdt: "1,0", ubm: "UN", obs: "" },
  { indice: "24", localAplicacao: "AVCB GASÔMETRO", niMaterial: "82102103 / 15987146", descricaoMaterial: 'CONDULETE 3/4" BSP C 2E COM TO', qdt: "14,0", ubm: "UN", obs: "", review: true, reviewNote: "Dois códigos de material sobrepostos — confirme qual é o correto." },
  { indice: "25", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15095947", descricaoMaterial: "CHUMBADOR 10X50,00MM NYLON", qdt: "31,0", ubm: "UN", obs: "" },
  { indice: "26", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15305117", descricaoMaterial: 'PARAF SEXT SOB 5/16" C55MM', qdt: "32,0", ubm: "UN", obs: "" },
  { indice: "27", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15305240", descricaoMaterial: 'PARAF SEXT SOB 1/4" C45MM', qdt: "86,0", ubm: "UN", obs: "" },
  { indice: "28", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15315837", descricaoMaterial: 'ARRUELA LISA GALV DN 3/16" ASME B27.2', qdt: "134,0", ubm: "UN", obs: "" },
  { indice: "29", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15930609", descricaoMaterial: "ARRUELA LISA BICROM DN 5MM DIN 125A", qdt: "33,0", ubm: "UN", obs: "" },
  { indice: "30", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15000458", descricaoMaterial: 'CONDULETE AL 3/4" 2E BSP LR 47X60X116MM', qdt: "29,0", ubm: "UN", obs: "" },
  { indice: "31", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15000465", descricaoMaterial: 'CONDULETE AL 3/4" 3E BSP T 47X60X116MM', qdt: "16,0", ubm: "UN", obs: "" },
  { indice: "32", localAplicacao: "AVCB GASÔMETRO", niMaterial: "82103157 / 15995855", descricaoMaterial: 'ELETROD RIG GALV FOGO BSP 3/4"', qdt: "200", ubm: "PC", obs: "", review: true, reviewNote: "Dois códigos de material sobrepostos — confirme qual é o correto." },
  { indice: "33", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15975299", descricaoMaterial: "LUM EMERG BIVOLT LED 2300LM 2X12W 10H*", qdt: "12", ubm: "UN", obs: "" },
  { indice: "34", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15805411", descricaoMaterial: 'ABRAÇADEIRA ELETROD D SAE 1020 D 3/4"', qdt: "110", ubm: "UN", obs: "" },
  { indice: "35", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15000452", descricaoMaterial: 'CONDULETE AL 3/4" 2E BSP LL 47X60X116MM', qdt: "8", ubm: "UN", obs: "" },
  { indice: "36", localAplicacao: "AVCB GASÔMETRO", niMaterial: "15128040", descricaoMaterial: "CABO FLEXIVEL 750V 70G PVC 2,", qdt: "388", ubm: "M", obs: "" },
];

function makeItem(base, statusItem, qdtLocalizada) {
  return {
    _id: "it" + Math.random().toString(36).slice(2),
    statusItem,
    qdtLocalizada: qdtLocalizada || "",
    retiradas: [],
    ...base,
  };
}

export function seedUsers() {
  return [
    { id: "u1", nome: "Administrador", login: "Administrador", senha: "Administrador", perfil: "administrador", ativo: true },
    { id: "u2", nome: "Roselane Silva", login: "roselane", senha: "1234", perfil: "tecnico", ativo: true },
    { id: "u3", nome: "Rafael Nogueira", login: "rafael", senha: "1234", perfil: "planejamento", ativo: true },
    { id: "u4", nome: "Diego Ferreira", login: "diego", senha: "1234", perfil: "logistica", ativo: true },
  ];
}

export function seedRequisitions() {
  const rm002Items = PDF_SAMPLE_ITEMS.map((it, i) =>
    makeItem(it, i < 6 ? "localizado" : i < 10 ? "em_localizacao" : "nao_iniciado", i < 6 ? it.qdt : "")
  );

  return [
    {
      id: "req1",
      code: "REQ-2026-0001",
      ...PDF_SAMPLE_HEADER,
      prioridade: "urgente",
      dataCriacao: "2026-07-20",
      dataFinalizacao: null,
      status: "em_atendimento",
      items: rm002Items,
    },
    {
      id: "req2",
      code: "REQ-2026-0002",
      arquivo: "MOA_FAD_OS41102",
      osContrato: "41.102",
      centro: "US02",
      solicitante: "BIANCA ALVES - Planejador (a)",
      nomeObra: "MECÂNICA - LINHA 2",
      elementoPep: "P_UIP4US1102",
      responsavel: "DIEGO FERREIRA - Supervisor",
      emissao: "2026-07-29",
      prioridade: "normal",
      dataCriacao: "2026-07-29",
      dataFinalizacao: null,
      status: "aberta",
      items: [
        makeItem({ indice: "1", localAplicacao: "LINHA 2", niMaterial: "16002210", descricaoMaterial: "ROLAMENTO RÍGIDO DE ESFERA 6205", qdt: "6", ubm: "UN", obs: "" }, "nao_iniciado"),
        makeItem({ indice: "2", localAplicacao: "LINHA 2", niMaterial: "16002298", descricaoMaterial: "CORREIA DENTADA HTD 8M", qdt: "3", ubm: "UN", obs: "" }, "nao_iniciado"),
        makeItem({ indice: "3", localAplicacao: "LINHA 2", niMaterial: "16003310", descricaoMaterial: "GRAXA INDUSTRIAL EP2 (BALDE 18KG)", qdt: "1", ubm: "UN", obs: "" }, "nao_iniciado"),
      ],
    },
    {
      id: "req3",
      code: "REQ-2026-0003",
      arquivo: "MOA_FAD_OS39980",
      osContrato: "39.980",
      centro: "US01",
      solicitante: "MARINA SOUZA - Planejador (a)",
      nomeObra: "CIVIL - PÁTIO DE CARGA",
      elementoPep: "P_UIP4US0980",
      responsavel: "WESLEY - Supervisor",
      emissao: "2026-07-10",
      prioridade: "medio",
      dataCriacao: "2026-07-10",
      dataFinalizacao: null,
      status: "aguardando_retirada",
      items: [
        makeItem({ indice: "1", localAplicacao: "PÁTIO DE CARGA", niMaterial: "17004410", descricaoMaterial: "CIMENTO CP-II 50KG", qdt: "40", ubm: "SC", obs: "" }, "aguardando_retirada", "40"),
        makeItem({ indice: "2", localAplicacao: "PÁTIO DE CARGA", niMaterial: "17004421", descricaoMaterial: "AREIA MÉDIA LAVADA", qdt: "6", ubm: "M3", obs: "" }, "aguardando_retirada", "6"),
      ],
    },
    {
      id: "req4",
      code: "REQ-2026-0004",
      arquivo: "MOA_FAD_OS38500",
      osContrato: "38.500",
      centro: "US01",
      solicitante: "CARLOS LIMA - Planejador (a)",
      nomeObra: "TI - SALA DE SERVIDORES",
      elementoPep: "P_UIP4US0850",
      responsavel: "RAFAEL NOGUEIRA - Supervisor",
      emissao: "2026-07-01",
      prioridade: "normal",
      dataCriacao: "2026-07-01",
      dataFinalizacao: "2026-07-05",
      status: "finalizada",
      items: [
        makeItem({ indice: "1", localAplicacao: "SALA DE SERVIDORES", niMaterial: "18005510", descricaoMaterial: "CABO DE REDE CAT6 (M)", qdt: "80", ubm: "M", obs: "" }, "retirado", "80"),
      ],
    },
    {
      id: "req5",
      code: "REQ-2026-0005",
      arquivo: "MOA_FAD_OS37210",
      osContrato: "37.210",
      centro: "US02",
      solicitante: "BIANCA ALVES - Planejador (a)",
      nomeObra: "ELÉTRICA - SUBESTAÇÃO 2",
      elementoPep: "P_UIP4US0721",
      responsavel: "WESLEY - Supervisor",
      emissao: "2026-06-25",
      prioridade: "urgente",
      dataCriacao: "2026-06-25",
      dataFinalizacao: "2026-06-30",
      status: "finalizada_pendencias",
      items: [
        makeItem({ indice: "1", localAplicacao: "SUBESTAÇÃO 2", niMaterial: "19006610", descricaoMaterial: "DISJUNTOR TRIPOLAR 100A", qdt: "2", ubm: "UN", obs: "" }, "retirado", "2"),
        makeItem({ indice: "2", localAplicacao: "SUBESTAÇÃO 2", niMaterial: "19006622", descricaoMaterial: "CONTATOR TRIPOLAR 40A", qdt: "3", ubm: "UN", obs: "Item fora de linha, fornecedor sem previsão." }, "cancelado"),
      ],
    },
    {
      id: "req6",
      code: "REQ-2026-0006",
      arquivo: "MOA_FAD_OS36040",
      osContrato: "36.040",
      centro: "US01",
      solicitante: "MARINA SOUZA - Planejador (a)",
      nomeObra: "PRODUÇÃO - LINHA 1",
      elementoPep: "P_UIP4US0604",
      responsavel: "DIEGO FERREIRA - Supervisor",
      emissao: "2026-06-20",
      prioridade: "normal",
      dataCriacao: "2026-06-20",
      dataFinalizacao: null,
      status: "cancelada",
      items: [
        makeItem({ indice: "1", localAplicacao: "LINHA 1", niMaterial: "20007710", descricaoMaterial: "SENSOR INDUTIVO M12", qdt: "5", ubm: "UN", obs: "Requisição duplicada, cancelada pelo Técnico." }, "cancelado"),
      ],
    },
  ];
}
