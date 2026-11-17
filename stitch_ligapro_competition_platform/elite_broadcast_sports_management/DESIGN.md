---
name: Elite Broadcast Sports Management
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#535f74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#101c2e'
  on-primary-container: '#79849b'
  inverse-primary: '#bbc7df'
  secondary: '#0041c9'
  on-secondary: '#ffffff'
  secondary-container: '#0356ff'
  on-secondary-container: '#e4e7ff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001f27'
  on-tertiary-container: '#0090ae'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3fc'
  primary-fixed-dim: '#bbc7df'
  on-primary-fixed: '#101c2e'
  on-primary-fixed-variant: '#3c475b'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b3'
  tertiary-fixed: '#b4ebff'
  tertiary-fixed-dim: '#3cd7ff'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5f'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-base: '#F8FAFC'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  border-strong: '#CBD5E1'
  sport-success: '#00A859'
  sport-warning: '#FFD100'
  sport-danger: '#D92D20'
  high-contrast-bg: '#000000'
  high-contrast-accent: '#FFE600'
  text-primary: '#0F172A'
  text-secondary: '#334155'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-metric:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  mono-matchday:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  mono-table:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

# Design System: SIGEC-LP (Sistema Integral de Gestión de Competiciones - LigaPro Ecuador)

## 1. Identidad Visual y Filosofía
- **Marca:** LigaPro Ecuador - Sistema Oficial de Gestión de Competiciones (Serie A & Serie B)
- **Estética:** Deportiva de élite, institucional broadcast, alta densidad de datos tácticos y reglamentarios, moderna y con verificación rigurosa de accesibilidad WCAG 2.1 AA/AAA.
- **Enfoque de Accesibilidad:** Cero dependencia exclusiva del color (ícono geométrico + color + etiqueta textual). Controles nativos de accesibilidad: Modo Alto Contraste (Negro Puro `#000000` / Amarillo `#FFE600`), escalador tipográfico y soporte multisensorial con alertas visuales.

## 2. Paleta de Colores
- **Primario Institucional:** `#0A1628` (Navy Profundo Institucional para headers, sidebars y fondos oscuros).
- **Superficie y Canvas (Modo Claro):**
  - Background Base: `#F8FAFC`
  - Tarjetas y Contenedores: `#FFFFFF`
  - Bordes y Separadores: `#CBD5E1` y `#E2E8F0`
- **Acentos Broadcast & Acción:**
  - Azul Eléctrico Primario: `#0055FF`
  - Cian Broadcast: `#00D4FF`
- **Estados Semánticos Deportivos & Reglamentarios:**
  - Éxito / Césped Calificado / Libertadores: `#00A859` (Verde césped contrastado)
  - Preventivo / Tarjeta Amarilla / Insignia Ecuador: `#FFD100` con texto oscuro `#0A1628`
  - Alerta Crítica / Descenso / Tarjeta Roja / Sanción: `#D92D20`
- **Texto y Tipografía:**
  - Texto Principal: `#0F172A`
  - Texto Secundario: `#334155`
  - Texto Atenuado: `#64748B`

## 3. Tipografía
- **Titulares e Interfaz:** `Plus Jakarta Sans`, sans-serif geométrica contemporánea.
- **Datos Numéricos y Cronómetros:** `JetBrains Mono` con soporte `tabular-nums` para marcadores, cronómetro de cuenta regresiva de partido (-90m a 00:00), tablas de clasificación y liquidaciones económicas (USD).

## 4. Componentes Clave
- **Selector de Temporada y Torneo:** Selector multi-fase (Fase Inicial 30 fechas, Hexagonales, Cuadrangular Descenso).
- **Matchday Console:** Cronómetro de cuenta regresiva regresiva reglamentaria, lista de chequeo de planillas COMET, inspección de césped en "Z" con prisma 20-25mm, y sellado con Hash Criptográfico.
- **Comparador de Uniformes:** Validación de ratio de contraste visual cromático entre Local, Visitante y Árbitros (manga 7x7cm).
- **Accesibilidad Quick Bar:** Selector de tamaño de fuente (100%, 125%, 150%) y toggle de Alto Contraste.
