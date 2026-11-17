# SIGEC-LP — Sistema Integral de Gestión de Competiciones LigaPro Ecuador

Plataforma oficial desarrollada conforme a la **Especificación de Requisitos de Software (SRS)** (`SRS_SIGEC-LP_Gestion_Competiciones_LigaPro.md` / `docs/SRS.md`) basada en el **Reglamento de Competiciones de la Liga Profesional de Fútbol del Ecuador (LIGAPRO)**, edición oficial julio 2023.

---

## 🚀 Arquitectura y Tecnologías

- **Frontend & UI/UX**:
  - Implementación completa de los diseños de `stitch_ligapro_competition_platform`
  - **Tailwind CSS** con los tokens oficiales de diseño accesibles (WCAG 2.1 / 2.2 Nivel AAA)
  - Tipografías: **Plus Jakarta Sans** (UI) y **JetBrains Mono** (datos tabulares y cronómetros)
  - Iconografía: **Material Symbols Outlined**
  - Compatibilidad: PWA, Responsive Desktop, Tablet táctil de campo y Modo Alto Contraste Solar
- **Backend & Base de Datos**:
  - **Supabase** (PostgreSQL 15+, Auth, Storage, Realtime y RLS)
  - Proyecto Supabase: `https://udykrprupwifmffhpvuz.supabase.co`
  - Anon Key: `sb_publishable_BWp4gPHD6qr2TeqUJfOh2Q_IVleiAeo`
- **Motor de Reglas de Dominio**:
  - Motor puro de tablas y desempates (`src/domain/tablas/desempates.js`)
  - Determinación de finalistas y campeón según Arts. 11, 12 y 13 (`src/domain/tablas/finalistas.js`)
  - Acumulación de tarjetas y suspensiones (`src/domain/disciplina/acumulacion.js`)
  - Cálculo de multas e infracciones (`src/domain/multas/calculo.js`)
  - Asistente de luminancia y contraste de kits (`src/domain/uniformes/contraste.js`)

---

## 📁 Estructura del Repositorio

```
Proyecto LigaPro/
├── index.html                               # Aplicación Web Unificada (SPA con Shell y Navegación)
├── tablero.html                             # Consola Ejecutiva de Torneos LigaPro
├── posiciones.html                          # Tablas de Posiciones, Clasificación y Fixture
├── clubes.html                              # Portal de Clubes y Trámites Reglamentarios
├── uniformes.html                           # Asistente de Designación de Uniformes 48h
├── estadios.html                            # Inspección Técnica de Escenarios Deportivos y VAR
├── consola.html                             # Consola de Comisario Matchday Oficial
├── consola-alto-contraste.html              # Consola de Comisario WCAG AAA Alto Contraste
├── consola-tablet.html                      # Consola Táctil de Campo para Tablet
├── login.html                               # Inicio de Sesión y Selector de Roles
│
├── docs/
│   └── SRS.md                               # Documento de Requisitos de Software oficial
│
├── src/
│   ├── domain/                              # Reglas de negocio puras
│   │   ├── tablas/
│   │   │   ├── desempates.js                # Algoritmo de desempates oficial (Arts. 9, 10, 16, 17)
│   │   │   └── finalistas.js                # RN-TAB-01 (Arts. 11, 12, 13)
│   │   ├── disciplina/
│   │   │   └── acumulacion.js               # Acumulación de 5 amarillas y rojas (Art. 90/91)
│   │   ├── multas/
│   │   │   └── calculo.js                   # Infracciones, conversión SBU y Disposición 5ª
│   │   └── uniformes/
│   │       └── contraste.js                 # Cálculo de luminancia WCAG 2.1 (Arts. 29-32)
│   │
│   └── lib/
│       ├── supabase.js                      # Conexión al cliente Supabase oficial
│       ├── store.js                         # Estado reactivo global y persistencia offline
│       └── interactive.js                   # Handlers de eventos en vivo y UI
│
├── supabase/
│   ├── migrations/
│   │   ├── 20261106000000_sigec_lp_schema.sql # DDL: Tablas, Enums, RLS, Funciones, Triggers
│   │   └── 20261106000001_sigec_lp_seed.sql   # Semilla: Clubes, Estadios, Infracciones, Partidos
│   └── seed.sql                             # Script de carga inicial
│
├── tests/
│   └── test_domain_logic.py                 # Pruebas unitarias de casos de aceptación (Secc. 8)
│
├── stitch_ligapro_competition_platform/     # Pantallas UI/UX base y tokens de diseño
└── netlify.toml                             # Configuración de despliegue
```

---

## ⚙️ Módulos Funcionales Desarrollados

| ID Módulo | Nombre | Pantalla Asociada | Descripción |
| :--- | :--- | :--- | :--- |
| **MOD-AUT** | Autenticación y Roles | `login.html` | Selector de roles (DIR_COMP, COMISARIO, CLUB_ADMIN, OF_VAR, DEL_SEG). |
| **MOD-FMT** | Formatos y Dashboard | `tablero.html` | Métricas operativas, elegibilidad financiera y monitoreo de partidos. |
| **MOD-TAB** | Tablas y Resultados | `posiciones.html` | Desempates por PTS, DG, GF, H2H y sorteo; cálculo de título (Art. 12/13). |
| **MOD-TRM** | Portal de Clubes | `clubes.html` | Radicación de solicitudes con plazos automáticos (7d, 30d, 48h, 72h). |
| **MOD-PRE** | Asistente de Uniformes | `uniformes.html` | Simulación cromática, contraste WCAG y sellado de acta 48h antes. |
| **MOD-EST** | Escenarios y VAR | `estadios.html` | Parámetros de césped (20-25mm), hospital (<15m), fibra VAR y energía 220V. |
| **MOD-OPS** | Consola de Comisario | `consola.html` | Registro en vivo de goles, tarjetas, sustituciones, hidratación e incidentes. |
| **MOD-ACC** | Consola WCAG AAA | `consola-alto-contraste.html` | Modo alto contraste estricto (#000000 / #FFE600) para sol extremo o noche. |
| **MOD-TABL**| Consola Tablet | `consola-tablet.html` | Interfaz optimizada para pantallas táctiles en el banquillo y camerinos. |

---

## 🧪 Pruebas Unitarias

Para ejecutar las pruebas del motor de reglas reglamentarias:
```bash
python tests/test_domain_logic.py
```
Resultado: **4/4 pruebas aprobadas**:
- Desempate por enfrentamiento directo (H2H)
- Campeón directo sin final al ganar ambas fases (Art. 12)
- Reemplazo de finalista en caso de descenso (Art. 13)
- Cálculo de contrastes cromáticos de uniformes (Arts. 31/32)

---

## 🌐 Despliegue y Ejecución

Para abrir la aplicación unificada localmente:
1. Abra `index.html` directamente en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).
2. O inicie un servidor local:
   ```bash
   python -m http.server 8080
   ```
   Y acceda a `http://localhost:8080`.
