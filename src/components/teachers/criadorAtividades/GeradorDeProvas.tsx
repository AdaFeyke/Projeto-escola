"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trash2, Printer, ImageIcon, Settings, X,
  Layout, Type, AlignLeft, CheckSquare, List,
  Image as LucideImage, Copy, AlignCenter, AlignRight,
  FileText, MoveVertical,
  Award, Bold, Italic,
  ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';

const TIPOS_QUESTAO = {
  DISCURSIVA: 'DISCURSIVA',
  OBJETIVA: 'OBJETIVA',
  VF: 'VERDADEIRO OU FALSO',
  MULTIPLA_ESCOLHA: 'MÚLTIPLA ESCOLHA',
  ASSOCIACAO: 'ASSOCIAÇÃO',
  COMPLETAR: 'COMPLETAR LACUNAS',
  ORDENACAO: 'ORDENAÇÃO',
  COLUNAS: 'COLUNAS'
} as const;

type TipoQuestao = typeof TIPOS_QUESTAO[keyof typeof TIPOS_QUESTAO];

interface Config {
  escola: string;
  professor: string;
  disciplina: string;
  turma: string;
  bimestre: string;
  fontSize: string;
  mostrarLogo: boolean;
  logoUrl: string | null;
  margem: string;
  corPrimaria: string;
}

interface Questao {
  id: number;
  tipo: TipoQuestao;
  enunciado: string;
  valor: number;
  opcoes: string[];
  imagem: string | null;
  imgWidth: string;
  imgAlign: 'left' | 'center' | 'right';
  linhasResposta: number;
  enunciadoTextAlign: 'left' | 'center' | 'right' | 'justify';
  enunciadoFontWeight: 'normal' | 'bold';
  enunciadoFontStyle: 'normal' | 'italic';
  imagemPosicao: 'antes' | 'meio' | 'depois';
  alternativasVF?: string[]; // Para questões VF com texto personalizado
  lacunas?: string[]; // Para questões de completar
  itensAssociacao?: Array<{ esquerda: string, direita: string }>; // Para questões de associação
  itensOrdenacao?: string[]; // Para questões de ordenação
  colunas?: string[]; // Títulos das colunas
  linhasColunas?: number; // Número de linhas para preencher
}

function splitTextoNoMeio(texto: string): { antes: string; depois: string } {
  if (!texto) return { antes: '', depois: '' };
  if (texto.length < 6) return { antes: texto, depois: '' };

  const meio = Math.floor(texto.length / 2);
  let splitIndex = -1;

  for (let offset = 0; offset < texto.length; offset++) {
    const left = meio - offset;
    const right = meio + offset;

    if (left > 0 && left < texto.length - 1 && /\s/.test(texto.charAt(left))) {
      splitIndex = left;
      break;
    }

    if (right > 0 && right < texto.length - 1 && /\s/.test(texto.charAt(right))) {
      splitIndex = right;
      break;
    }
  }

  if (splitIndex === -1) splitIndex = meio;

  const antes = texto.slice(0, splitIndex).replace(/\s+$/, '') + ' ';
  const depois = texto.slice(splitIndex + 1).replace(/^\s+/, '');
  return { antes, depois };
}

const GeradorDeProvasPro = () => {
  const [config, setConfig] = useState<Config>({
    escola: '',
    professor: '',
    disciplina: '',
    turma: '',
    bimestre: '',
    fontSize: '11pt',
    mostrarLogo: true,
    logoUrl: null,
    margem: '20mm',
    corPrimaria: '#4f46e5'
  });

  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [questoesMinimizadas, setQuestoesMinimizadas] = useState<Set<number>>(new Set());

  const toggleMinimizar = (id: number) => {
    setQuestoesMinimizadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const minimizarTodas = () => {
    setQuestoesMinimizadas(new Set(questoes.map(q => q.id)));
  };

  const expandirTodas = () => {
    setQuestoesMinimizadas(new Set());
  };

  useEffect(() => {
    const savedData = localStorage.getItem('prova-pro-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.questoes && Array.isArray(parsed.questoes)) {
          const questoesCompletas = parsed.questoes.map((q: Partial<Questao> & { valor?: number | string }) => ({
            ...q,
            enunciadoTextAlign: q.enunciadoTextAlign || 'justify',
            enunciadoFontWeight: q.enunciadoFontWeight || 'normal',
            enunciadoFontStyle: q.enunciadoFontStyle || 'normal',
            imagemPosicao: q.imagemPosicao || 'antes',
            imgAlign: q.imgAlign || 'center',
            imgWidth: q.imgWidth || '250px',
            linhasResposta: q.linhasResposta || 4,
            opcoes: q.opcoes || [],
            imagem: q.imagem || null,
            valor: typeof q.valor === 'number' ? q.valor : parseFloat(String(q.valor || '1').replace(',', '.')) || 1,
            enunciado: q.enunciado || ''
          })) as Questao[];
          setQuestoes(questoesCompletas);
        } else {
          adicionarQuestao(TIPOS_QUESTAO.DISCURSIVA);
        }
      } catch (e) {
        adicionarQuestao(TIPOS_QUESTAO.DISCURSIVA);
      }
    } else {
      adicionarQuestao(TIPOS_QUESTAO.DISCURSIVA);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('prova-pro-data', JSON.stringify({ config, questoes }));
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [config, questoes]);

  const adicionarQuestao = (tipo: TipoQuestao = TIPOS_QUESTAO.DISCURSIVA) => {
    const novaQuestao: Questao = {
      id: Date.now(),
      tipo,
      enunciado: '',
      valor: 1,
      opcoes: tipo === TIPOS_QUESTAO.OBJETIVA || tipo === TIPOS_QUESTAO.MULTIPLA_ESCOLHA ? ['', '', '', ''] : [],
      imagem: null,
      imgWidth: '250px',
      imgAlign: 'center',
      linhasResposta: 4,
      enunciadoTextAlign: 'justify',
      enunciadoFontWeight: 'normal',
      enunciadoFontStyle: 'normal',
      imagemPosicao: 'antes',
      alternativasVF: tipo === TIPOS_QUESTAO.VF ? ['Verdadeiro', 'Falso'] : undefined,
      lacunas: tipo === TIPOS_QUESTAO.COMPLETAR ? ['', '', ''] : undefined,
      itensAssociacao: tipo === TIPOS_QUESTAO.ASSOCIACAO ? [{ esquerda: '', direita: '' }, { esquerda: '', direita: '' }] : undefined,
      itensOrdenacao: tipo === TIPOS_QUESTAO.ORDENACAO ? ['', '', ''] : undefined,
      colunas: tipo === TIPOS_QUESTAO.COLUNAS ? ['Coluna 1', 'Coluna 2'] : undefined,
      linhasColunas: tipo === TIPOS_QUESTAO.COLUNAS ? 3 : undefined
    };
    setQuestoes([...questoes, novaQuestao]);
  };

  const atualizarQuestao = <K extends keyof Questao>(id: number, field: K, value: Questao[K]) => {
    setQuestoes(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const duplicarQuestao = (questao: Questao) => {
    setQuestoes([...questoes, { ...questao, id: Date.now() }]);
  };

  const removerQuestao = (id: number) => {
    if (confirm("Deseja excluir esta questão?")) {
      setQuestoes(questoes.filter(q => q.id !== id));
    }
  }

  const moverQuestao = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questoes.length - 1) return;

    const newQuestoes = [...questoes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const questaoAtual = newQuestoes[index];
    const questaoTroca = newQuestoes[newIndex];

    if (questaoAtual && questaoTroca) {
      [newQuestoes[index], newQuestoes[newIndex]] = [questaoTroca, questaoAtual];
      setQuestoes(newQuestoes);
    }
  }

  const [paginas, setPaginas] = useState<number[][]>([]);
  const paginasKeyRef = useRef<string>('');
  const measurePageRef = useRef<HTMLDivElement | null>(null);
  const measureHeaderRef = useRef<HTMLElement | null>(null);
  const measureQuestionsRef = useRef<HTMLDivElement | null>(null);

  const renderQuestaoPreview = (q: Questao, index: number, measureIndex?: number) => {
    const enunciadoTexto = q.enunciado || "Digite aqui o enunciado da sua questão...";
    const partesEnunciado = q.imagem && q.imagemPosicao === 'meio'
      ? splitTextoNoMeio(enunciadoTexto)
      : null;

    const imagemContainerStyleBase: React.CSSProperties = {
      lineHeight: 0,
      maxWidth: '100%',
      float: q.imgAlign === 'left' ? 'left' : q.imgAlign === 'right' ? 'right' : 'none',
      clear: q.imgAlign === 'center' ? 'both' : 'none',
      width: q.imgAlign === 'center' ? 'fit-content' : undefined,
      margin: q.imgAlign === 'center'
        ? '0.5rem auto'
        : q.imgAlign === 'left'
          ? '0.5rem 1rem 0.5rem 0'
          : '0.5rem 0 0.5rem 1rem'
    };

    return (
      <div
        data-measure-question={measureIndex != null ? 'true' : undefined}
        data-index={measureIndex != null ? String(measureIndex) : undefined}
        className="questao-container break-inside-avoid-page relative group"
        style={{ pageBreakInside: 'avoid' }}
      >
        {/* Badge de valor na impressão (opcional, pode ser ajustado) */}
        <div className="flex items-start gap-3">
          <span className="font-black text-lg leading-none min-w-[25px]">{index + 1}.</span>

          <div className="flex-1 space-y-4 max-w-full">
            {/* Enunciado e Valor */}
            <div
              className="leading-relaxed break-inside-avoid-page"
              style={{
                width: '100%',
                wordBreak: 'break-word',
                textAlign: q.enunciadoTextAlign,
                fontWeight: q.enunciadoFontWeight,
                fontStyle: q.enunciadoFontStyle
              }}
            >
              {q.valor > 0 && <span className="mr-2 text-indigo-700 print:text-black">({q.valor.toFixed(1).replace('.', ',')})</span>}

              {/* Imagem antes do texto */}
              {q.imagem && q.imagemPosicao === 'antes' && (
                <div className="my-2" style={{ ...imagemContainerStyleBase }}>
                  <img
                    src={q.imagem || ''}
                    style={{
                      width: q.imgWidth,
                      maxWidth: 'none',
                      display: 'block',
                      margin: q.imgAlign === 'center' ? '0 auto' : '0'
                    }}
                    className="rounded shadow-sm border border-slate-100"
                    alt="Questão"
                  />
                </div>
              )}

              {/* Texto do enunciado + imagem no meio */}
              {q.imagem && q.imagemPosicao === 'meio' ? (
                <>
                  <span className="inline whitespace-pre-wrap">{partesEnunciado?.antes ?? enunciadoTexto}</span>
                  {q.imagem && (
                    <span
                      className="questao-imagem-meio"
                      style={{
                        ...imagemContainerStyleBase,
                        display: q.imgAlign === 'center' ? 'block' : 'inline-block'
                      }}
                    >
                      <img
                        src={q.imagem || ''}
                        style={{
                          width: q.imgWidth,
                          maxWidth: 'none',
                          height: 'auto',
                          display: 'block'
                        }}
                        className="rounded shadow-sm border border-slate-100"
                        alt="Questão"
                      />
                    </span>
                  )}
                  <span className="inline whitespace-pre-wrap">{partesEnunciado?.depois ?? ''}</span>
                </>
              ) : (
                <span className="inline whitespace-pre-wrap">{enunciadoTexto}</span>
              )}

              {/* Imagem depois do texto */}
              {q.imagem && q.imagemPosicao === 'depois' && (
                <div className="my-2" style={{ ...imagemContainerStyleBase }}>
                  <img
                    src={q.imagem || ''}
                    style={{
                      width: q.imgWidth,
                      maxWidth: 'none',
                      display: 'block',
                      margin: q.imgAlign === 'center' ? '0 auto' : '0'
                    }}
                    className="rounded shadow-sm border border-slate-100"
                    alt="Questão"
                  />
                </div>
              )}
            </div>

            {/* Espaço para Limpar Floats */}
            <div className="clear-both"></div>

            {/* Renderização das respostas na folha */}
            {q.tipo === TIPOS_QUESTAO.COLUNAS && (
              <div className="w-full mt-4">
                <div className="grid gap-0 border-t border-l border-black" style={{ gridTemplateColumns: `repeat(${q.colunas?.length || 1}, 1fr)` }}>
                  {q.colunas?.map((col, i) => (
                    <div key={i} className="font-bold text-center border-b border-r border-black p-2 bg-slate-50 relative print:bg-transparent">
                      {col || `Coluna ${i + 1}`}
                    </div>
                  ))}
                  {Array.from({ length: q.linhasColunas || 3 }).map((_, r) => (
                    <React.Fragment key={r}>
                      {q.colunas?.map((__, c) => (
                        <div key={`${r}-${c}`} className="h-10 border-b border-r border-black"></div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            {q.tipo === TIPOS_QUESTAO.OBJETIVA && (
              <div className="grid gap-3 ml-2">
                {q.opcoes.map((opt: any, i: any) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="w-7 h-7 border-[1.5pt] border-black rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="pt-1">{opt || "________________________________"}</span>
                  </div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.DISCURSIVA && (
              <div className="space-y-4 pt-2">
                {Array.from({ length: q.linhasResposta }).map((_, i) => (
                  <div key={i} className="border-b-2 border-black/30 w-full" style={{ minHeight: '1.5rem' }}></div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.COMPLETAR && (
              <div className="space-y-3 ml-2">
                {(q.lacunas || ['', '', '']).map((lacuna: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold">{i + 1}.</span>
                    <div className="flex-1 border-b-2 border-black/30" style={{ minHeight: '1.5rem' }}>
                      <span className="text-sm">{lacuna || "________________"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.ASSOCIACAO && (
              <div className="space-y-3 ml-2">
                {(q.itensAssociacao || [{ esquerda: '', direita: '' }]).map((item: { esquerda: string, direita: string }, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold min-w-[30px]">{i + 1}.</span>
                    <span className="flex-1 border-b border-dotted border-black/30">{item.esquerda || "________________"}</span>
                    <span className="text-xs font-bold">↔</span>
                    <span className="flex-1 border-b border-dotted border-black/30">{item.direita || "________________"}</span>
                  </div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.ORDENACAO && (
              <div className="space-y-3 ml-2">
                {(q.itensOrdenacao || ['', '', '']).map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 border-[1.5pt] border-black rounded flex items-center justify-center text-xs font-black">{i + 1}</div>
                    <span className="flex-1 border-b border-dotted border-black/30">{item || "________________"}</span>
                  </div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.MULTIPLA_ESCOLHA && (
              <div className="grid gap-3 ml-2">
                {q.opcoes.map((opt: string, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="w-7 h-7 border-[1.5pt] border-black rounded-full flex items-center justify-center text-xs font-black shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="pt-1">{opt || "________________________________"}</span>
                  </div>
                ))}
              </div>
            )}

            {q.tipo === TIPOS_QUESTAO.VF && (
              <div className="space-y-3 ml-2">
                {(q.alternativasVF || ['Verdadeiro', 'Falso']).map((alt: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-7 border-[1.5pt] border-black rounded flex items-center justify-center text-[12px] font-black shrink-0">( &nbsp;&nbsp;&nbsp; )</div>
                    <span className="pt-1">{alt || "________________________________"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const recalcularPaginasPorAltura = useCallback(() => {
    const pageEl = measurePageRef.current;
    const questionsEl = measureQuestionsRef.current;

    if (!pageEl || !questionsEl) {
      setPaginas([questoes.map((_, i) => i)]);
      return;
    }

    const pageRect = pageEl.getBoundingClientRect();
    const pageStyle = getComputedStyle(pageEl);
    const paddingTop = parseFloat(pageStyle.paddingTop || '0');
    const paddingBottom = parseFloat(pageStyle.paddingBottom || '0');
    const contentHeight = pageRect.height - paddingTop - paddingBottom;

    let headerBlockHeight = 0;
    const headerEl = measureHeaderRef.current;
    if (headerEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const headerStyle = getComputedStyle(headerEl);
      const marginBottom = parseFloat(headerStyle.marginBottom || '0');
      headerBlockHeight = headerRect.height + marginBottom;
    }

    const availableFirstPage = Math.max(0, contentHeight - headerBlockHeight);
    const availableOtherPages = Math.max(0, contentHeight);

    const questionsStyle = getComputedStyle(questionsEl);
    const gapPx = parseFloat(questionsStyle.rowGap || '0');

    const nodes = Array.from(pageEl.querySelectorAll<HTMLElement>('[data-measure-question="true"]'));
    const heightsByIndex = new Map<number, number>();
    for (const node of nodes) {
      const idx = Number(node.dataset.index);
      if (!Number.isNaN(idx)) heightsByIndex.set(idx, node.getBoundingClientRect().height);
    }

    const result: number[][] = [];
    let current: number[] = [];
    let used = 0;
    let available = availableFirstPage;

    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      if (!q) continue;

      const h = heightsByIndex.get(i) ?? 0;
      const extraGap = current.length === 0 ? 0 : gapPx;

      if (current.length > 0 && used + extraGap + h > available) {
        result.push(current);
        current = [];
        used = 0;
        available = availableOtherPages;
      }

      current.push(i);
      used += extraGap + h;
    }

    if (current.length > 0) result.push(current);
    if (result.length === 0) result.push([]);

    const key = result.map(p => p.join(',')).join('|');
    if (key !== paginasKeyRef.current) {
      paginasKeyRef.current = key;
      setPaginas(result);
    }
  }, [questoes]);

  useEffect(() => {
    const id = requestAnimationFrame(() => recalcularPaginasPorAltura());
    const pageEl = measurePageRef.current;

    let ro: ResizeObserver | null = null;
    if (pageEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => recalcularPaginasPorAltura());
      ro.observe(pageEl);
    }

    return () => {
      cancelAnimationFrame(id);
      ro?.disconnect();
    };
  }, [recalcularPaginasPorAltura, config.fontSize, config.margem, config.logoUrl]);

  const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          atualizarQuestao(id, 'imagem', ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans text-slate-900">
      <aside className="w-full lg:w-[450px] bg-white border-r border-slate-200 shadow-2xl z-20 print:hidden flex flex-col h-[calc(100vh)] lg:sticky lg:top-16">
        <div className="p-5 bg-primary text-primary-foreground flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">EDITOR</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {isSaving && <div className="flex items-center text-[10px] font-bold bg-white/10 px-2 py-1 rounded animate-pulse">SALVANDO...</div>}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2">
              <button
                onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                className="p-1.5 hover:bg-white/20 rounded transition-all"
                title="Diminuir zoom"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-bold min-w-[35px] text-center">{previewZoom}%</span>
              <button
                onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                className="p-1.5 hover:bg-white/20 rounded transition-all"
                title="Aumentar zoom"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 p-2.5 rounded-xl transition-all shadow-md active:scale-95"
              title="Imprimir"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar pb-32">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter">
              <Settings size={16} /> <span>Configurações Gerais</span>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Matéria" className="input-pro" value={config.disciplina} onChange={e => setConfig({ ...config, disciplina: e.target.value })} />
                <input type="text" placeholder="Professor" className="input-pro" value={config.professor} onChange={e => setConfig({ ...config, professor: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Fonte</label>
                  <select className="input-pro text-xs" value={config.fontSize} onChange={e => setConfig({ ...config, fontSize: e.target.value })}>
                    <option value="10pt">10pt (Pequena)</option>
                    <option value="11pt">11pt (Padrão)</option>
                    <option value="12pt">12pt (Grande)</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="input-pro flex items-center justify-center cursor-pointer hover:bg-muted/50 gap-2 overflow-hidden text-ellipsis whitespace-nowrap transition-colors">
                    <ImageIcon size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-foreground">LOGO</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result && typeof ev.target.result === 'string') {
                            setConfig({ ...config, logoUrl: ev.target.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Lista de Questões */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter">
                <FileText size={16} /> <span>Questões do Exame</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={minimizarTodas}
                  className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors"
                  title="Minimizar todas"
                >
                  MINIMIZAR
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={expandirTodas}
                  className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors"
                  title="Expandir todas"
                >
                  EXPANDIR
                </button>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {questoes.reduce((acc, q) => acc + (q.valor || 0), 0).toFixed(1).replace('.', ',')} PTS
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-black">
                  {questoes.length} QUESTÕES
                </span>
              </div>
            </div>

            {questoes.map((q: Questao, index) => (
              <div
                key={q.id}
                className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Header Questão */}
                <div
                  className="bg-muted/50 px-4 py-3 border-b border-border flex justify-between items-center cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleMinimizar(q.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-lg text-[10px] font-black">
                      {index + 1}
                    </span>
                    <select
                      className="bg-transparent text-[10px] font-bold uppercase text-muted-foreground outline-none focus:text-primary"
                      value={q.tipo}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => atualizarQuestao(q.id, 'tipo', e.target.value as TipoQuestao)}
                    >
                      {Object.values(TIPOS_QUESTAO).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {q.valor ? Number(q.valor).toFixed(1).replace('.', ',') : "0,0"} pts
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMinimizar(q.id); }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all"
                      title={questoesMinimizadas.has(q.id) ? "Expandir" : "Minimizar"}
                    >
                      {questoesMinimizadas.has(q.id) ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moverQuestao(index, 'up'); }}
                        disabled={index === 0}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moverQuestao(index, 'down'); }}
                        disabled={index === questoes.length - 1}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); duplicarQuestao(q); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all" title="Duplicar"><Copy size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); removerQuestao(q.id); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-all" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>

                {!questoesMinimizadas.has(q.id) && (
                  <div className="p-4 space-y-4">
                    {/* Info da Questão (Valor) */}
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border">
                      <Award size={14} className="text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground">Valor:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        placeholder="1.0"
                        className="bg-transparent w-16 text-[11px] font-bold outline-none text-foreground placeholder:text-muted-foreground text-center"
                        value={q.valor}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          atualizarQuestao(q.id, 'valor', val);
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">pts</span>
                    </div>

                    {/* Controles de Formatação do Enunciado */}
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Formatação:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => atualizarQuestao(q.id, 'enunciadoTextAlign', 'left')}
                          className={`p-1.5 rounded transition-colors ${q.enunciadoTextAlign === 'left' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                          title="Alinhar à esquerda"
                        >
                          <AlignLeft size={14} />
                        </button>
                        <button
                          onClick={() => atualizarQuestao(q.id, 'enunciadoTextAlign', 'center')}
                          className={`p-1.5 rounded transition-colors ${q.enunciadoTextAlign === 'center' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                          title="Centralizar"
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          onClick={() => atualizarQuestao(q.id, 'enunciadoTextAlign', 'right')}
                          className={`p-1.5 rounded transition-colors ${q.enunciadoTextAlign === 'right' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                          title="Alinhar à direita"
                        >
                          <AlignRight size={14} />
                        </button>
                        <button
                          onClick={() => atualizarQuestao(q.id, 'enunciadoTextAlign', 'justify')}
                          className={`p-1.5 rounded transition-colors ${q.enunciadoTextAlign === 'justify' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                          title="Justificar"
                        >
                          <AlignLeft size={14} className="rotate-180" />
                        </button>
                      </div>
                      <div className="w-px h-4 bg-border"></div>
                      <button
                        onClick={() => atualizarQuestao(q.id, 'enunciadoFontWeight', q.enunciadoFontWeight === 'bold' ? 'normal' : 'bold')}
                        className={`p-1.5 rounded transition-colors ${q.enunciadoFontWeight === 'bold' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        title="Negrito"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => atualizarQuestao(q.id, 'enunciadoFontStyle', q.enunciadoFontStyle === 'italic' ? 'normal' : 'italic')}
                        className={`p-1.5 rounded transition-colors ${q.enunciadoFontStyle === 'italic' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        title="Itálico"
                      >
                        <Italic size={14} />
                      </button>
                    </div>

                    <textarea
                      placeholder="Enunciado da questão..."
                      className="w-full p-3 bg-muted/30 rounded-xl text-sm border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all min-h-[80px] text-foreground placeholder:text-muted-foreground"
                      value={q.enunciado}
                      onChange={e => atualizarQuestao(q.id, 'enunciado', e.target.value)}
                    />

                    {/* Upload de Imagem na Questão */}
                    {!q.imagem ? (
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                          <LucideImage size={16} className="text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload de Imagem</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(q.id, e)} />
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="h-px bg-border flex-1"></div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">OU Link</span>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <input
                          type="text"
                          placeholder="Cole o link da imagem aqui..."
                          className="w-full text-xs p-2 bg-muted/30 border border-border rounded-lg outline-none focus:border-primary transition-all"
                          onBlur={(e) => {
                            if (e.target.value) atualizarQuestao(q.id, 'imagem', e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              atualizarQuestao(q.id, 'imagem', e.currentTarget.value);
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-primary/5 p-3 rounded-xl space-y-3 border border-border">
                        <div className="flex items-center gap-3">
                          <img src={q.imagem || ''} className="w-12 h-12 object-cover rounded-lg" alt="Preview" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Posição:</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => atualizarQuestao(q.id, 'imagemPosicao', 'antes')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${q.imagemPosicao === 'antes' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                >
                                  Antes
                                </button>
                                <button
                                  onClick={() => atualizarQuestao(q.id, 'imagemPosicao', 'meio')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${q.imagemPosicao === 'meio' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                >
                                  Meio
                                </button>
                                <button
                                  onClick={() => atualizarQuestao(q.id, 'imagemPosicao', 'depois')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${q.imagemPosicao === 'depois' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                >
                                  Depois
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="650"
                              value={parseInt(q.imgWidth)}
                              onChange={e => atualizarQuestao(q.id, 'imgWidth', `${e.target.value}px`)}
                              className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-2">
                              <div className="flex gap-1">
                                <button onClick={() => atualizarQuestao(q.id, 'imgAlign', 'left')} className={`p-1 rounded transition-colors ${q.imgAlign === 'left' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><AlignLeft size={12} /></button>
                                <button onClick={() => atualizarQuestao(q.id, 'imgAlign', 'center')} className={`p-1 rounded transition-colors ${q.imgAlign === 'center' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><AlignCenter size={12} /></button>
                                <button onClick={() => atualizarQuestao(q.id, 'imgAlign', 'right')} className={`p-1 rounded transition-colors ${q.imgAlign === 'right' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><AlignRight size={12} /></button>
                              </div>
                              <button onClick={() => atualizarQuestao(q.id, 'imagem', null)} className="text-[10px] font-bold text-destructive hover:underline transition-colors">REMOVER</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Renderização condicional de controles baseado no tipo */}
                    {(q.tipo === TIPOS_QUESTAO.OBJETIVA || q.tipo === TIPOS_QUESTAO.MULTIPLA_ESCOLHA) && (
                      <div className="space-y-2">
                        {q.opcoes.map((opt: string, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-primary w-4">{String.fromCharCode(65 + i)}</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={opt}
                              placeholder="Texto da alternativa..."
                              onChange={e => {
                                const newOpts = [...q.opcoes];
                                newOpts[i] = e.target.value;
                                atualizarQuestao(q.id, 'opcoes', newOpts);
                              }}
                            />
                            <button onClick={() => {
                              const newOpts = q.opcoes.filter((_: string, idx: number) => idx !== i);
                              atualizarQuestao(q.id, 'opcoes', newOpts);
                            }} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => atualizarQuestao(q.id, 'opcoes', [...q.opcoes, ''])}
                          className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-[10px] font-black text-primary hover:bg-primary/5 transition-colors"
                        >
                          + ADICIONAR ALTERNATIVA
                        </button>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.DISCURSIVA && (
                      <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <MoveVertical size={14} className="text-primary" />
                          <span className="text-xs font-bold text-foreground">Linhas de resposta</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => atualizarQuestao(q.id, 'linhasResposta', Math.max(1, q.linhasResposta - 1))} className="w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-sm flex items-center justify-center font-bold hover:bg-primary/90 transition-colors">-</button>
                          <span className="text-sm font-black text-primary min-w-[20px] text-center">{q.linhasResposta}</span>
                          <button onClick={() => atualizarQuestao(q.id, 'linhasResposta', q.linhasResposta + 1)} className="w-6 h-6 bg-primary text-primary-foreground rounded-full shadow-sm flex items-center justify-center font-bold hover:bg-primary/90 transition-colors">+</button>
                        </div>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.VF && (
                      <div className="space-y-3">
                        {(q.alternativasVF || ['Verdadeiro', 'Falso']).map((alt: string, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-primary w-8">{i + 1}.</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={alt}
                              placeholder={`Texto da alternativa ${i + 1}...`}
                              onChange={e => {
                                const newAlts = [...(q.alternativasVF || ['Verdadeiro', 'Falso'])];
                                newAlts[i] = e.target.value;
                                atualizarQuestao(q.id, 'alternativasVF', newAlts);
                              }}
                            />
                            {(q.alternativasVF || ['Verdadeiro', 'Falso']).length > 1 && (
                              <button
                                onClick={() => {
                                  const newAlts = (q.alternativasVF || ['Verdadeiro', 'Falso']).filter((_: string, idx: number) => idx !== i);
                                  atualizarQuestao(q.id, 'alternativasVF', newAlts.length > 0 ? newAlts : ['']);
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => atualizarQuestao(q.id, 'alternativasVF', [...(q.alternativasVF || ['Verdadeiro', 'Falso']), ''])}
                          className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-[10px] font-black text-primary hover:bg-primary/5 transition-colors"
                        >
                          + ADICIONAR LACUNA
                        </button>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.COMPLETAR && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Lacunas:</div>
                        {(q.lacunas || ['', '', '']).map((lacuna: string, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-primary w-6">{i + 1}.</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={lacuna}
                              placeholder={`Texto da lacuna ${i + 1}...`}
                              onChange={e => {
                                const newLacunas = [...(q.lacunas || ['', '', ''])];
                                newLacunas[i] = e.target.value;
                                atualizarQuestao(q.id, 'lacunas', newLacunas);
                              }}
                            />
                            <button onClick={() => {
                              const newLacunas = (q.lacunas || ['', '', '']).filter((_: string, idx: number) => idx !== i);
                              atualizarQuestao(q.id, 'lacunas', newLacunas.length > 0 ? newLacunas : ['']);
                            }} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => atualizarQuestao(q.id, 'lacunas', [...(q.lacunas || ['', '', '']), ''])}
                          className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-[10px] font-black text-primary hover:bg-primary/5 transition-colors"
                        >
                          + ADICIONAR LACUNA
                        </button>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.ASSOCIACAO && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Itens de Associação:</div>
                        {(q.itensAssociacao || [{ esquerda: '', direita: '' }]).map((item: { esquerda: string, direita: string }, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-primary w-6">{i + 1}.</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={item.esquerda}
                              placeholder="Item esquerda..."
                              onChange={e => {
                                const newItens = [...(q.itensAssociacao || [{ esquerda: '', direita: '' }])];
                                newItens[i] = { esquerda: e.target.value, direita: newItens[i]?.direita || '' };
                                atualizarQuestao(q.id, 'itensAssociacao', newItens);
                              }}
                            />
                            <span className="text-primary font-bold">↔</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={item.direita}
                              placeholder="Item direita..."
                              onChange={e => {
                                const newItens = [...(q.itensAssociacao || [{ esquerda: '', direita: '' }])];
                                newItens[i] = { esquerda: newItens[i]?.esquerda || '', direita: e.target.value };
                                atualizarQuestao(q.id, 'itensAssociacao', newItens);
                              }}
                            />
                            <button onClick={() => {
                              const newItens = (q.itensAssociacao || [{ esquerda: '', direita: '' }]).filter((_: any, idx: number) => idx !== i);
                              atualizarQuestao(q.id, 'itensAssociacao', newItens.length > 0 ? newItens : [{ esquerda: '', direita: '' }]);
                            }} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => atualizarQuestao(q.id, 'itensAssociacao', [...(q.itensAssociacao || [{ esquerda: '', direita: '' }]), { esquerda: '', direita: '' }])}
                          className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-[10px] font-black text-primary hover:bg-primary/5 transition-colors"
                        >
                          + ADICIONAR ITEM
                        </button>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.ORDENACAO && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Itens para Ordenar:</div>
                        {(q.itensOrdenacao || ['', '', '']).map((item: string, i: number) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-primary w-6">{i + 1}.</span>
                            <input
                              className="flex-1 bg-muted/50 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary border border-border"
                              value={item}
                              placeholder={`Item ${i + 1}...`}
                              onChange={e => {
                                const newItens = [...(q.itensOrdenacao || ['', '', ''])];
                                newItens[i] = e.target.value;
                                atualizarQuestao(q.id, 'itensOrdenacao', newItens);
                              }}
                            />
                            <button onClick={() => {
                              const newItens = (q.itensOrdenacao || ['', '', '']).filter((_: string, idx: number) => idx !== i);
                              atualizarQuestao(q.id, 'itensOrdenacao', newItens.length > 0 ? newItens : ['']);
                            }} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                          </div>
                        ))}
                        <button
                          onClick={() => atualizarQuestao(q.id, 'itensOrdenacao', [...(q.itensOrdenacao || ['', '', '']), ''])}
                          className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-[10px] font-black text-primary hover:bg-primary/5 transition-colors"
                        >
                          + ADICIONAR ITEM
                        </button>
                      </div>
                    )}

                    {q.tipo === TIPOS_QUESTAO.COLUNAS && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Linhas:</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              className="w-16 p-1 bg-white border border-border rounded text-center font-bold outline-none focus:border-primary"
                              value={q.linhasColunas || 3}
                              onChange={e => atualizarQuestao(q.id, 'linhasColunas', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <button
                            onClick={() => atualizarQuestao(q.id, 'colunas', [...(q.colunas || ['Coluna 1']), `Coluna ${(q.colunas?.length || 0) + 1}`])}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                          >
                            + Adicionar Coluna
                          </button>
                        </div>

                        <div className="grid gap-2">
                          {(q.colunas || ['']).map((col: string, i: number) => (
                            <div key={i} className="flex gap-2 items-center">
                              <span className="text-[10px] font-black text-muted-foreground w-6">C{i + 1}</span>
                              <input
                                className="flex-1 input-pro py-2"
                                value={col}
                                placeholder="Título da coluna..."
                                onChange={e => {
                                  const newCols = [...(q.colunas || [])];
                                  newCols[i] = e.target.value;
                                  atualizarQuestao(q.id, 'colunas', newCols);
                                }}
                              />
                              <button
                                onClick={() => {
                                  const newCols = (q.colunas || []).filter((_, idx) => idx !== i);
                                  atualizarQuestao(q.id, 'colunas', newCols.length ? newCols : ['']);
                                }}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* Floating Action Button para Nova Questão */}
        <div className="relative bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none border-t border-slate-300">
          <div className="grid grid-cols-2 gap-2 pointer-events-auto">
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.DISCURSIVA)}
              className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
            >
              <Type size={16} /> DISCURSIVA
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.OBJETIVA)}
              className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
            >
              <CheckSquare size={16} /> OBJETIVA
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.VF)}
              className="flex items-center justify-center gap-2 py-3 bg-primary/80 text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/70 transform hover:-translate-y-0.5 transition-all"
            >
              <CheckSquare size={16} /> V/F
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.COLUNAS)}
              className="flex items-center justify-center gap-2 py-3 bg-primary/80 text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/70 transform hover:-translate-y-0.5 transition-all"
            >
              <Layout size={16} /> COLUNAS
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.COMPLETAR)}
              className="flex items-center justify-center gap-2 py-3 bg-primary/60 text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/50 transform hover:-translate-y-0.5 transition-all"
            >
              <FileText size={16} /> COMPLETAR
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.ASSOCIACAO)}
              className="flex items-center justify-center gap-2 py-3 bg-primary/60 text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/50 transform hover:-translate-y-0.5 transition-all"
            >
              <RotateCw size={16} /> ASSOCIAÇÃO
            </button>
            <button
              onClick={() => adicionarQuestao(TIPOS_QUESTAO.ORDENACAO)}
              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-primary/60 text-primary-foreground rounded-xl font-bold text-xs shadow-lg hover:bg-primary/50 transform hover:-translate-y-0.5 transition-all"
            >
              <MoveVertical size={16} /> ORDENAÇÃO
            </button>
          </div>
        </div>
      </aside>

      {/* Medição offscreen para paginação por altura (não imprime) */}
      <div className="print:hidden fixed left-[-10000px] top-0 opacity-0 pointer-events-none" aria-hidden="true">
        <div
          ref={measurePageRef}
          style={{
            width: '210mm',
            height: '297mm',
            padding: config.margem,
            fontSize: config.fontSize,
            lineHeight: '1.5',
            color: '#1a1a1a',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <header ref={measureHeaderRef} className="border-[2pt] border-black p-1 mb-10 rounded-4xl">
            <div className="flex gap-2 items-center">
              {config.logoUrl ? (
                <img src={config.logoUrl} className="w-42 h-42 object-contain" alt="Logo" />
              ) : (
                <div className="w-42 h-42 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 rounded text-slate-400 text-[10px] text-center p-2 font-bold uppercase">
                  Logo da Escola
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-12 gap-y-4 text-[20px]">
                  <div className="col-span-7 flex gap-2">
                    <span className="whitespace-nowrap">Aluno(a):</span>
                    <div className="flex-1">__________________________________________________</div>
                  </div>
                  <div className="col-span-11 flex gap-2">
                    <div className="col-span-4 flex gap-2">
                      <span>Curso:</span>
                      <div className="flex-1">_____________________</div>
                    </div>
                    <span>Pró:</span>
                    <div className="flex-1">__________________________</div>
                  </div>
                  <div className="col-span-11 flex gap-2">
                    <span>Data:</span>
                    <div className="flex-1">_____ /_____ /_____</div>
                    <div className='flex gap-20'>
                      <span>III Ciclo</span>
                      <span>Grupo 05</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div ref={measureQuestionsRef} className="flex flex-col gap-12">
            {questoes.map((q, i) => (
              <React.Fragment key={q.id}>
                {renderQuestaoPreview(q, i, i)}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="printable-area flex-1 flex flex-col items-center bg-slate-200 p-10 overflow-y-auto custom-scrollbar print:p-0 print:bg-white gap-6">
        {(paginas.length ? paginas : [questoes.map((_, i) => i)]).map((pageItems, pageIndex) => {
          return (
            <div
              key={pageIndex}
              className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col text-black print:shadow-none transition-all duration-500 print-page"
              style={{
                width: '210mm',
                height: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                padding: '8mm',
                fontSize: config.fontSize,
                lineHeight: '1.5',
                color: '#1a1a1a',
                position: 'relative',
                boxSizing: 'border-box',
                border: '1px solid rgba(148, 163, 184, 0.65)',
                borderRadius: '14px',
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${((previewZoom / 100) - 1) * 297}mm`,
                '--print-margin': '8mm',
                '--page-margin': '8mm',
                pageBreakAfter: pageIndex < (paginas.length ? paginas.length : 1) - 1 ? 'always' : 'auto'
              } as React.CSSProperties & { '--print-margin': string; '--page-margin': string }}
            >
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="preview-guides absolute inset-0 border border-slate-400/60 rounded-[14px]"></div>
                <div
                  className="absolute border-3 border-black rounded-4xl"
                  style={{ inset: 'var(--page-margin)', top: '5mm', left: '5mm', right: '5mm', bottom: '5mm' }}
                ></div>
              </div>

              <div className="relative z-10">
                {pageIndex === 0 && (
                  <header className="border-[2pt] border-black p-1 mb-10 rounded-4xl">
                    <div className="flex gap-2 items-center">
                      {config.logoUrl ? (
                        <img src={config.logoUrl} className="w-42 h-42 object-contain" alt="Logo" />
                      ) : (
                        <div className="w-42 h-42 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 rounded text-slate-400 text-[10px] text-center p-2 font-bold uppercase print:hidden">
                          Logo da Escola
                        </div>
                      )}

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-12 gap-y-4 text-[20px]">
                          <div className="col-span-7 flex gap-2">
                            <span className="whitespace-nowrap">Aluno(a):</span>
                            <div className="flex-1">__________________________________________________</div>
                          </div>
                          <div className="col-span-11 flex gap-2">
                            <div className="col-span-4 flex gap-2">
                              <span>Curso:</span>
                              <div className="flex-1">_____________________</div>
                            </div>
                            <span>Pró:</span>
                            <div className="flex-1">__________________________</div>
                          </div>
                          <div className="col-span-11 flex gap-2">
                            <span>Data:</span>
                            <div className="flex-1">_____ /_____ /_____</div>
                            <div className='flex gap-20'>
                              <span>III Ciclo</span>
                              <span>Grupo 05</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </header>
                )}

                {/* Conteúdo das Questões */}
                <div className="flex-1">
                  <div className="flex flex-col gap-12">
                    {pageItems.map((globalIndex: number) => {
                      const q = questoes[globalIndex];
                      if (!q) return null;
                      return (
                        <React.Fragment key={q.id}>
                          {renderQuestaoPreview(q, globalIndex)}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Esconde absolutamente tudo: header do site, menus, rodapés do sistema */
          body * {
            visibility: hidden;
          }

          /* Torna visível apenas o container da folha (main) e seus filhos */
          .printable-area, .printable-area * {
            visibility: visible;
          }

          /* Posiciona a área de impressão no topo esquerdo absoluto */
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            margin: 0;
            padding: 0;
            background: white !important;
          }

          /* Garante que cada página mantenha as margens configuradas */
          .print-page {
            box-sizing: border-box;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: visible !important;
            padding: var(--print-margin, 15mm) !important;
            border: none !important;
            outline: none !important;
            border-radius: 0 !important;
            page-break-after: always;
            break-after: page;
          }

          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* A partir da segunda página, aplica margem */
          .print-page:not(:first-of-type) {
            padding: var(--print-margin, 15mm) !important;
          }

          /* Cada nova página deve ter as mesmas margens */
          @page {
            margin: 0;
            size: A4;
          }

          /* A partir da segunda página no print */
          @page :nth-of-type(n+2) {
            margin: 0;
            size: A4;
          }

          /* Permite que questões quebrem naturalmente entre páginas */
          .questao-container {
            break-inside: auto;
            page-break-inside: auto;
            margin-bottom: 1rem;
            padding-left: 0;
            padding-right: 0;
          }

          /* Permite que linhas de resposta quebrem entre páginas */
          .questao-container .space-y-4 {
            break-inside: auto;
            page-break-inside: auto;
          }

          /* Protege apenas cada linha individual contra quebra no meio */
          .questao-container .space-y-4 > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Permite que o grid de opções quebre entre páginas */
          .questao-container .grid {
            break-inside: auto;
            page-break-inside: auto;
          }

          /* Protege cada alternativa individual contra quebra no meio */
          .questao-container .grid > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Permite que o enunciado quebre naturalmente */
          .break-inside-avoid-page {
            break-inside: auto;
            page-break-inside: auto;
          }

          /* Evita que imagens sejam cortadas ao quebrar página */
          .questao-container img {
            page-break-inside: avoid;
            break-inside: avoid;
            max-width: 100%;
            height: auto;
          }

          /* Remove sombras e decorações de tela no papel */
          .print-no-shadow {
            shadow: none !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Esconde a sidebar de edição explicitamente */
          aside, button, .print\\:hidden {
            display: none !important;
          }

          main {
            background: white !important;
            padding: 0 !important;
            display: block !important;
            margin: 0 !important;
          }

          .shadow-2xl, .shadow-xl {
            shadow: none !important;
            box-shadow: none !important;
          }

          /* Remove transform do zoom na impressão */
          .print-page {
            transform: none !important;
            margin-bottom: 0 !important;
          }
        }

        @media print {
          .preview-guides {
            display: none !important;
          }
        }

        .input-pro {
          width: 100%;
          padding: 12px 16px;
          background-color: hsl(var(--muted) / 0.3);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid transparent;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: hsl(var(--foreground));
        }

        .input-pro:focus {
          background-color: hsl(var(--background));
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 10px 15px -3px hsl(var(--primary) / 0.1);
        }

        .input-pro::placeholder {
          color: hsl(var(--muted-foreground));
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default GeradorDeProvasPro;