# SIGEC-LP — Sistema Integral de Gestión de Competiciones LigaPro Ecuador

<p align="center">
  <img src="public/favicon.svg" alt="SIGEC-LP Isotipo" width="64" height="64" />
</p>

<p align="center">
  <strong>Plataforma oficial de gestión de competiciones de la Liga Profesional de Fútbol del Ecuador (LIGAPRO)</strong><br/>
  Desarrollada conforme al <a href="docs/SRS_SIGEC-LP_Gestion_Competiciones_LigaPro.md">SRS oficial</a> basado en el Reglamento de Competiciones LIGAPRO — edición julio 2023.
</p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen" />
  <img alt="Vite" src="https://img.shields.io/badge/vite-6.4.6-646CFF?logo=vite" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/tailwindcss-3.x-38BDF8?logo=tailwindcss" />
  <img alt="Supabase" src="https://img.shields.io/badge/supabase-PostgreSQL%2015%2B-3ECF8E?logo=supabase" />
  <img alt="WCAG" src="https://img.shields.io/badge/WCAG-2.1%20AAA-005A9C" />
  <img alt="Netlify" src="https://img.shields.io/badge/deploy-Netlify-00C7B7?logo=netlify" />
</p>

---

## 🗂️ Contenido

- [Descripción](#-descripción)
- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Módulos Funcionales](#-módulos-funcionales)
- [Motor de Reglas de Dominio](#-motor-de-reglas-de-dominio)
- [Autenticación y Roles](#-autenticación-y-roles)
- [Perfil de Usuario](#-perfil-de-usuario)
- [Accesibilidad y Temas](#-accesibilidad-y-temas)
- [Base de Datos Supabase](#-base-de-datos-supabase)
- [Pruebas Unitarias](#-pruebas-unitarias)
- [Despliegue y Ejecución](#-despliegue-y-ejecución)
- [Sistema de Build](#-sistema-de-build)
- [Documentación](#-documentación)

---

## 📋 Descripción

**SIGEC-LP** es una SPA (Single Page Application) multi-pantalla que centraliza las operaciones de gestión de competiciones de la LIGAPRO, incluyendo:

- Seguimiento en vivo de partidos (marcador, cronómetro, incidencias).
- Control de tablas de posiciones con desempates reglamentarios (Arts. 9, 10, 11, 12, 13).
- Gestión de clubes, uniformes (48h), estadios e inspección VAR.
- Consola de Comisario Matchday con modos de accesibilidad (Alto Contraste WCAG AAA, Tablet).
- Sistema de autenticación multi-rol con Supabase Auth y perfiles editables.

---

## 🚀 Arquitectura y Tecnologías

| Capa | Tecnología |
|---|---|
| **UI / Bundler** | Vite 6.4 · Tailwind CSS 3 · Material Symbols Outlined |
| **Tipografías** | Plus Jakarta Sans (UI) · JetBrains Mono (datos tabulares) |
| **Backend & Auth** | Supabase (PostgreSQL 15+, Auth, Storage, Realtime, RLS) |
| **Build system** | Python 3.x (generación de 10 pantallas HTML desde templates) |
| **Deploy** | Netlify (`netlify.toml`) |
| **Estándar** | WCAG 2.1 / 2.2 Nivel AAA · PWA · Responsive |

**Supabase:** `https://udykrprupwifmffhpvuz.supabase.co`

---

## 📁 Estructura del Repositorio

```
Proyecto LigaPro/
│
├── index.html                                # SPA unificada (shell + navegación)
├── tablero.html                              # Consola Ejecutiva de Torneos
├── posiciones.html                           # Tablas de Posiciones, Clasificación y Fixture
├── clubes.html                               # Portal de Clubes y Trámites Reglamentarios
├── uniformes.html                            # Asistente de Designación de Uniformes (48h)
├── estadios.html                             # Inspección Técnica de Escenarios y VAR
├── consola.html                              # Consola de Comisario Matchday Oficial
├── consola-alto-contraste.html               # Consola WCAG AAA Alto Contraste
├── consola-tablet.html                       # Consola táctil para Tablet de campo
├── login.html                                # Inicio de Sesión y Selector de Roles
│
├── public/
│   └── favicon.svg                           # Isotipo SVG institucional (escudo índigo + dorado)
│
├── docs/
│   ├── SRS_SIGEC-LP_Gestion_Competiciones_LigaPro.md   # Especificación de Requisitos de Software
│   └── Documentación Técnica y Ejecutiva - SIGEC-LP.pdf
│
├── src/
│   ├── domain/                               # Reglas de negocio puras (sin dependencias de UI)
│   │   ├── tablas/
│   │   │   ├── desempates.js                 # Algoritmo oficial: PTS, DG, GF, H2H, sorteo (Arts. 9/10/16/17)
│   │   │   └── finalistas.js                 # RN-TAB-01: determinación de campeón y finalistas (Arts. 11-13)
│   │   ├── disciplina/
│   │   │   └── acumulacion.js               # Acumulación 5 amarillas y rojas (Arts. 90/91)
│   │   ├── multas/
│   │   │   └── calculo.js                   # Infracciones, conversión SBU, Disposición 5ª
│   │   └── uniformes/
│   │       └── contraste.js                 # Luminancia WCAG 2.1 y contraste cromático (Arts. 29-32)
│   │
│   ├── views/                                # FUENTE ÚNICA del contenido de cada pantalla
│   │   ├── tablero.html, posiciones.html, clubes.html, uniformes.html, estadios.html
│   │   ├── consola.html, consola_alto_contraste.html, consola_tablet.html
│   │   └── auth.html
│   │
│   └── lib/
│       ├── supabase.js                       # Cliente Supabase oficial
│       ├── store.js                          # Estado reactivo global y persistencia offline (localStorage)
│       └── interactive.js                    # Event handlers en vivo, perfil de usuario y UI
│
├── scripts/
│   ├── sync_views.py                         # Copia src/views/*.html a index.html y a las páginas sueltas
│   ├── final_audit.py                        # Auditoría: href="#", botones sin handler, etc.
│   └── build_full_app.py, build_helpers.py, build_cleaner_v2.py   # LEGADO: generan el diseño antiguo
│
├── supabase/
│   ├── migrations/
│   │   ├── 20261106000000_sigec_lp_schema.sql  # DDL: tablas, enums, RLS, funciones, triggers
│   │   └── 20261106000001_sigec_lp_seed.sql    # Semilla: clubes, estadios, infracciones, partidos
│   └── seed.sql
│
├── tests/
│   └── test_domain_logic.py                  # Pruebas unitarias del motor de reglas (Secc. 8 SRS)
│
├── stitch_ligapro_competition_platform/      # Pantallas UI/UX base y tokens de diseño
└── netlify.toml                              # Configuración de despliegue
```

---

## ⚙️ Módulos Funcionales

| ID | Nombre | Pantalla | Descripción |
|:---|:---|:---|:---|
| **MOD-AUT** | Autenticación y Roles | `login.html` | Selector de roles: DIR_COMP, COMISARIO, CLUB_ADMIN, OF_VAR, DEL_SEG. Auth con Supabase o modo demo offline. |
| **MOD-FMT** | Tablero Ejecutivo | `tablero.html` | Métricas operativas, elegibilidad financiera y monitoreo de partidos en vivo. |
| **MOD-TAB** | Tablas y Resultados | `posiciones.html` | Desempates por PTS, DG, GF, enfrentamiento directo (H2H) y sorteo; cálculo de campeón (Arts. 12/13). |
| **MOD-TRM** | Portal de Clubes | `clubes.html` | Radicación de solicitudes con plazos automáticos: 7d, 30d, 48h, 72h. |
| **MOD-PRE** | Asistente de Uniformes | `uniformes.html` | Simulación cromática, contraste WCAG y sellado de acta 48h antes del partido. |
| **MOD-EST** | Escenarios y VAR | `estadios.html` | Parámetros: césped 20–25 mm, hospital < 15 m, fibra VAR, energía 220V. |
| **MOD-OPS** | Consola de Comisario | `consola.html` | Registro en vivo por equipo y jugador: goles (jugada, penal, autogol), tarjetas, cambios, hidratación e incidentes. Anulación trazable con motivo, «Deshacer» inmediato, doble amarilla = expulsión, máximo 5 cambios y cierre de acta irreversible. |
| **MOD-ACC** | Consola Alto Contraste | `consola-alto-contraste.html` | Modo estricto WCAG AAA `#000000 / #FFE600` para sol extremo o noche. |
| **MOD-TABL** | Consola Tablet | `consola-tablet.html` | Interfaz táctil optimizada para banquillo y camerinos. |
| **MOD-PERF** | Perfil de Usuario | Modal en Header | Editor de perfil con avatar interactivo, cargo, club, cédula. Persistencia en Supabase y localStorage. |

---

## 🧠 Motor de Reglas de Dominio

Implementación pura en JavaScript (sin dependencias de UI) de los artículos reglamentarios:

| Módulo | Artículos | Descripción |
|---|---|---|
| `desempates.js` | Arts. 9, 10, 16, 17 | PTS → DG → GF → H2H → sorteo |
| `finalistas.js` | Arts. 11, 12, 13 | Campeón directo, finalistas, descenso |
| `acumulacion.js` | Arts. 90, 91 | 5 amarillas = 1 fecha; acumulación de rojas |
| `calculo.js` | Disposición 5ª | Infracciones en SBU + multas pecuniarias |
| `contraste.js` | Arts. 29–32 | Luminancia relativa WCAG 2.1, ratio mínimo 4.5:1 |

---

## 🔐 Autenticación y Roles

SIGEC-LP admite dos modos de acceso:

**Modo Supabase (producción):**
- `supabase.auth.signInWithPassword()` con correo y contraseña real.
- **Recuperar contraseña:** "¿Olvidó contraseña?" → `resetPasswordForEmail()` envía un enlace; al abrirlo, Supabase emite `PASSWORD_RECOVERY` y la app muestra el formulario de nueva contraseña (`updateUser({ password })`). La URL del sitio debe estar en *Authentication → URL Configuration → Redirect URLs* de Supabase.
- Metadatos del usuario (`full_name`, `role`, `cargo`, `club`, `cedula`, `avatar_url`) guardados en `auth.users.user_metadata` y tabla `profiles`.

**Modo Demo (offline):**
- Selector de rol directo sin credenciales.
- Estado persistido en `localStorage` bajo la clave `sigec_lp_demo_user`.

| Rol | ID | Acceso |
|---|---|---|
| Director de Competiciones | `DIR_COMP` | Total |
| Comisario de Partido | `COMISARIO` | Consola + Tablero |
| Administrador de Club | `CLUB_ADMIN` | Portal de Clubes |
| Oficial VAR | `OF_VAR` | Estadios + Consola |
| Delegado de Seguridad | `DEL_SEG` | Estadios |

---

## 👤 Perfil de Usuario

Accesible desde el menú desplegable del Header (ícono de avatar, esquina superior derecha):

- **Avatar interactivo:** clic para subir foto → compresión automática en `<canvas>` a 160×160 px JPEG 0.8.
- **Campos editables:** nombre completo, cargo en LigaPro/Club, club asignado, rol, cédula/ID COMET.
- **Email:** solo lectura (proviene de Supabase Auth).
- **Cambio de contraseña:** bloque desplegable para usuarios autenticados con correo real.
- **Guardado:** `supabase.auth.updateUser({ data: { ... } })` + upsert en tabla `profiles` + actualización inmediata del Header (nombre y avatar circular).

---

## 🎨 Accesibilidad y Temas

| Característica | Detalle |
|---|---|
| **Tema oscuro Midnight Broadcast** | Canvas `#0B0F19` · Cards/Header `#111827` · Bordes `#1E293B` · Texto `#F8FAFC` |
| **Modo claro** | Blanco/slate estándar con contraste WCAG AA |
| **Alto contraste solar** | `#000000 / #FFE600` en consola de campo |
| **Escala de fuente** | A− / A+ aplicados a `document.documentElement` y persistidos en `localStorage` |
| **PWA** | Favicon SVG institucional en pestaña del navegador |
| **Responsive** | Desktop, Tablet táctil y Mobile |

---

## 🗄️ Base de Datos Supabase

```
PostgreSQL 15+  ·  Row Level Security (RLS) activado
```

Tablas principales:

| Tabla | Descripción |
|---|---|
| `profiles` | Perfil extendido del usuario (nombre, cargo, club, cédula, avatar_url) |
| `user_roles` | Rol activo por usuario |
| `clubes` | 16 clubes LigaPro con datos institucionales |
| `estadios` | Parámetros técnicos de escenarios deportivos |
| `partidos` | Fixture, resultado y estado de partidos |
| `incidencias` | Goles, tarjetas, sustituciones, incidentes por partido |
| `infracciones` | Catálogo de infracciones con montos en SBU |

Migraciones en `supabase/migrations/`:
- `20261106000000_sigec_lp_schema.sql` — DDL completo con RLS y triggers.
- `20261106000001_sigec_lp_seed.sql` — Datos iniciales de clubes, estadios e infracciones.
- `20261127000000_profiles.sql` — Tabla `profiles` (perfil de usuario) con RLS: cada usuario solo lee/edita el suyo.
- `20261127000001_anulacion_eventos.sql` — Anulación trazable de eventos: columnas `anulado`, `anulado_en`, `anulado_por`, `motivo_anulacion`; función `anular_evento_partido(client_uuid, motivo)` que valida permisos y acta abierta, registra en `audit_log` y recalcula el marcador.

---

## 🧪 Pruebas Unitarias

```bash
python tests/test_domain_logic.py
```

**Resultado esperado: 4/4 pruebas aprobadas**

| # | Caso de prueba | Artículo |
|---|---|---|
| 1 | Desempate por enfrentamiento directo H2H | Art. 10 |
| 2 | Campeón directo al ganar ambas fases | Art. 12 |
| 3 | Reemplazo de finalista por descenso | Art. 13 |
| 4 | Contraste cromático de uniformes | Arts. 31/32 |

---

## 🌐 Despliegue y Ejecución

### Producción (Netlify)

El proyecto se despliega automáticamente en Netlify al hacer push a `main`.  
Configuración en [`netlify.toml`](netlify.toml).

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con hot reload
npm run dev
```

### Build de producción

```bash
# 1. Sincronizar las vistas (src/views/*.html) en index.html y en las páginas sueltas
python scripts/sync_views.py

# 2. Compilar assets con Vite
npm run build

# 3. Auditoría de calidad (opcional)
python scripts/final_audit.py
```

> **Nota (Windows):** Si Node.js no está en el PATH global, usa:
> ```powershell
> $env:PATH = "$((Get-Location).Path)\.tools\node-v20.18.0-win-x64;" + $env:PATH; npm run build
> ```

### Ejecución directa (sin build)

```bash
# Abrir directamente en el navegador
start index.html

# O con servidor local
python -m http.server 8080
# → http://localhost:8080
```

---

## 🔧 Sistema de Build

El contenido de cada pantalla vive en **`src/views/<vista>.html`** (fuente única). `index.html` (la SPA) y las páginas sueltas (`tablero.html`, `posiciones.html`, …) comparten encabezado y pie, y su contenido se genera desde esas plantillas:

| Script | Rol |
|---|---|
| `scripts/sync_views.py` | Inserta cada `src/views/*.html` en `index.html` (dentro de `#view-<id>`) y en su página suelta |
| `scripts/final_audit.py` | Verifica 0 `href="#"`, 0 botones sin handler, 0 ocurrencias residuales |
| `scripts/build_full_app.py` | **Legado.** Regenera el diseño antiguo desde `stitch_ligapro_competition_platform/`; no usar (pide `--force`) |

> No edites a mano el contenido entre `<main class="w-full flex-1">` y `</main>` de los HTML: se sobrescribe al ejecutar `sync_views.py`.

**Flujo antes de cada push:**
```
editar src/views/*.html → python scripts/sync_views.py → npm run build → python scripts/final_audit.py → git push
```

---

## 📚 Documentación

| Documento | Ruta | Descripción |
|---|---|---|
| SRS oficial | [`docs/SRS_SIGEC-LP_Gestion_Competiciones_LigaPro.md`](docs/SRS_SIGEC-LP_Gestion_Competiciones_LigaPro.md) | Especificación completa de requisitos de software |
| Doc. Técnica y Ejecutiva | [`docs/Documentación Técnica y Ejecutiva - SIGEC-LP.pdf`](docs/Documentación%20Técnica%20y%20Ejecutiva%20-%20SIGEC-LP.pdf) | Resumen ejecutivo para stakeholders |
| Reglamento fuente | Reglamento de Competiciones LIGAPRO (julio 2023) | Base normativa del motor de reglas |

---

<p align="center">
  Desarrollado para la <strong>Liga Profesional de Fútbol del Ecuador — LIGAPRO</strong><br/>
  <em>SIGEC-LP v1.0 · 2026</em>
</p>
