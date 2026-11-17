import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import DroneShowcase from './DroneShowcase'
import {
  isSupabaseConfigured,
  supabase,
} from './lib/supabase'
import './App.css'

const SESSION_KEY = 'aeropulse-authenticated'
const CASE_PASSWORD = import.meta.env.VITE_CASE_PASSWORD?.trim() || 'gohobby'
const CURRENT_YEAR = new Date().getFullYear()

type Lead = {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  classification: 'quente' | 'morno' | 'frio' | 'na'
  status: string
  reason: string
}

type Feedback = {
  type: 'success' | 'error'
  message: string
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="AeroPulse - início" className="brand" to="/">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 42 36" fill="none">
          <path d="M4 28 18 5l19 26H25l-7-10-6 10H4Z" fill="currentColor" />
          <path d="M3 25c7-8 17-11 34-9-8 1-15 4-22 11" stroke="#00E676" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-word">
          Aero<span>Pulse</span>
          <small>DRONES · MAPEAMENTO · TELEMETRIA</small>
        </span>
      )}
    </Link>
  )
}

function PublicHeader() {
  return (
    <header className="site-header">
      <Logo />
      <nav className="header-nav" aria-label="Navegação principal">
        <a href="#solucoes">Soluções</a>
        <a href="#sobre">Sobre nós</a>
      </nav>
      <Link className="button button-quiet header-login" to="/painel">
        <LockKeyhole size={15} />
        Área do cliente
        <ArrowUpRight size={14} />
      </Link>
    </header>
  )
}

function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    const formElement = event.currentTarget

    const formData = new FormData(formElement)
    const payload = {
      nome: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      telefone: String(formData.get('phone') ?? '').trim(),
      empresa: String(formData.get('company') ?? '').trim(),
      cargo: String(formData.get('role') ?? '').trim(),
    }

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim()
    if (!webhookUrl) {
      setFeedback({
        type: 'error',
        message: 'A URL do webhook não foi carregada. Configure VITE_N8N_WEBHOOK_URL e reinicie ou reconstrua a aplicação.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`O webhook respondeu com status ${response.status}.`)
      }

      formElement.reset()
      setFeedback({
        type: 'success',
        message: 'Recebemos seus dados. Em breve, nosso time entrará em contato.',
      })
    } catch (error) {
      console.error('Falha ao enviar lead para o webhook:', error)
      setFeedback({
        type: 'error',
        message: 'Não foi possível enviar seus dados agora. Verifique sua conexão e tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <form className="lead-form" onSubmit={handleSubmit} noValidate>
    <div className="form-grid">
      <label className="field">
        <span>Nome completo</span>
        <input
          autoComplete="name"
          name="name"
          placeholder="Como podemos te chamar?"
        />
      </label>
      <label className="field">
        <span>E-mail profissional</span>
        <input
          autoComplete="email"
          name="email"
          placeholder="voce@empresa.com.br"
          type="text"
        />
      </label>
      <label className="field">
        <span>Telefone</span>
        <input
          autoComplete="tel"
          name="phone"
          placeholder="(11) 99999-9999"
          type="tel"
        />
      </label>
      <label className="field">
        <span>Empresa</span>
        <input
          autoComplete="organization"
          name="company"
          placeholder="Nome da empresa"
        />
      </label>
      <label className="field field-wide">
        <span>Cargo</span>
        <input
          autoComplete="organization-title"
          name="role"
          placeholder="Ex.: Gerente de operações"
        />
      </label>
    </div>
      {feedback && (
        <div className={`form-feedback ${feedback.type}`} role="status" aria-live="polite">
          {feedback.type === 'success' ? <Check size={17} /> : <CircleAlert size={17} />}
          <span>{feedback.message}</span>
        </div>
      )}
      <button className="button button-primary submit-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Enviando...' : 'Falar com um especialista'}
        {isSubmitting ? <RefreshCw className="spin" size={17} /> : <ArrowRight size={17} />}
      </button>
      <p className="form-privacy">
        <ShieldCheck size={14} />
        Seus dados são tratados com segurança e usados apenas para este contato.
      </p>
    </form>
  )
}

function LandingPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="hero-section" id="sobre">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> INTELIGÊNCIA AÉREA, DECISÕES MELHORES</div>
            <h1>Veja seu negócio<br />de um <span>novo ângulo.</span></h1>
            <p className="hero-description">
              Tecnologia aérea de precisão para transformar dados em decisões
              mais inteligentes. Seu próximo grande insight começa aqui.
            </p>
            <a className="hero-link" href="#contato">
              Descubra o que é possível <ArrowDown size={16} />
            </a>
            <div className="hero-proof">
              <span className="proof-icon"><Check size={15} /></span>
              <span><strong>Precisão em cada detalhe</strong><small>Mapeamento e telemetria de ponta a ponta</small></span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Vitrine 3D do drone DJI Mavic 3">
            <div className="visual-grid" />
            <div className="radar radar-one" />
            <div className="radar radar-two" />
            <div className="visual-scanline" />
            <div className="visual-label label-top"><span className="pulse-dot" /> LIVE TELEMETRY <strong>99.8%</strong></div>
            <div className="drone-orbit">
              <span className="orbit-line orbit-line-one" />
              <span className="orbit-line orbit-line-two" />
              <DroneShowcase />
            </div>
            <div className="drone-model-hint">MODELO 3D <span>·</span> ARRASTE PARA GIRAR</div>
            <div className="visual-label label-bottom"><span className="coordinate-icon">⌖</span> 23°33'01.3"S&nbsp;&nbsp; 46°38'02.1"W</div>
            <div className="visual-caption">
              <span className="caption-line" />
              <span>TECNOLOGIA DE PRECISÃO <strong>EM MOVIMENTO</strong></span>
            </div>
            <div className="visual-corner corner-tl" />
            <div className="visual-corner corner-br" />
          </div>
          <div className="hero-stats">
            <div><strong>+2.4<span>k</span></strong><small>Missões realizadas</small></div>
            <div><strong>98<span>%</span></strong><small>Precisão de mapeamento</small></div>
            <div><strong>360<span>°</span></strong><small>Visão completa</small></div>
            <p>Dados confiáveis.<br /><span>Decisões que avançam.</span></p>
          </div>
        </section>

        <section className="contact-section" id="contato">
          <div className="contact-intro" id="solucoes">
            <div className="eyebrow"><span className="eyebrow-slash">/</span> VAMOS CONVERSAR</div>
            <h2>O próximo passo<br />começa <span>aqui.</span></h2>
            <p>Conte um pouco sobre você e sua empresa. Nosso time vai ajudar a encontrar a solução certa para o seu desafio.</p>
            <div className="contact-note">
              <div className="note-icon"><Clock3 size={17} /></div>
              <span><strong>Retorno rápido</strong><small>Um especialista entra em contato em até 1 dia útil.</small></span>
            </div>
          </div>
          <div className="contact-card">
            <div className="card-heading">
              <div>
                <span className="card-kicker">CONTATO COMERCIAL</span>
                <h3>Vamos tirar suas ideias do papel.</h3>
              </div>
              <span className="card-spark"><Sparkles size={18} /></span>
            </div>
            <LeadForm />
          </div>
        </section>

        <section className="bottom-cta">
          <span className="cta-orbit" aria-hidden="true" />
          <p>TECNOLOGIA <span>·</span> PRECISÃO <span>·</span> INOVAÇÃO</p>
          <h2>Visão de cima.<br /><span>Impacto lá na frente.</span></h2>
          <a className="button button-primary" href="#contato">Vamos começar <ArrowRight size={16} /></a>
        </section>
      </main>
      <footer className="site-footer">
        <Logo compact />
        <span>© {CURRENT_YEAR} AeroPulse. Todos os direitos reservados.</span>
        <Link to="/painel">Acesso interno <ArrowUpRight size={13} /></Link>
      </footer>
    </div>
  )
}

function AccessDenied() {
  return (
    <main className="gate-page">
      <div className="gate-card denied-card">
        <Logo />
        <div className="gate-symbol denied"><LockKeyhole size={25} /></div>
        <div className="eyebrow centered">ÁREA RESTRITA</div>
        <h1>Acesso <span>negado.</span></h1>
        <p>Esta página é exclusiva para a equipe AeroPulse. Faça login para continuar.</p>
        <Link className="button button-primary full-button" to="/login">
          Entrar na área interna <ArrowRight size={16} />
        </Link>
        <Link className="back-link" to="/"><ArrowLeft size={14} /> Voltar para o início</Link>
      </div>
    </main>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (username.trim().toLowerCase() !== 'gohobby' || password !== CASE_PASSWORD) {
      setError('Usuário ou senha inválidos')
      return
    }
    sessionStorage.setItem(SESSION_KEY, 'true')
    navigate('/painel', { replace: true })
  }

  return (
    <main className="gate-page">
      <div className="gate-card login-card">
        <Link aria-label="Voltar para o início" className="gate-back" to="/"><ArrowLeft size={17} /></Link>
        <Logo />
        <div className="gate-symbol"><ShieldCheck size={25} /></div>
        <div className="eyebrow centered">ACESSO INTERNO</div>
        <h1>Bem-vindo <span>de volta.</span></h1>
        <p>Entre com seu usuário e senha para acompanhar os leads recebidos.</p>
        <form className="login-form" onSubmit={handleLogin}>
          <label className="field">
            <span>Usuário</span>
            <input
              autoComplete="username"
              autoFocus
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              placeholder="Digite seu usuário"
              required
              type="text"
              value={username}
            />
          </label>
          <label className="field">
            <span>Senha de acesso</span>
            <div className="password-field">
              <input
                autoComplete="current-password"
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Digite sua senha"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          {error && <div className="form-feedback error" role="alert"><CircleAlert size={16} />{error}</div>}
          <button className="button button-primary full-button" type="submit">
            Acessar painel <ArrowRight size={16} />
          </button>
        </form>
        <div className="login-security"><LockKeyhole size={13} /> Acesso protegido para uso interno</div>
      </div>
    </main>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
    ? children
    : <AccessDenied />
}

function readValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = String(value).trim()
      if (normalized) return normalized
    }
  }
  return ''
}

function normalizeClassification(value: string): Lead['classification'] {
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (normalized.includes('quente') || normalized.includes('hot')) return 'quente'
  if (normalized.includes('morno') || normalized.includes('warm')) return 'morno'
  if (normalized.includes('frio') || normalized.includes('cold')) return 'frio'
  return 'na'
}

function normalizeStatus(value: string) {
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_-]/g, ' ')
  if (normalized.includes('crm') || normalized.includes('enviado')) return 'Enviado ao CRM'
  if (normalized.includes('nutri') || normalized.includes('nurtur')) return 'Nutrição'
  if (normalized.includes('duplic')) return 'Duplicado'
  if (normalized.includes('invalid') || normalized.includes('inval')) return 'Inválido'
  if (normalized.includes('erro') || normalized.includes('error') || normalized.includes('falh')) return 'Erro'
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pendente'
}

function mapLead(record: Record<string, unknown>, index: number): Lead {
  const classification = readValue(record, [
    'classification', 'classificacao', 'classificação', 'temperature', 'temperatura',
    'lead_classification', 'lead_temperature', 'score_category',
  ])
  const status = readValue(record, ['status_final', 'final_status', 'status', 'lead_status', 'situacao', 'situação'])
  const reason = readValue(record, [
    'detalhes_log', 'details_log', 'motivo_erro', 'motivoErro', 'motivo',
    'reason', 'invalid_reason', 'validation_error', 'error_reason',
  ])
  return {
    id: readValue(record, ['id', 'uuid']) || `${index}`,
    createdAt: readValue(record, ['created_at', 'createdAt', 'data_criacao', 'data', 'received_at', 'timestamp']),
    name: readValue(record, ['name', 'nome', 'full_name', 'nome_completo']) || 'Sem nome',
    email: readValue(record, ['email', 'e_mail']),
    phone: readValue(record, ['phone', 'telefone', 'celular']),
    company: readValue(record, ['company', 'empresa', 'company_name']) || '—',
    role: readValue(record, ['role', 'cargo', 'job_title', 'position']) || '—',
    classification: normalizeClassification(classification),
    status: normalizeStatus(status),
    reason,
  }
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date).replace('.', '')
}

async function fetchSupabaseLeads(): Promise<Lead[]> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.')
  }

  const { data, error } = await supabase.from('leads').select('*').limit(500)
  if (error) throw new Error(error.message)

  const records = Array.isArray(data)
    ? data.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    : []
  return records.map(mapLead).sort((a, b) => {
    const left = new Date(a.createdAt).getTime()
    const right = new Date(b.createdAt).getTime()
    if (Number.isNaN(left) || Number.isNaN(right)) return 0
    return right - left
  })
}

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [requestError, setRequestError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setRequestError('')
    try {
      setLeads(await fetchSupabaseLeads())
    } catch (error) {
      console.error('Falha ao consultar leads no Supabase:', error)
      setRequestError(error instanceof Error
        ? `Não foi possível carregar os leads: ${error.message}`
        : 'Ocorreu uma falha inesperada ao conectar ao Supabase. Tente novamente.')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let ignore = false
    fetchSupabaseLeads()
      .then((records) => {
        if (!ignore) setLeads(records)
      })
      .catch((error: unknown) => {
        if (ignore) return
        console.error('Falha ao consultar leads no Supabase:', error)
        setRequestError(error instanceof Error
          ? `Não foi possível carregar os leads: ${error.message}`
          : 'Ocorreu uma falha inesperada ao conectar ao Supabase. Tente novamente.')
        setLeads([])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const loadError = isSupabaseConfigured
    ? requestError
    : 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para carregar os leads.'

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesSearch = !term || [lead.name, lead.email, lead.company, lead.role].some((value) => value.toLowerCase().includes(term))
      const matchesFilter = filter === 'todos'
        || (filter === 'quente' && lead.classification === 'quente')
        || (filter === 'morno' && lead.classification === 'morno')
        || (filter === 'frio' && lead.classification === 'frio')
      return matchesSearch && matchesFilter
    })
  }, [filter, leads, search])

  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter((lead) => lead.classification === 'quente').length,
    inCrm: leads.filter((lead) => lead.status === 'Enviado ao CRM').length,
    nurturing: leads.filter((lead) => lead.status === 'Nutrição').length,
  }), [leads])

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/', { replace: true })
  }

  function refreshLeads() {
    void loadLeads()
  }

  return (
    <div className="dashboard-page">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <button aria-label="Fechar menu" className="mobile-menu-close" onClick={() => setMenuOpen(false)}><X size={19} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-card">
          <div className="workspace-avatar">A</div>
          <span><strong>AeroPulse</strong><small>Equipe comercial</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="sidebar-nav" aria-label="Menu do painel">
          <a className="nav-item active" href="#leads"><span className="nav-item-icon"><Filter size={17} /></span> Visão geral <span className="nav-indicator" /></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="pulse-dot" /> SISTEMA OPERACIONAL</div>
          <button className="logout-button" onClick={logout}><LogOut size={16} /> Sair do painel</button>
          <div className="sidebar-user">
            <div className="user-avatar">AP</div>
            <span><strong>Equipe AeroPulse</strong><small>Administrador</small></span>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      {menuOpen && <button aria-label="Fechar menu" className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      <main className="dashboard-main" id="leads">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button aria-label="Abrir menu" className="mobile-menu-open" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
            <div><span className="breadcrumb">AEROPULSE <span>/</span> COMERCIAL</span><h1>Painel de leads</h1></div>
          </div>
          <div className="dashboard-header-right">
            <span className="header-live"><span className="pulse-dot" /> DADOS AO VIVO</span>
            <div className="header-avatar">AP</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div><h2>Visão geral <span className="wave">✳</span></h2><p>Acompanhe seus contatos e oportunidades em um só lugar.</p></div>
            <div className="welcome-actions">
              <button className="button button-outline" disabled={loading || !isSupabaseConfigured} onClick={refreshLeads}><RefreshCw className={loading ? 'spin' : ''} size={15} /> Atualizar</button>
              <Link className="button button-primary compact-button" to="/"><ExternalLink size={15} /> Ver formulário</Link>
            </div>
          </section>

          <section aria-label="Resumo de leads" className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon stat-icon-green"><Mail size={18} /></span>
              <span className="stat-label">Total de leads</span>
              <strong className="stat-value">{loading ? '—' : stats.total}</strong>
              <span className="stat-foot"><span className="pulse-dot" /> Base completa</span>
              <span className="stat-watermark">01</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-icon-orange"><ArrowUpRight size={18} /></span>
              <span className="stat-label">Leads quentes</span>
              <strong className="stat-value">{loading ? '—' : stats.hot}</strong>
              <span className="stat-foot">Alta intenção de compra</span>
              <span className="stat-watermark">02</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-icon-blue"><Check size={18} /></span>
              <span className="stat-label">Enviados ao CRM</span>
              <strong className="stat-value">{loading ? '—' : stats.inCrm}</strong>
              <span className="stat-foot">Distribuídos ao comercial</span>
              <span className="stat-watermark">03</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon stat-icon-purple"><Clock3 size={18} /></span>
              <span className="stat-label">Em nutrição</span>
              <strong className="stat-value">{loading ? '—' : stats.nurturing}</strong>
              <span className="stat-foot">Relacionamento em andamento</span>
              <span className="stat-watermark">04</span>
            </article>
          </section>

          <section className="leads-panel">
            <div className="panel-heading">
              <div><h2>Leads recebidos <span className="lead-count">{leads.length}</span></h2><p>Dados sincronizados com sua base AeroPulse</p></div>
              <div className="panel-sync"><span className="sync-dot" /> SUPABASE <span className="sync-divider">/</span> LIVE</div>
            </div>
            <div className="table-toolbar">
              <div className="search-field"><Search size={16} /><input aria-label="Buscar leads" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, empresa..." value={search} /><kbd>⌘ K</kbd></div>
              <label className="filter-select"><Filter size={15} /><select aria-label="Filtrar por classificação" onChange={(event) => setFilter(event.target.value)} value={filter}><option value="todos">Todas as classificações</option><option value="quente">Quentes</option><option value="morno">Mornos</option><option value="frio">Frios</option></select><ChevronDown size={14} /></label>
            </div>

            {loadError && (
              <div className="dashboard-error" role="alert">
                <CircleAlert size={18} />
                <div><strong>Não foi possível carregar a lista.</strong><p>{loadError}</p><small>Confirme a configuração das variáveis de ambiente e as permissões de leitura da tabela <code>leads</code>.</small></div>
              </div>
            )}

            <div className="table-scroll">
              <table className="leads-table">
                <thead><tr><th>LEAD</th><th>EMPRESA / CARGO</th><th>CLASSIFICAÇÃO</th><th>STATUS FINAL</th><th>DATA DE ENTRADA</th><th aria-label="Ações" /></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan={6}><RefreshCw className="spin" size={18} /> Carregando leads...</td></tr>
                  ) : filteredLeads.length ? filteredLeads.map((lead, index) => (
                    <tr key={`${lead.id}-${index}`}>
                      <td><div className="lead-identity"><span className={`lead-avatar lead-avatar-${index % 5}`}>{lead.name.slice(0, 1).toUpperCase()}</span><span><strong>{lead.name}</strong><small>{lead.email || 'E-mail não informado'}</small></span></div></td>
                      <td><div className="company-cell"><strong>{lead.company}</strong><small>{lead.role}</small></div></td>
                      <td><ClassificationBadge classification={lead.classification} /></td>
                      <td><StatusBadge reason={lead.reason} status={lead.status} /></td>
                      <td><span className="date-cell">{formatDate(lead.createdAt)}</span></td>
                      <td><a aria-label={`Enviar e-mail para ${lead.name}`} aria-disabled={!lead.email} className="row-action" href={lead.email ? `mailto:${lead.email}` : undefined} title={lead.email ? 'Enviar e-mail' : 'Lead sem e-mail'}><ArrowUpRight size={15} /></a></td>
                    </tr>
                  )) : (
                    <tr><td className="table-message empty-message" colSpan={6}>
                      {loadError ? 'Configure a conexão para visualizar os leads.' : <><Search size={18} />Nenhum lead encontrado para esta busca.</>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Exibindo <strong>{loading ? '—' : filteredLeads.length}</strong> de <strong>{loading ? '—' : leads.length}</strong> leads</span>
              <span className="table-footer-source"><span className="sync-dot" /> Fonte: tabela leads</span>
            </div>
          </section>
          <footer className="dashboard-footer"><span>© {CURRENT_YEAR} AeroPulse <i>·</i> Decisões mais inteligentes, com visão de cima.</span><span>PAINEL COMERCIAL <i>·</i> V1.0</span></footer>
        </div>
      </main>
    </div>
  )
}

function ClassificationBadge({ classification }: { classification: Lead['classification'] }) {
  const label = classification === 'na' ? 'N/A' : classification.charAt(0).toUpperCase() + classification.slice(1)
  return <span className={`badge classification-badge classification-${classification}`}><span />{label}</span>
}

function StatusBadge({ status, reason }: { status: string; reason: string }) {
  const normalized = status.toLowerCase()
  const variant = normalized.includes('crm') ? 'crm'
    : normalized.includes('nutri') ? 'nurturing'
      : normalized.includes('duplic') ? 'duplicate'
        : normalized.includes('inválido') || normalized.includes('invalido') ? 'invalid'
          : normalized.includes('erro') ? 'error'
            : 'pending'
  return (
    <span className="status-cell">
      <span className={`badge status-badge status-${variant}`}><span />{status}</span>
      {variant === 'invalid' && (
        <small className="status-reason" title={reason || 'Motivo não informado pelo workflow'}>
          {reason || 'Motivo não informado pelo workflow'}
        </small>
      )}
    </span>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>} path="/painel" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
