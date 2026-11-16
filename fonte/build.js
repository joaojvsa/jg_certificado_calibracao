const fs = require('fs');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, Header, Footer, ImageRun, PageNumber, TabStopType, VerticalAlign, PageBreak } = d;

const FONT = 'Arial';
// Cores extraídas da logo Neoenergia
const VERDE = '00A03C', VERDE_ESC = '007A2E', VERDE_CLARO = 'E8F5EC', LARANJA = 'F99D1C', AZUL = '00A6E6', CINZA = '4D4D4D', BORDA = 'B3DDC0';
const CW = 10206; // largura útil (A4 com margens de 1,5 cm)

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const cellNone = { top: none, bottom: none, left: none, right: none };
const line = (c = BORDA, s = 4) => ({ style: BorderStyle.SINGLE, size: s, color: c });

const t = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 18, bold: o.bold, italics: o.italics, color: o.color || '000000', subScript: o.sub });
const p = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 60, line: o.line }, border: o.border, tabStops: o.tabs, keepNext: o.keepNext });

function cell(children, w, o = {}) {
  return new TableCell({ children: Array.isArray(children) ? children : [children], width: { size: w, type: WidthType.DXA },
    borders: o.borders || cellNone, shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    verticalAlign: o.v || VerticalAlign.CENTER, columnSpan: o.span,
    margins: { top: o.mt ?? 40, bottom: o.mb ?? 40, left: 80, right: 80 } });
}
function grid(rows, widths, o = {}) {
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
    borders: o.borders || noBorders,
    rows: rows.map(r => new TableRow({ children: r.map((c, i) => c instanceof TableCell ? c : cell(c, widths[i], o.cell || {})) })) });
}
const lbl = s => p(t(s, { color: CINZA }), { after: 0 });
const val = s => p(t(s, { bold: true }), { after: 0 });

function secao(titulo) {
  return p(t(titulo, { bold: true, italics: true, size: 21, color: VERDE_ESC }), { before: 200, after: 100, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: VERDE, space: 2 } } });
}

// ---------- Cabeçalho ----------
const logo = fs.readFileSync(__dirname + '/logo_neoenergia.png');
const LOGO_W = 165;
const { imageSize } = (() => { const b = fs.readFileSync(__dirname + '/logo_neoenergia.png'); return { imageSize: [b.readUInt32BE(16), b.readUInt32BE(20)] }; })();
const LOGO_RATIO = imageSize[1] / imageSize[0];
const header = new Header({ children: [
  grid([[
    p(new ImageRun({ type: 'png', data: logo, transformation: { width: LOGO_W, height: Math.round(LOGO_W * LOGO_RATIO) }, altText: { title: 'Logo', description: 'Logo Neoenergia Pernambuco', name: 'logo' } }), { after: 0 }),
    p(t(''), { after: 0 }),
  ]], [3600, CW - 3600]),
  p(t(''), { after: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: VERDE, space: 4 } } }),
  p(t('', { size: 4 }), { after: 120, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LARANJA, space: 0 } } }),
  p(t('Certificado de Calibração', { bold: true, size: 34, color: VERDE }), { align: AlignmentType.CENTER, after: 120 }),
  grid([
    [lbl('Data de Emissão:'), val('xx/xx/xxxx'), p([t('Número do Certificado: ', { bold: true, color: CINZA }), t('xxx/2026', { bold: true })], { align: AlignmentType.RIGHT, after: 0 })],
    [lbl('Data de Calibração:'), val('xx/xx/xxxx'), p(t(''), { after: 0 })],
  ], [1900, 2400, CW - 4300], { cell: { mt: 10, mb: 10 } }),
  p(t(''), { after: 0 }),
] });

// ---------- Rodapé ----------
const footer = new Footer({ children: [
  new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: CW }], spacing: { after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: LARANJA, space: 4 } }, children: [
    t('Unidade de Planejamento de Redes', { bold: true, size: 15, color: VERDE_ESC }),
    ...[['\tPágina '], [PageNumber.CURRENT], [' de '], [PageNumber.TOTAL_PAGES]].map(c => new TextRun({ font: FONT, size: 15, bold: true, color: VERDE_ESC, children: c })),
  ] }),
] });

// ---------- Página 1 ----------
const pag1 = [
  secao('Solicitante do Serviço'),
  grid([
    [lbl('Nome:'), val('Neoenergia Pernambuco – Companhia Energética de Pernambuco (EAMA)')],
    [lbl('Endereço:'), val('Rua Isaac Markman, 421 – Bongi, Recife/PE')],
  ], [1500, CW - 1500]),

  secao('Identificação do Equipamento Calibrado'),
  grid([
    [lbl('Descrição:'), val('Registrador de Tensão e Corrente'), lbl('Modelo:'), val('Tensão e Corrente')],
    [lbl('Fabricante:'), val('RMS'), lbl('Número de Série:'), val('xxxxxxxxxxxx')],
    [lbl('Resolução do Instrumento:'), val('xxxx,xxx'), lbl(''), val('')],
  ], [2500, 3500, 1700, CW - 7700]),

  secao('Padrão de Referência'),
  grid([
    [lbl('Descrição:'), val('Multicalibrador'), lbl('Número de Identificação:'), val('0026.0')],
    [lbl('Fabricante:'), val('Fluke'), lbl('Modelo:'), val('5520A')],
    [lbl('Número de Série:'), val('9319010'), lbl('Rastreabilidade:'), val('Certificado de Calibração nº F3389004')],
    [lbl('Resolução do Padrão:'), val('Tensão: xx,xx'), lbl(''), val('')],
  ], [2300, 3200, 2200, CW - 7700]),

  secao('Informações Pertinentes à Calibração'),
  grid([
    [lbl('Temperatura Ambiente:'), val('(23 ± 2) ºC'), lbl('Método Utilizado:'), val('VR03.06-00.002'), lbl('Revisão:'), val('00')],
  ], [2300, 1500, 1900, 2000, 1100, CW - 8800]),
  p(t('Os resultados das calibrações referem-se ao valor médio de três medições e encontram-se nas tabelas a seguir.'), { before: 100, after: 120, align: AlignmentType.JUSTIFIED }),

  p(t('Declaração da Incerteza de Medição', { bold: true, size: 19, color: VERDE_ESC }), { before: 80, after: 60, keepNext: true }),
  p([t('A incerteza expandida de medição relatada é declarada como a incerteza padrão de medição multiplicada pelo fator de abrangência k, o qual, para uma distribuição t com ν'),
     t('eff', { sub: true }), t(' graus de liberdade efetivos, corresponde a uma probabilidade de abrangência de aproximadamente 95%. A incerteza padrão da medição foi determinada de acordo com a publicação EA-4/02.')],
    { align: AlignmentType.JUSTIFIED, after: 300, line: 276 }),

  grid([[cell(p(t('Este certificado atende aos requisitos da ABNT NBR ISO/IEC 17025, sendo válido apenas para o equipamento de medição calibrado, não sendo extensivo a quaisquer outros equipamentos de medição, ainda que similares. Esta calibração não isenta o instrumento do controle metrológico estabelecido na regulamentação metrológica vigente. A Neoenergia Pernambuco autoriza a reprodução deste certificado, desde que qualquer cópia apresente sempre o seu conteúdo completo.', { size: 15, color: CINZA }), { align: AlignmentType.JUSTIFIED, after: 0 }),
    CW, { borders: { top: line(VERDE, 8), bottom: line(VERDE, 8), left: line(VERDE, 8), right: line(VERDE, 8) }, fill: VERDE_CLARO, mt: 100, mb: 100 })]], [CW]),
];

// ---------- Página 2: Resultados (somente dados da foto) ----------
const RW = [2042, 2041, 2041, 2041, 2041];
const tb = { top: line(), bottom: line(), left: line(), right: line() };
function tabela(cab, linhas) {
  const head = new TableRow({ tableHeader: true, children: cab.map((h, i) => cell(p(t(h, { bold: true, color: 'FFFFFF' }), { align: AlignmentType.CENTER, after: 0 }), RW[i],
    { fill: VERDE, borders: { top: line(VERDE), bottom: line(VERDE), left: line(VERDE), right: line(VERDE) }, mt: 70, mb: 70 })) });
  const body = linhas.map((r, k) => new TableRow({ children: r.map((v, i) => cell(p(t(v), { align: AlignmentType.CENTER, after: 0 }), RW[i],
    { borders: tb, fill: k % 2 ? VERDE_CLARO : 'FFFFFF', mt: 60, mb: 60 })) }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: RW, rows: [head, ...body] });
}

const pag2 = [
  new Paragraph({ children: [new PageBreak()] }),
  secao('Resultados'),
  p(t('Tensão', { bold: true, color: VERDE_ESC }), { before: 60, after: 80, keepNext: true }),
  tabela(['Valor Referência (V)', 'Faixa Limite', 'Valor Medido', 'Erro%', 'Incerteza'], [
    ['201', '200,0 - 202,0 V', '190,00', '-5,47', '0,17'],
    ['220', '218,9 - 221,1 V', '222,00', '0,91', '0,17'],
    ['231', '229,8 - 232,2 V', '229,00', '-0,87', '0,17'],
  ]),

  p(t('Convenções:', { bold: true, size: 16, color: CINZA }), { before: 280, after: 40 }),
  p(t('Erro%: erro percentual de indicação do instrumento em relação ao valor de referência para cada condição.', { size: 16, color: CINZA }), { after: 20 }),
  p(t('Incerteza: incerteza expandida de medição para um nível de confiança de aproximadamente 95%.', { size: 16, color: CINZA }), { after: 0 }),

  p(t(''), { after: 0, before: 1300 }),
  grid([[
    cell(p(t('')), (CW - 4200) / 2),
    cell([p(t('Pablo Forlan', { bold: true }), { align: AlignmentType.CENTER, after: 0 }), p(t('Responsável Técnico', { color: CINZA }), { align: AlignmentType.CENTER, after: 0 })], 4200, { borders: { ...cellNone, top: line(VERDE_ESC, 8) } }),
    cell(p(t('')), (CW - 4200) / 2),
  ]], [(CW - 4200) / 2, 4200, (CW - 4200) / 2]),
];

const doc = new Document({
  creator: 'Neoenergia Pernambuco', title: 'Certificado de Calibração – Registrador de Tensão e Corrente',
  styles: { default: { document: { run: { font: FONT, size: 18 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2900, bottom: 1300, left: 850, right: 850, header: 500, footer: 450 } } },
    headers: { default: header }, footers: { default: footer }, children: [...pag1, ...pag2] }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(__dirname + '/../Certificado_Calibracao_Neoenergia_PE.docx', b); console.log('ok'); });
