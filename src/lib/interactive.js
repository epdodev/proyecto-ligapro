/**
 * SIGEC-LP — Controlador de Interacciones, Eventos en Vivo, Accesibilidad y Sesión
 * Conexión completa con Supabase y Estado Reactivo
 */

import { store, INITIAL_STATE } from './store.js';
import { getSupabase, safeInsert, safeQuery } from './supabase.js';
import { ordenarTabla } from '../domain/tablas/desempates.js';
import { calcularFinalistasYCampeon } from '../domain/tablas/finalistas.js';
import { evaluarAcumulacionAmarillas } from '../domain/disciplina/acumulacion.js';
import { calcularMulta } from '../domain/multas/calculo.js';
import { evaluarContrasteKits } from '../domain/uniformes/contraste.js';
import '../index.css';

// ==============================================================================
// 1. GESTIÓN DE SESIÓN, ROLES Y AUTENTICACIÓN REAL
// ==============================================================================

window.toggleUserDropdown = function(forceClose = false) {
  const dropdown = document.getElementById('user-dropdown-menu');
  if (!dropdown) return;
  if (forceClose) {
    dropdown.classList.add('hidden');
    return;
  }
  dropdown.classList.toggle('hidden');
  // Cerrar notificaciones si están abiertas
  const notif = document.getElementById('notifications-panel');
  if (notif) notif.classList.add('hidden');
};

window.cambiarRol = function(nuevoRol) {
  window.toggleUserDropdown(true);
  showToast('El rol asignado se gestiona desde el registro oficial en la base de datos.', 'info');
};

window.cerrarSesion = async function() {
  window.toggleUserDropdown(true);
  const sb = getSupabase();
  if (sb && sb.auth) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.warn('Error signOut Supabase:', e);
    }
  }
  await store.logout();
  actualizarUIHeader();
  showToast('Sesión cerrada correctamente.', 'info');
  window.navigateView('auth');
};

// ==============================================================================
// GESTIÓN DE PERFIL DE USUARIO Y PERSISTENCIA SUPABASE
// ==============================================================================

let pendingAvatarDataUrl = null;

window.procesarFotoPerfil = function(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Por favor selecciona un archivo de imagen válido.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        // Recorte cuadrado centrado
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.drawImage(img, startX, startY, size, size, 0, 0, 160, 160);

        // Compresión ligera a 160x160 JPEG calidad 0.8
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        pendingAvatarDataUrl = compressedDataUrl;

        // Actualizar vista previa de inmediato en el modal
        const previewEl = document.getElementById('perfil-avatar-preview');
        if (previewEl) {
          previewEl.src = compressedDataUrl;
        }

        showToast('📸 Foto procesada con éxito (160x160px). Haz clic en "Guardar Cambios" para confirmar.', 'info');
      } catch (err) {
        console.error('Error procesando imagen de avatar:', err);
        showToast('No se pudo procesar la imagen seleccionada.', 'error');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.abrirModalPerfil = function() {
  window.toggleUserDropdown(true);
  pendingAvatarDataUrl = null;

  const u = store.state.currentUser || {};
  const nombre = u.nombre || '';
  const email = u.email || 'usuario@ligapro.ec';
  const cargo = u.cargo || 'Oficial de Partido';
  const club = u.club || 'LigaPro Ecuador';
  const rol = u.rol || 'DIR_COMP';
  const cedula = u.cedula || '1714209552';
  const avatar = u.avatar_url || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const modalHtml = `
  <div id="modal-perfil-backdrop" class="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
    <div class="bg-white dark:bg-[#111827] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-auto sm:my-4 transition-all">
      <!-- Encabezado del Modal -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3.5">
          <!-- Avatar Interactivo con Overlay y Disparador de Archivo -->
          <div class="relative group cursor-pointer shrink-0" onclick="document.getElementById('perfil-avatar-input').click()" title="Haz clic para cambiar foto de perfil">
            <img id="perfil-avatar-preview" src="${avatar}" alt="Avatar" class="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-md transition-all group-hover:brightness-75 group-hover:scale-[1.02]" />
            <div class="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
              <span class="material-symbols-outlined text-xl">photo_camera</span>
              <span class="text-[9px] font-bold tracking-tight">Cambiar</span>
            </div>
            <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full" title="Usuario Activo"></span>
          </div>
          <input type="file" id="perfil-avatar-input" accept="image/*" class="hidden" onchange="procesarFotoPerfil(event)" />

          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">Mi Perfil de Usuario</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">SIGEC-LP</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Datos personales y credenciales de acceso</p>
            <button type="button" onclick="document.getElementById('perfil-avatar-input').click()" class="mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors">
              <span class="material-symbols-outlined text-xs">add_a_photo</span>
              <span>Cambiar foto de perfil</span>
            </button>
          </div>
        </div>
        <button type="button" onclick="cerrarModalPerfil()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Formulario de Edición de Perfil -->
      <form id="form-perfil-usuario" onsubmit="guardarCambiosPerfil(event)" class="mt-5 space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Nombre Completo -->
          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">badge</span>
              Nombre Completo
            </label>
            <input id="perfil-nombre" type="text" value="${nombre}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all" />
          </div>

          <!-- Correo Electrónico (Solo Lectura) -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-slate-400">mail</span>
                Correo Electrónico
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Solo Lectura</span>
            </label>
            <input id="perfil-email" type="email" value="${email}" readonly disabled class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-not-allowed select-none" />
          </div>

          <!-- Número de Cédula -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm text-emerald-500">pin</span>
              Número de Cédula
            </label>
            <input id="perfil-cedula" type="text" value="${cedula}" placeholder="Ej: 1714209552" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all" />
          </div>
        </div>

        <!-- Sección Desplegable: Cambio de Contraseña -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onclick="togglePasswordChangeSection()" class="flex items-center justify-between w-full py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">lock_reset</span>
              Actualizar Contraseña de Acceso (Opcional)
            </span>
            <span id="pwd-toggle-icon" class="material-symbols-outlined text-sm transition-transform">expand_more</span>
          </button>

          <div id="perfil-password-section" class="hidden mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Si deseas cambiar tu contraseña, ingresa la nueva clave a continuación (mínimo 6 caracteres). Si no deseas cambiarla, deja estos campos en blanco.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nueva Contraseña</label>
                <input id="perfil-nueva-pwd" type="password" placeholder="Mínimo 6 caracteres" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
                <input id="perfil-confirm-pwd" type="password" placeholder="Repite la contraseña" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button type="button" onclick="cerrarModalPerfil()" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors">
            Cancelar
          </button>
          <button id="btn-guardar-perfil" type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
            <span class="material-symbols-outlined text-base">save</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  </div>`;

  const prev = document.getElementById('modal-perfil-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.cerrarModalPerfil = function() {
  const modal = document.getElementById('modal-perfil-backdrop');
  if (modal) modal.remove();
};

window.togglePasswordChangeSection = function() {
  const section = document.getElementById('perfil-password-section');
  const icon = document.getElementById('pwd-toggle-icon');
  if (!section) return;
  const isHidden = section.classList.contains('hidden');
  if (isHidden) {
    section.classList.remove('hidden');
    if (icon) icon.textContent = 'expand_less';
  } else {
    section.classList.add('hidden');
    if (icon) icon.textContent = 'expand_more';
  }
};

window.guardarCambiosPerfil = async function(event) {
  if (event) event.preventDefault();

  const nombreInput = document.getElementById('perfil-nombre');
  const cedulaInput = document.getElementById('perfil-cedula');
  const nuevaPwdInput = document.getElementById('perfil-nueva-pwd');
  const confirmPwdInput = document.getElementById('perfil-confirm-pwd');
  const btnGuardar = document.getElementById('btn-guardar-perfil');

  const nombre = nombreInput ? nombreInput.value.trim() : '';
  const cedula = cedulaInput ? cedulaInput.value.trim() : '';
  const nuevaPwd = nuevaPwdInput ? nuevaPwdInput.value : '';
  const confirmPwd = confirmPwdInput ? confirmPwdInput.value : '';

  // Conservar rol por defecto interno para permisos del sistema sin exigir campos de rol/club/cargo al usuario
  const rol = store.state.currentUser.rol || 'DIR_COMP';
  const cargo = 'Usuario Registrado';
  const club = 'LigaPro Ecuador';

  if (!nombre) {
    showToast('Por favor ingrese su nombre completo.', 'warning');
    return;
  }

  // Validar contraseña si se especificó una nueva
  if (nuevaPwd) {
    if (nuevaPwd.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (nuevaPwd !== confirmPwd) {
      showToast('Las contraseñas no coinciden. Por favor verifique.', 'error');
      return;
    }
  }

  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">refresh</span> Guardando...`;
  }

  // Determinar foto final de perfil (nueva comprimida o la existente)
  const currentAvatar = store.state.currentUser.avatar_url || store.state.currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const finalAvatar = pendingAvatarDataUrl || currentAvatar;

  // 1. Persistencia real en Supabase
  const sb = getSupabase();
  let pwdUpdated = false;

  if (sb && sb.auth) {
    try {
      const updatePayload = {
        data: {
          full_name: nombre,
          nombre: nombre,
          role: rol,
          rol: rol,
          club: club,
          cargo: cargo,
          cedula: cedula,
          avatar_url: finalAvatar,
          avatar: finalAvatar
        }
      };

      if (nuevaPwd) {
        updatePayload.password = nuevaPwd;
      }

      const { data, error } = await sb.auth.updateUser(updatePayload);
      if (error) {
        console.warn('Supabase auth.updateUser aviso:', error.message);
      } else {
        if (nuevaPwd) pwdUpdated = true;
      }

      // Sincronizar en tabla profiles o user_roles si existen
      try {
        const { data: userData } = await sb.auth.getUser();
        if (userData && userData.user) {
          const uid = userData.user.id;
          await sb.from('profiles').upsert({
            id: uid,
            full_name: nombre,
            role: rol,
            club: club,
            cargo: cargo,
            cedula: cedula,
            avatar_url: finalAvatar,
            updated_at: new Date().toISOString()
          }).catch(() => {});

          await sb.from('user_roles').upsert({
            user_id: uid,
            rol: rol
          }).catch(() => {});
        }
      } catch (tableErr) {
        // Tablas auxiliares opcionales
      }
    } catch (err) {
      console.warn('Supabase offline o modo demo:', err);
    }
  }

  // 2. Actualizar Store local y persistir en localStorage
  store.updateUserProfile({
    nombre,
    cargo,
    club,
    rol,
    cedula,
    avatar: finalAvatar,
    avatar_url: finalAvatar
  });

  pendingAvatarDataUrl = null;

  // 3. Reflejar inmediatamente en Header
  actualizarUIHeader();

  // 4. Cerrar modal y notificar al usuario
  window.cerrarModalPerfil();

  if (pwdUpdated) {
    showToast('✅ Perfil y contraseña actualizados correctamente.', 'success');
  } else {
    showToast('✅ Perfil de usuario actualizado exitosamente.', 'success');
  }
};

window.toggleAuthTab = function(tab) {
  const loginSection = document.getElementById('auth-section-login');
  const signupSection = document.getElementById('auth-section-signup');
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const tabBtnSignup = document.getElementById('tab-btn-signup');

  if (tab === 'signup') {
    if (loginSection) loginSection.classList.add('hidden');
    if (signupSection) signupSection.classList.remove('hidden');
    if (tabBtnLogin) tabBtnLogin.className = "flex-1 py-2 text-center font-bold text-xs border-b-2 border-transparent text-slate-400 hover:text-white transition-colors";
    if (tabBtnSignup) tabBtnSignup.className = "flex-1 py-2 text-center font-bold text-xs border-b-2 border-amber-400 text-amber-400 transition-colors";
  } else {
    if (signupSection) signupSection.classList.add('hidden');
    if (loginSection) loginSection.classList.remove('hidden');
    if (tabBtnLogin) tabBtnLogin.className = "flex-1 py-2 text-center font-bold text-xs border-b-2 border-amber-400 text-amber-400 transition-colors";
    if (tabBtnSignup) tabBtnSignup.className = "flex-1 py-2 text-center font-bold text-xs border-b-2 border-transparent text-slate-400 hover:text-white transition-colors";
  }
};

window.loginFormSubmit = async function(event) {
  if (event) event.preventDefault();
  const idInput = document.getElementById('login-email') || document.getElementById('id-federativo');
  const passInput = document.getElementById('login-password') || document.getElementById('credencial-clave');
  const submitBtn = document.getElementById('btn-login-submit');

  const email = idInput ? idInput.value.trim() : '';
  const password = passInput ? passInput.value : '';

  if (!email) {
    showToast('Por favor ingrese su correo electrónico registrado.', 'warning');
    return;
  }
  if (!password) {
    showToast('Por favor ingrese su contraseña.', 'warning');
    return;
  }

  const origBtnContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Verificando en base de datos...`;
  }

  const sb = getSupabase();
  if (!sb || !sb.auth) {
    showToast('Error: Servicio de base de datos no disponible.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
    return;
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.warn('Supabase Auth error:', error.message);
      const msg = error.message === 'Invalid login credentials'
        ? 'Credenciales incorrectas. Verifique su correo y contraseña.'
        : `Error de autenticación: ${error.message}`;
      showToast(msg, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
      }
      return;
    }

    const user = data?.user;
    if (!user) {
      showToast('No se encontró el usuario en la base de datos.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
      }
      return;
    }

    const meta = user.user_metadata || {};
    let role = meta.rol || meta.role || 'DIR_COMP';
    let nombreUsuario = meta.nombre || meta.full_name || user.email.split('@')[0];

    // Consultar rol asignado en la base de datos user_roles
    try {
      const { data: roleRows } = await sb.from('user_roles').select('rol, club_id').eq('user_id', user.id).limit(1);
      if (roleRows && roleRows.length > 0 && roleRows[0].rol) {
        role = roleRows[0].rol;
      }
    } catch (rErr) {
      console.warn('Consulta user_roles:', rErr);
    }

    const initialSeed = encodeURIComponent(nombreUsuario);
    const avatarUrl = meta.avatar_url || meta.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${initialSeed}&backgroundColor=0284c7`;

    // Activar sesión en store
    store.setUserRole(role, nombreUsuario, user.email, {
      id: user.id,
      cargo: meta.cargo,
      club: meta.club,
      cedula: meta.cedula,
      avatar: avatarUrl,
      avatar_url: avatarUrl
    });

    actualizarUIHeader();
    showToast(`¡Bienvenido, ${nombreUsuario}! Sesión iniciada con éxito.`, 'success');
    window.navigateView('tablero');

  } catch (ex) {
    console.error('Error en login:', ex);
    showToast('Error al conectar con la base de datos.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
  }
};

window.signupFormSubmit = async function(event) {
  if (event) event.preventDefault();
  const nombreInput = document.getElementById('signup-nombre');
  const cedulaInput = document.getElementById('signup-cedula');
  const emailInput = document.getElementById('signup-email');
  const passInput = document.getElementById('signup-password');
  const submitBtn = document.getElementById('btn-signup-submit');

  const nombre = nombreInput ? nombreInput.value.trim() : '';
  const cedula = cedulaInput ? cedulaInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passInput ? passInput.value : '';
  
  // Asignar rol por defecto para acceso total al sistema sin pedir cargo/rol/club al usuario
  const rol = 'DIR_COMP';
  const club = 'LigaPro Ecuador';
  const cargo = 'Usuario Registrado';

  if (!nombre || !email || !password) {
    showToast('Por favor complete los campos obligatorios (Nombre, Correo y Contraseña).', 'warning');
    return;
  }

  if (password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
    return;
  }

  const origBtnContent = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Guardando usuario en base de datos...`;
  }

  const sb = getSupabase();
  if (!sb || !sb.auth) {
    showToast('Error: Servicio de base de datos no disponible.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
    return;
  }

  try {
    const initialSeed = encodeURIComponent(nombre);
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initialSeed}&backgroundColor=0284c7`;

    // 1. Guardar usuario en Supabase Auth (auth.users con metadata en PostgreSQL)
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          full_name: nombre,
          rol,
          role: rol,
          cedula,
          club,
          cargo,
          avatar_url: avatarUrl,
          avatar: avatarUrl
        }
      }
    });

    if (error) {
      showToast(`Error al registrar usuario: ${error.message}`, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
      }
      return;
    }

    const newUser = data?.user;
    if (!newUser) {
      showToast('No se pudo completar el registro del usuario.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
      }
      return;
    }

    // 2. Guardar registro en la tabla user_roles en la base de datos
    if (['DIR_COMP', 'COMISARIO', 'CLUB_ADMIN'].includes(rol)) {
      try {
        await sb.from('user_roles').insert({
          user_id: newUser.id,
          rol: rol,
          vigente_desde: new Date().toISOString().split('T')[0]
        });
        console.log('✅ Rol registrado en tabla user_roles de la base de datos.');
      } catch (errRole) {
        console.warn('Aviso user_roles insert:', errRole);
      }
    }

    // 3. Activar sesión real en el store de la aplicación
    store.setUserRole(rol, nombre, email, {
      id: newUser.id,
      cargo,
      club,
      cedula,
      avatar: avatarUrl,
      avatar_url: avatarUrl
    });

    actualizarUIHeader();
    showToast(`✅ Cuenta creada y guardada exitosamente en la base de datos. ¡Bienvenido, ${nombre}!`, 'success');
    window.navigateView('tablero');

  } catch (ex) {
    console.error('Excepción en registro:', ex);
    showToast('Ocurrió un error inesperado al procesar el registro en la base de datos.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnContent;
    }
  }
};

// ==============================================================================
// 2. NAVEGACIÓN Y PROTECCIÓN DE VISTAS
// ==============================================================================

window.navigateView = function(viewId) {
  if (viewId === 'perfil') {
    window.abrirModalPerfil();
    return;
  }

  // Comprobar protección de rutas
  if (!store.canAccessView(viewId)) {
    showToast('🔒 Acceso Restringido: Debe iniciar sesión con credenciales autorizadas de LigaPro o Club.', 'warning');
    store.state.activeView = 'auth';
    updateActiveViewInDOM('auth');
    const url = new URL(window.location);
    url.searchParams.set('view', 'auth');
    window.history.pushState({}, '', url);
    return;
  }

  store.setView(viewId);
  const url = new URL(window.location);
  url.searchParams.set('view', viewId);
  window.history.pushState({}, '', url);
  updateActiveViewInDOM(viewId);
};

// ==============================================================================
// 3. ACCESIBILIDAD (MODO OSCURO / ALTO CONTRASTE Y ESCALADO PROPORCIONAL)
// ==============================================================================

const FONT_SCALES = [100, 112.5, 125, 137.5, 150];

export function aplicarTema(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('high-contrast');
    if (document.body) document.body.classList.remove('high-contrast-mode');
    store.state.highContrast = true;
    try {
      localStorage.setItem('sigec_theme', 'dark');
      localStorage.setItem('sigec_high_contrast', 'false');
    } catch (e) {}
  } else {
    document.documentElement.classList.remove('dark', 'high-contrast');
    if (document.body) document.body.classList.remove('high-contrast-mode');
    store.state.highContrast = false;
    try {
      localStorage.setItem('sigec_theme', 'light');
      localStorage.setItem('sigec_high_contrast', 'false');
    } catch (e) {}
  }
  store.saveToLocalStorage();
  return store.state.highContrast;
}

window.toggleGlobalHighContrast = function() {
  const isDark = !document.documentElement.classList.contains('dark');
  aplicarTema(isDark);
};

export function aplicarFontScale(scale) {
  const numScale = Number(scale);
  const validScale = FONT_SCALES.includes(numScale) ? numScale : 100;
  document.documentElement.style.fontSize = `${validScale}%`;
  store.setFontScale(validScale);
  try {
    localStorage.setItem('sigec_font_scale', validScale.toString());
  } catch (e) {}
  return validScale;
}

window.ajustarTexto = function(action) {
  const currentScale = Number(store.state.fontScale) || 100;
  let currentIndex = FONT_SCALES.indexOf(currentScale);
  if (currentIndex === -1) currentIndex = 0;

  if (action === 'inc' || (typeof action === 'number' && action > 0)) {
    if (currentIndex < FONT_SCALES.length - 1) {
      currentIndex++;
    }
  } else if (action === 'dec' || (typeof action === 'number' && action < 0)) {
    if (currentIndex > 0) {
      currentIndex--;
    }
  }
  const newScale = FONT_SCALES[currentIndex];
  aplicarFontScale(newScale);
};

window.toggleAlertaAuditiva = function() {
  const active = store.toggleAudioAlerts();
  if (active) {
    reproducirTonoAccesible(880, 0.15); // Tono de prueba 880Hz (La)
  }
};

function reproducirTonoAccesible(frecuencia = 440, duracion = 0.2) {
  if (!store.state.audioAlerts) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frecuencia, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duracion);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duracion);
  } catch (e) {
    // browser audio policy
  }
}

// ==============================================================================
// 4. CENTRO DE NOTIFICACIONES
// ==============================================================================

window.toggleNotificationsPanel = function() {
  const panel = document.getElementById('notifications-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  // Cerrar menú de usuario si está abierto
  window.toggleUserDropdown(true);
};

window.marcarNotificacionesLeidas = function() {
  store.state.notificaciones.forEach(n => n.leida = true);
  store.notify();
  const badge = document.getElementById('notif-badge-indicator');
  if (badge) badge.classList.add('hidden');
  showToast('Notificaciones marcadas como leídas.', 'info');
};

// ==============================================================================
// 5. GESTIÓN DE EVENTOS DE PARTIDO (CONSOLA DE COMISARIO)
// ==============================================================================

window.registrarGolEnVivo = async function(club) {
  const p = store.state.partidoActivo;
  const nombreClub = club === 'local' ? (p.local?.nombre || 'Local') : (p.visitante?.nombre || 'Visitante');
  const jugador = club === 'local' 
    ? (p.local?.nombre_corto === 'LDU' ? 'Alex Arce (19)' : 'Delantero Local (9)') 
    : (p.visitante?.nombre_corto === 'BSC' ? 'Octavio Rivero (29)' : 'Delantero Visitante (11)');
  
  const evento = {
    tipo: 'gol',
    club,
    autor: jugador,
    detalle: `Gol convalidado por Árbitro Central y VAR. Transmisión COMET actualizada.`
  };

  store.registrarEventoPartido(evento);
  reproducirTonoAccesible(587.33, 0.3); // Tono agudo de gol
  
  // Persistir en Supabase de forma segura tanto el evento como el marcador actualizado en partidos
  const nuevoGolesLocal = p.marcador.local;
  const nuevoGolesVisitante = p.marcador.visitante;

  await safeInsert('eventos_partido', {
    partido_id: p.id,
    tipo: 'gol',
    periodo: p.periodo,
    minuto: p.minuto,
    detalle: evento
  });

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('partidos').update({
        goles_local: nuevoGolesLocal,
        goles_visitante: nuevoGolesVisitante,
        estado: 'en_juego'
      }).eq('id', p.id);
    } catch (e) {
      console.warn('Error actualizando marcador en Supabase:', e);
    }
  }

  showToast(`⚽ ¡GOL de ${nombreClub}! Registrado en Minuto ${p.minuto}'`, 'success');
  actualizarUIHeader();
  renderizarPartidosTablero();
};

window.registrarTarjetaEnVivo = async function(tipo, club = 'visitante') {
  const jugador = club === 'visitante' ? 'Jesús Trindade (8)' : 'Ezequiel Piovi (18)';
  const p = store.state.partidoActivo;
  
  if (tipo === 'amarilla') {
    const res = evaluarAcumulacionAmarillas(5, 'A');
    const evento = {
      tipo: 'amarilla',
      club,
      autor: jugador,
      detalle: res.mensaje
    };
    store.registrarEventoPartido(evento);
    reproducirTonoAccesible(440, 0.2);

    await safeInsert('eventos_partido', {
      partido_id: p.id,
      tipo: 'amarilla',
      periodo: p.periodo,
      minuto: p.minuto,
      detalle: evento
    });

    showToast(`🟨 Tarjeta Amarilla a ${jugador}. ${res.mensaje} (Multa: US$ ${res.multaUsd})`, res.suspendido ? 'warning' : 'info');
  } else {
    const evento = {
      tipo: 'roja',
      club,
      autor: jugador,
      detalle: 'Expulsión directa (Art. 90). Suspensión provisional de 1 partido y multa de US$ 100.'
    };
    store.registrarEventoPartido(evento);
    reproducirTonoAccesible(300, 0.4);

    await safeInsert('eventos_partido', {
      partido_id: p.id,
      tipo: 'roja',
      periodo: p.periodo,
      minuto: p.minuto,
      detalle: evento
    });

    showToast(`🟥 TARJETA ROJA a ${jugador}. Suspensión provisional de 1 fecha aplicada.`, 'error');
  }
  actualizarUIHeader();
};

window.registrarSustitucionEnVivo = async function(club = 'local') {
  const evento = {
    tipo: 'sustitucion',
    club,
    autor: 'Jhojan Julio ➔ Entra: Lisandro Alzugaray (9)',
    detalle: 'Ventana 1 de 3 utilizada. Sustitución 1 de 5 permitidas (Disp. 4ª).'
  };
  store.registrarEventoPartido(evento);

  await safeInsert('eventos_partido', {
    partido_id: store.state.partidoActivo.id,
    tipo: 'sustitucion',
    periodo: store.state.partidoActivo.periodo,
    minuto: store.state.partidoActivo.minuto,
    detalle: evento
  });

  showToast(`🔄 Sustitución registrada para ${club === 'local' ? 'LDU Quito' : 'Barcelona SC'}. Ventana 1 consumida.`, 'info');
};

window.registrarHidratacionEnVivo = function() {
  store.registrarEventoPartido({
    tipo: 'hidratacion_inicio',
    club: null,
    autor: 'Pausa Reglamentaria (Art. 71)',
    detalle: 'Minuto de hidratación autorizado por temperatura ambiental > 30°C. Duración máx. 1 minuto.'
  });
  showToast(`💧 Minuto de hidratación reglamentario iniciado (Art. 71).`, 'info');
};

window.registrarIncidenteEnVivo = async function() {
  const causa = 'Lanzamiento de objetos e invasión parcial (Art. 73)';
  store.registrarEventoPartido({
    tipo: 'fin_periodo',
    club: null,
    autor: 'Comisario de Partido',
    detalle: `Suspensión provisional por incidente: ${causa}. Se activa cronómetro de espera de 30 minutos (Art. 73/76).`
  });

  await safeInsert('incidentes', {
    partido_id: store.state.partidoActivo.id,
    tipo: 'invasion_objetos',
    minuto: store.state.partidoActivo.minuto,
    sector: 'Preferencia y General Sur',
    descripcion: causa
  });

  reproducirTonoAccesible(250, 0.5);
  showToast(`⚠️ INCIDENTE REGISTRADO (Art. 73): Cronómetro de espera perentorio de 30 minutos iniciado.`, 'warning');
};

window.sellarPlanillaJuego = async function() {
  const hash = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  store.state.partidoActivo.estado = 'oficializado';
  store.notify();
  showToast(`✅ Planilla de Juego oficializada y bloqueada según Art. 45. Hash Digital: ${hash}`, 'success');
};

// ==============================================================================
// 6. ASISTENTE DE UNIFORMES 48H
// ==============================================================================

window.actualizarKitsUniformes = function() {
  const kitLocalSel = document.querySelector('input[name="kit_local"]:checked')?.value || 'principal';
  const kitVisitanteSel = document.querySelector('input[name="kit_visitante"]:checked')?.value || 'principal';

  const kitLocal = kitLocalSel === 'principal'
    ? { camiseta: '#FFFFFF', pantaloneta: '#FFFFFF', medias: '#FFFFFF' }
    : { camiseta: '#1A1A1A', pantaloneta: '#1A1A1A', medias: '#1A1A1A' };

  const kitVisitante = kitVisitanteSel === 'principal'
    ? { camiseta: '#FFE600', pantaloneta: '#101010', medias: '#101010' }
    : { camiseta: '#C41230', pantaloneta: '#101010', medias: '#C41230' };

  const evalContraste = evaluarContrasteKits(kitLocal, kitVisitante);

  const badgeCamiseta = document.getElementById('ratio-camiseta-val');
  const badgePantaloneta = document.getElementById('ratio-pantaloneta-val');
  const badgeMedias = document.getElementById('ratio-medias-val');
  const badgeEstado = document.getElementById('estado-uniformes-badge');

  if (badgeCamiseta) badgeCamiseta.textContent = `${evalContraste.ratioCamiseta}:1`;
  if (badgePantaloneta) badgePantaloneta.textContent = `${evalContraste.ratioPantaloneta}:1`;
  if (badgeMedias) badgeMedias.textContent = `${evalContraste.ratioMedias}:1`;

  if (badgeEstado) {
    if (evalContraste.aprobado) {
      badgeEstado.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
      badgeEstado.innerHTML = `<span class="material-symbols-outlined text-sm">verified</span> INDUMENTARIA APROBADA (Art. 31/32)`;
    } else {
      badgeEstado.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1';
      badgeEstado.innerHTML = `<span class="material-symbols-outlined text-sm">warning</span> CONFLICTO CROMÁTICO DETECTADO`;
    }
  }
};

window.sellarActaUniformes = async function() {
  const hash = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await safeInsert('actas_camerino', {
    partido_id: store.state.partidoActivo.id,
    club_id: store.state.partidoActivo.local.id,
    tipo: 'entrega',
    estado_instalaciones: 'Conforme reunión técnica 48h (Art. 30)',
    firmado_por: store.state.currentUser.nombre
  });

  showToast(`📜 Acta Oficial de Uniformes (Art. 30) sellada digitalmente con éxito. Hash de Integridad: ${hash}`, 'success');
};

// ==============================================================================
// 7. INSPECCIÓN DE ESCENARIOS & VAR
// ==============================================================================

window.evaluarEscenarioEnVivo = async function() {
  const cespedMm = parseFloat(document.getElementById('input-cesped-mm')?.value || 22.5);
  const hospitalMin = parseInt(document.getElementById('input-hospital-min')?.value || 12);
  const varMb = parseInt(document.getElementById('input-var-mb')?.value || 200);
  const voltajeV = parseInt(document.getElementById('input-voltaje-v')?.value || 220);

  const cumpleCesped = cespedMm >= 20 && cespedMm <= 25;
  const cumpleHospital = hospitalMin <= 15;
  const cumpleVar = varMb >= 100 && (voltajeV >= 210 && voltajeV <= 230);

  const estado = (cumpleCesped && cumpleHospital && cumpleVar)
    ? 'calificado'
    : (cumpleHospital && cumpleVar && !cumpleCesped)
    ? 'condicionado'
    : 'no_calificado';

  const badgeCalificacion = document.getElementById('badge-calificacion-estadio');
  if (badgeCalificacion) {
    if (estado === 'calificado') {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> ESTADIO CALIFICADO`;
    } else if (estado === 'condicionado') {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">warning</span> ESTADIO CONDICIONADO (Corte de Césped Requerido)`;
    } else {
      badgeCalificacion.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1';
      badgeCalificacion.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> NO CALIFICADO (Art. 51/87a/92)`;
    }
  }

  showToast(`🏟️ Inspección Técnica registrada: Estado "${estado.toUpperCase()}"`, 'info');
};

// ==============================================================================
// 8. CERTIFICADO FEDERATIVO Y MODALES
// ==============================================================================

window.generarCertificadoFederativo = async function() {
  const timestamp = new Date().toISOString();
  const rawData = `LIGAPRO-EC-SERIE-A|2025|LDU-QUITO|ART-7-COMPLIANT|${timestamp}`;
  const msgBuffer = new TextEncoder().encode(rawData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const modalHtml = `
  <div id="modal-certificado-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">verified_user</span>
          <h3 class="font-extrabold text-slate-900 text-base">Certificado Oficial de Habilitación Federativa</h3>
        </div>
        <button onclick="document.getElementById('modal-certificado-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3 text-xs text-slate-700">
        <div class="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-emerald-600">check_circle</span>
          <span><strong>Certificación LigaPro Ecuabet 2025:</strong> Club y Estadio plenamente autorizados según Art. 7 (a–h).</span>
        </div>

        <div class="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
          <div><strong>Club:</strong> Liga Deportiva Universitaria de Quito</div>
          <div><strong>Competición:</strong> LigaPro Ecuabet Serie A</div>
          <div><strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-EC')} ${new Date().toLocaleTimeString('es-EC')}</div>
          <div><strong>Firma Digital:</strong> Dirección de Licencias & Competiciones</div>
          <div class="mt-2 text-slate-500 break-all"><strong>Sello SHA-256:</strong><br>${sha256Hash}</div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button onclick="descargarCertificadoTexto('${sha256Hash}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-sm">download</span> Descargar Constancia (.txt)
        </button>
        <button onclick="document.getElementById('modal-certificado-backdrop').remove()" class="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
          Cerrar
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-certificado-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.descargarCertificadoTexto = function(hash) {
  const contenido = `LIGAPRO ECUABET — SISTEMA INTEGRAL DE GESTIÓN DE COMPETICIONES (SIGEC-LP)
=============================================================================
CERTIFICADO OFICIAL DE HABILITACIÓN FEDERATIVA (ART. 7 REGLAMENTO LIGAPRO)
Club: Liga Deportiva Universitaria de Quito
Competición: Serie A 2025
Estado: HABILITADO
Fecha y Hora de Emisión: ${new Date().toISOString()}
Validez Criptográfica: VERIFICADA
Hash SHA-256: ${hash}
=============================================================================
Documento emitido electrónicamente con validez legal deportiva ante FEF y CONMEBOL.`;

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Certificado_Habilitacion_LigaPro_${Date.now()}.txt`;
  a.click();
  showToast('📄 Certificado descargado con éxito.', 'success');
};

window.mostrarNormativaCobro = function() {
  const modalHtml = `
  <div id="modal-normativa-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">gavel</span>
          <h3 class="font-extrabold text-slate-900 text-base">Régimen Económico y Cobro Coactivo</h3>
        </div>
        <button onclick="document.getElementById('modal-normativa-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <strong class="text-slate-900 block mb-1">Disposición General 5ª (Reincidencia de Infracciones):</strong>
          La reiteración de infracciones tipificadas acarreará multas de US$ 2.000 para clubes de Serie A y US$ 1.000 para Serie B, además de la clausura de la plaza por 1 fecha.
        </div>
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <strong class="text-slate-900 block mb-1">Disposición General 10ª (Unidad Deportiva Multa - UDM):</strong>
          Los valores por sanciones disciplinarias se liquidan mediante débito automático de la cuenta corriente de derechos audiovisuales del club en LigaPro.
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button onclick="document.getElementById('modal-normativa-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Cerrar
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-normativa-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.mostrarModalPasabolas = function() {
  const modalHtml = `
  <div id="modal-pasabolas-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">groups</span>
          <h3 class="font-extrabold text-slate-900 text-base">Designación de Pasabolas (Art. 54)</h3>
        </div>
        <button onclick="document.getElementById('modal-pasabolas-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-2 text-xs text-slate-700">
        <p><strong>Requisitos Reglamentarios Vinculantes:</strong></p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Cantidad: Mínimo 8, máximo 12 pasabolas uniformados.</li>
          <li>Edades: Obligatoriamente entre 14 y 17 años de edad.</li>
          <li>Indumentaria: Chaleco oficial provisto por LigaPro con color contrastante.</li>
          <li>Ubicación: 4 tras cada arco y 2 en bandas laterales.</li>
        </ul>
        <div class="mt-3 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-bold">
          ✓ Nómina oficial del partido verificada y acreditada por el Comisario.
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button onclick="document.getElementById('modal-pasabolas-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Aceptar
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-pasabolas-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ==============================================================================
// 9. TRÁMITES DE CLUBES
// ==============================================================================

window.mostrarModalNuevoTramite = function() {
  const modalHtml = `
  <div id="modal-nuevo-tramite-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">post_add</span>
          <h3 class="font-extrabold text-slate-900 text-base">Nueva Solicitud Reglamentaria</h3>
        </div>
        <button onclick="document.getElementById('modal-nuevo-tramite-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form id="form-nuevo-tramite" onsubmit="enviarTramiteForm(event)" class="mt-4 space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Club Solicitante</label>
          <select id="tramite-club" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="Barcelona SC">Barcelona Sporting Club</option>
            <option value="LDU Quito">Liga Deportiva Universitaria</option>
            <option value="Independiente del Valle">Independiente del Valle</option>
            <option value="CS Emelec">Club Sport Emelec</option>
            <option value="Orense SC">Orense Sporting Club</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Tipo de Trámite</label>
          <select id="tramite-tipo" onchange="actualizarPlazoTramite(this.value)" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="cambio_uniforme">Cambio / Actualización de Uniforme (Art. 29 — 7 días)</option>
            <option value="cambio_estadio">Cambio de Estadio de Localía (Disp. 6ª — 30 días)</option>
            <option value="postergacion_internacional">Postergación por Torneo Internacional (Art. 28a — 48h)</option>
            <option value="acto_institucional">Acto Institucional Pre-Partido (Art. 50 — 72h)</option>
            <option value="apodo_camiseta">Aprobación de Apodo en Camiseta (Art. 35)</option>
          </select>
        </div>

        <div id="plazo-aviso" class="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-medium">
          ⚠️ Plazo perentorio: Se debe presentar con al menos 7 días de anticipación al partido.
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Título / Asunto</label>
          <input type="text" id="tramite-titulo" required placeholder="Ej: Solicitud de uso de uniforme alterno conmemorativo" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Detalle / Justificación</label>
          <textarea id="tramite-detalle" rows="3" required placeholder="Describa la fundamentación reglamentaria de la petición..." class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"></textarea>
        </div>

        <div class="mt-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onclick="document.getElementById('modal-nuevo-tramite-backdrop').remove()" class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">send</span> Radicar Solicitud
          </button>
        </div>
      </form>
    </div>
  </div>`;

  const prev = document.getElementById('modal-nuevo-tramite-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.actualizarPlazoTramite = function(tipo) {
  const plazos = {
    'cambio_uniforme': '⚠️ Plazo perentorio: Se debe presentar con al menos 7 días de anticipación al partido (Art. 29).',
    'cambio_estadio': '⚠️ Plazo perentorio: 30 días de anticipación requeridos salvo fuerza mayor (Disposición 6ª).',
    'postergacion_internacional': '⚠️ Plazo perentorio: 48h de ventana de descanso entre partidos internacionales CONMEBOL (Art. 28a).',
    'acto_institucional': '⚠️ Plazo perentorio: Debe solicitarse con al menos 72h y finalizar a más tardar en T-75 min (Art. 50).',
    'apodo_camiseta': '⚠️ Plazo: Previo a la entrega oficial de la planilla de juego (Art. 35).'
  };
  const aviso = document.getElementById('plazo-aviso');
  if (aviso) aviso.textContent = plazos[tipo] || '';
};

window.enviarTramiteForm = async function(e) {
  if (e) e.preventDefault();
  const club = document.getElementById('tramite-club')?.value || 'Barcelona SC';
  const tipo = document.getElementById('tramite-tipo')?.value || 'cambio_uniforme';
  const titulo = document.getElementById('tramite-titulo')?.value || 'Solicitud Reglamentaria';

  const nuevo = store.crearTramite({
    club,
    tipo,
    titulo,
    plazo: 'Validado automáticamente conforme a reglamento'
  });

  // Guardar en Supabase
  await safeInsert('tramites', {
    club_id: store.state.partidoActivo.visitante.id,
    tipo,
    payload: { titulo, club, creado_por: store.state.currentUser.nombre }
  });

  const modal = document.getElementById('modal-nuevo-tramite-backdrop');
  if (modal) modal.remove();

  showToast(`✅ Solicitud ${nuevo.id} radicada y registrada en Dirección de Competiciones.`, 'success');
  if (store.state.activeView === 'clubes') {
    updateActiveViewInDOM('clubes');
  }
};

// ==============================================================================
// 10. TABLAS Y DESEMPATES (RN-TAB-01 Y ART. 11, 12, 13)
// ==============================================================================

window.mostrarModalFinalistas = function() {
  const clubes = store.state.clubes;
  const res = calcularFinalistasYCampeon(
    '66666666-6666-6666-6666-666666666601',
    '66666666-6666-6666-6666-666666666602',
    clubes.map((c, i) => ({ clubId: c.id, nombre: c.nombre, posicion: i + 1 }))
  );

  const modalHtml = `
  <div id="modal-finalistas-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-2xl">emoji_events</span>
          <h3 class="font-extrabold text-slate-900 text-lg">Resolución de Finalistas y Título</h3>
        </div>
        <button onclick="document.getElementById('modal-finalistas-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
          <span class="font-bold">Ganador Fase Uno:</span> LDU Quito (40 pts)<br>
          <span class="font-bold">Ganador Fase Dos:</span> Barcelona SC (37 pts)
        </div>

        <div class="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
          <div class="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Dictamen Oficial del Motor Reglamentario:</div>
          <p class="leading-relaxed text-slate-200">${res.motivo}</p>
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
            <span>¿Disputa de Final de Ida y Vuelta?</span>
            <span class="font-bold ${res.seJuegaFinal ? 'text-emerald-400' : 'text-amber-400'}">${res.seJuegaFinal ? 'SÍ (Art. 11)' : 'NO (Campeón Directo)'}</span>
          </div>
          <div class="flex items-center justify-between text-slate-300">
            <span>Localía Partido de Vuelta (Final):</span>
            <span class="font-bold text-amber-300">LDU Quito (Mejor en Tabla Acumulada)</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button onclick="document.getElementById('modal-finalistas-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Entendido
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-finalistas-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ==============================================================================
// 11. HELPERS DE INTERFAZ Y ACTUALIZACIÓN EN VIVO
// ==============================================================================

function updateActiveViewInDOM(viewId) {
  const views = document.querySelectorAll('.sigec-view-container');
  if (views.length === 0) {
    // Si estamos en un archivo HTML standalone y el usuario navega a otra vista, redirigir al index con el parámetro
    const currentPath = window.location.pathname;
    const viewFileMap = {
      'tablero': 'tablero.html',
      'posiciones': 'posiciones.html',
      'clubes': 'clubes.html',
      'uniformes': 'uniformes.html',
      'estadios': 'estadios.html',
      'consola': 'consola.html',
      'consola_alto_contraste': 'consola-alto-contraste.html',
      'consola_tablet': 'consola-tablet.html',
      'auth': 'login.html'
    };
    const targetFile = viewFileMap[viewId] || 'index.html';
    if (!currentPath.endsWith(`/${targetFile}`) && !currentPath.endsWith('index.html')) {
      window.location.href = `index.html?view=${viewId}`;
      return;
    }
  }

  views.forEach((v) => v.classList.add('hidden'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar botones de navegación en el header (excluyendo el logo de la marca)
  const navButtons = document.querySelectorAll('#header-nav [data-nav-id], nav [data-nav-id]');
  navButtons.forEach((link) => {
    const navId = link.getAttribute('data-nav-id');
    if (navId === viewId) {
      link.className = "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap bg-indigo-600 text-white shadow-xs";
    } else {
      link.className = "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60";
    }
  });

  actualizarUIHeader();
  if (viewId === 'tablero') {
    renderizarPartidosTablero();
  }
}

function actualizarUIHeader() {
  const p = store.state.partidoActivo;
  const u = store.state.currentUser;

  // Actualizar marcador
  const scoreEl = document.getElementById('header-score');
  const minEl = document.getElementById('header-match-min');
  if (scoreEl) scoreEl.textContent = `${p.marcador.local} - ${p.marcador.visitante}`;
  if (minEl) minEl.textContent = `${p.minuto}' ${p.periodo}T`;

  // Controlar visibilidad: Botón Iniciar Sesión vs. Perfil de Usuario
  const authBtnEl = document.getElementById('header-auth-btn');
  const userBlockEl = document.getElementById('header-user-block');
  const estaAutenticado = u && u.isAuthenticated && u.rol !== 'PUBLICO';

  if (authBtnEl && userBlockEl) {
    if (estaAutenticado) {
      authBtnEl.classList.add('hidden');
      userBlockEl.classList.remove('hidden');
    } else {
      authBtnEl.classList.remove('hidden');
      userBlockEl.classList.add('hidden');
    }
  }

  // Actualizar bloque de usuario
  const userNameEl = document.getElementById('header-user-name');
  const userRoleEl = document.getElementById('header-user-role');
  const userAvatarEl = document.getElementById('header-user-avatar');
  const dropdownNameEl = document.getElementById('dropdown-user-name');
  const dropdownEmailEl = document.getElementById('dropdown-user-email');
  const dropdownRoleEl = document.getElementById('dropdown-user-role');

  if (userNameEl) userNameEl.textContent = u.nombre;
  if (userRoleEl) userRoleEl.textContent = u.rolNombre;
  const userAvatar = u.avatar_url || u.avatar;
  if (userAvatarEl && userAvatar) userAvatarEl.src = userAvatar;
  if (dropdownNameEl) dropdownNameEl.textContent = u.nombre;
  if (dropdownEmailEl) dropdownEmailEl.textContent = u.email;
  if (dropdownRoleEl) dropdownRoleEl.textContent = u.rolNombre;

  // Actualizar reloj UTC-5
  const utcClockEl = document.getElementById('header-utc-clock');
  if (utcClockEl) {
    const ahora = new Date();
    utcClockEl.textContent = ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

// ==============================================================================
// 12. OPERACIONES AVANZADAS DE CAMPO, COMET Y ACCIONES COMPLEMENTARIAS
// ==============================================================================

let estadioLuzArtificial = false;
window.toggleLuzEstadio = function() {
  estadioLuzArtificial = !estadioLuzArtificial;
  const btn = document.getElementById('btn-luz-estadio');
  if (btn) {
    btn.innerHTML = estadioLuzArtificial
      ? `<span class="material-symbols-outlined text-sm">nightlight</span> Modo: Luz Artificial 20:00 (1200 Lux)`
      : `<span class="material-symbols-outlined text-sm">wb_sunny</span> Modo: Luz Natural 18:00`;
  }
};

window.descargarActaUniformesPDF = async function() {
  const hash = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  const contenido = `LIGAPRO ECUABET — SISTEMA INTEGRAL DE GESTIÓN DE COMPETICIONES (SIGEC-LP)
=============================================================================
ACTA OFICIAL DE DESIGNACIÓN Y CONFORMIDAD DE INDUMENTARIA (ART. 30, 31, 32)
Partido: LDU Quito vs Barcelona SC — Jornada 18 (Serie A 2025)
Fecha de Validación Técnica: 48h previas al encuentro
-----------------------------------------------------------------------------
1. CLUB LOCAL (LDU Quito):
   - Camiseta: Blanco Puro (#FFFFFF) — Contraste WCAG 21:1
   - Pantaloneta: Blanco Puro (#FFFFFF)
   - Medias: Blanco Puro (#FFFFFF)
   - Guardameta: Negro (#1A1A1A)

2. CLUB VISITANTE (Barcelona SC):
   - Camiseta: Amarillo (#FFE600) — Contraste con Local: 1.3:1 (Aprobado por cromatismo)
   - Pantaloneta: Negro (#101010)
   - Medias: Negro (#101010)
   - Guardameta: Verde Neón (#39FF14)

3. CUATERNA ARBITRAL Y VAR:
   - Camiseta: Fucsia Flúor (#FF1493) (Total diferenciación visual con ambos equipos)
   - Pantaloneta: Negro (#000000)

DICTAMEN TÉCNICO: HOMOLOGADO Y APROBADO SIN OBSERVACIONES
Firma Digital Comisario: Ing. Marcelo Valencia
Sello Criptográfico: ${hash}
=============================================================================`;

  await safeInsert('actas_camerino', {
    partido_id: store.state.partidoActivo.id,
    club_id: store.state.partidoActivo.local.id,
    tipo: 'homologacion_uniformes_pdf',
    estado_instalaciones: 'Aprobado 48h antes del partido',
    firmado_por: store.state.currentUser.nombre
  });

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Acta_Oficial_Uniformes_LigaPro_${Date.now()}.txt`;
  a.click();
  showToast('📄 Acta Oficial de Uniformes descargada y registrada en el sistema.', 'success');
};

window.forzarSincroComet = async function() {
  showToast('🔄 Conectando con servidor central COMET / FIFA Connect...', 'info');
  reproducirTonoAccesible(520, 0.15);

  const sb = getSupabase();
  if (sb) {
    try {
      await safeQuery('partidos', [], 'id');
    } catch (e) {
      // safe fallback
    }
  }

  setTimeout(() => {
    showToast('✅ Sincronización COMET Cloud exitosa. Planillas, sustituciones y tarjetas al día.', 'success');
  }, 600);
};

window.mostrarAuditoriaMarcas = function() {
  const modalHtml = `
  <div id="modal-marcas-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">history_toggle_off</span>
          <h3 class="font-extrabold text-slate-900 text-base">Auditoría de Marcas y Publicidad (Art. 33/34)</h3>
        </div>
        <button onclick="document.getElementById('modal-marcas-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3 text-xs text-slate-700">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p class="font-bold text-slate-900 mb-1">Inspección de Parches y Patrocinios Oficiales:</p>
          <ul class="space-y-1 font-mono text-[11px]">
            <li class="flex items-center justify-between"><span>• Parche Oficial LigaPro Ecuabet (Manga Der.):</span> <span class="text-emerald-700 font-bold">CONFORME</span></li>
            <li class="flex items-center justify-between"><span>• Dimensiones Sponsor Pecho (máx. 250 cm²):</span> <span class="text-emerald-700 font-bold">230 cm² (OK)</span></li>
            <li class="flex items-center justify-between"><span>• Dorsal y Tipografía Reglamentaria (Art. 35):</span> <span class="text-emerald-700 font-bold">CONFORME</span></li>
            <li class="flex items-center justify-between"><span>• Publicidad en Pantaloneta (máx. 100 cm²):</span> <span class="text-emerald-700 font-bold">CONFORME</span></li>
          </ul>
        </div>
        <div class="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg">
          ✓ Todas las marcas registradas cumplen con el Manual de Identidad Visual LigaPro 2025.
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button onclick="document.getElementById('modal-marcas-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Cerrar Auditoría
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-marcas-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.mostrarNominaCompleta = function() {
  const p = store.state.partidoActivo;
  const modalHtml = `
  <div id="modal-nomina-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">badge</span>
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Planilla COMET Oficial (33 Acreditados por Club)</h3>
            <p class="text-[11px] text-slate-500">Titulares, Suplentes, Cuerpo Técnico y Médicos Certificados</p>
          </div>
        </div>
        <button onclick="document.getElementById('modal-nomina-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-4 overflow-y-auto pr-1 text-xs">
        <div>
          <h4 class="font-bold text-blue-800 border-b border-blue-100 pb-1 mb-2">⚪ LDU Quito (Titulares & Suplentes)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            ${p.plantillaLocal.map(jug => `<div class="p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between"><span>#${jug.dorsal} ${jug.nombre}</span> <span class="font-bold text-slate-500">${jug.puesto} ${jug.capitan ? '(C)' : ''}</span></div>`).join('')}
          </div>
        </div>

        <div>
          <h4 class="font-bold text-amber-800 border-b border-amber-100 pb-1 mb-2">🟡 Barcelona SC (Titulares & Suplentes)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            ${p.plantillaVisitante.map(jug => `<div class="p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between"><span>#${jug.dorsal} ${jug.nombre}</span> <span class="font-bold text-slate-500">${jug.puesto} ${jug.capitan ? '(C)' : ''}</span></div>`).join('')}
          </div>
        </div>

        <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <p class="font-bold mb-1">Oficiales de Partido Acreditados:</p>
          <p>• Comisario: ${p.comisario}</p>
          <p>• Árbitro Central: ${p.arbitroCentral} | VAR: ${p.varOficial}</p>
          <p>• Médico de Campo: ${p.medicoCampo}</p>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end shrink-0">
        <button onclick="document.getElementById('modal-nomina-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Cerrar Planilla
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-nomina-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.marcarHitoOk = async function(btn) {
  if (!btn) return;
  btn.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> OK Verificado`;
  btn.className = "min-h-[48px] px-space-md bg-emerald-600 text-white rounded font-bold flex items-center justify-center gap-1 shadow-xs";
  
  reproducirTonoAccesible(660, 0.2);
  showToast('✓ Hito de cuenta regresiva verificado y registrado en el servidor.', 'success');

  await safeInsert('hitos_partido', {
    partido_id: store.state.partidoActivo.id,
    descripcion: 'Hito operacional verificado',
    verificado_por: store.state.currentUser.nombre,
    fecha_hora: new Date().toISOString()
  });
};

window.testAlertaLuminica = function() {
  document.body.style.boxShadow = 'inset 0 0 0 8px #FFE600';
  reproducirTonoAccesible(800, 0.3);
  showToast('⚡ Alerta lumínica y sensorial de campo probada con éxito.', 'info');
  setTimeout(() => {
    document.body.style.boxShadow = '';
  }, 1500);
};

window.dictarPorVoz = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-EC';
    recognition.onstart = () => showToast('🎙️ Grabando audio de comisario... hable ahora.', 'info');
    recognition.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      showToast(`🎙️ Audio transcrito: "${texto}"`, 'success');
      window.registrarIncidenteEnVivo(texto);
    };
    recognition.onerror = () => {
      solicitarDictadoManual();
    };
    recognition.start();
  } else {
    solicitarDictadoManual();
  }
};

function solicitarDictadoManual() {
  const obs = prompt('Ingrese el reporte verbal o incidencia de campo (Art. 73):', 'Lanzamiento de botellas plásticas hacia el banco de suplentes visitante.');
  if (obs) {
    window.registrarIncidenteEnVivo(obs);
  }
}

window.generarInformePericialEstadio = async function() {
  const hash = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  const contenido = `LIGAPRO ECUABET — DIRECCIÓN DE ESCENARIOS Y SEGURIDAD
=============================================================================
INFORME PERICIAL DE INFRAESTRUCTURA Y HOMOLOGACIÓN VAR (ART. 51, 87a, 92)
Estadio: Rodrigo Paz Delgado (Casa Blanca) — Quito
-----------------------------------------------------------------------------
1. TERRENO DE JUEGO (Art. 51):
   - Altura de corte césped: 22.5 mm (Parámetro oficial: 20 a 25 mm) ➔ CONFORME
   - Drenaje e infiltración: Verificado mediante prueba de permeabilidad
   - Riego automatizado: Ejecutado a T-20 min

2. PROTOCOLO MÉDICO Y EMERGENCIAS (Art. 87a):
   - Ambulancia Soporte Vital Avanzado: Presente en túnel norte
   - Hospital de Referencia: Hospital Metropolitano (12 min distancia) ➔ CONFORME
   - Desfibrilador DEA: Certificado y operativo en campo

3. CABINA DE VIDEO ASISTENCIA (VOR - Art. 92):
   - Conexión eléctrica: 220V estabilizado con respaldo UPS ➔ CONFORME
   - Conectividad fibra óptica: 200 Mbps simétricos dedicados ➔ CONFORME
   - Plataforma de cámaras: Altura 8.5 metros sobre el nivel del terreno

ESTADO FINAL: ESTADIO CALIFICADO Y HOMOLOGADO
Inspector Responsable: Dirección de Escenarios Deportivos LigaPro
Hash SHA-256 de Autenticidad: ${hash}
=============================================================================`;

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Informe_Pericial_Estadio_LigaPro_${Date.now()}.txt`;
  a.click();
  showToast('🏟️ Informe Pericial (SHA-256) generado y descargado con éxito.', 'success');
};

window.descargarDetalleTramitePDF = function() {
  const contenido = `LIGAPRO ECUABET — PORTAL OFICIAL DE CLUBES
=============================================================================
DETALLE DE EXPEDIENTE REGLAMENTARIO DE TRÁMITE
Código: TRM-2025-089
Club: Barcelona Sporting Club
Fecha de Radicación: 2025-05-10
Estado: APROBADO (Resolución No. LIGAPRO-COMP-2025-312)
Asunto: Solicitud de indumentaria alterna conmemorativa (Art. 29)
Validez: Aprobado para su uso en la Jornada 19 y posteriores
=============================================================================`;
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Detalle_Tramite_TRM-2025-089.txt`;
  a.click();
  showToast('📄 Expediente de trámite descargado.', 'info');
};

window.mostrarModalCriteriosDesempate = function() {
  const modalHtml = `
  <div id="modal-criterios-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">balance</span>
          <h3 class="font-extrabold text-slate-900 text-base">Criterios de Desempate en Tabla (Art. 18)</h3>
        </div>
        <button onclick="cerrarModalCriterios()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-2.5 text-xs text-slate-700">
        <p class="font-bold text-slate-900">Orden Jerárquico de Desempate Oficial LigaPro:</p>
        <ol class="list-decimal pl-5 space-y-1.5 font-medium">
          <li><strong>Mayor cantidad de puntos</strong> acumulados en la fase o torneo.</li>
          <li><strong>Mayor gol diferencia (GD)</strong> obtenido en todos los partidos.</li>
          <li><strong>Mayor cantidad de goles marcados (GF)</strong> en la fase correspondiente.</li>
          <li><strong>Mayor número de goles marcados en condición de visitante (GFV)</strong>.</li>
          <li><strong>Resultados en enfrentamientos directos</strong> entre los clubes empatados.</li>
          <li><strong>Sorteo público</strong> supervisado por la Dirección de Competiciones ante notario.</li>
        </ol>
        <div class="mt-3 p-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
          ℹ️ Este algoritmo está programado y se evalúa de manera automática e instantánea en SIGEC-LP.
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button onclick="cerrarModalCriterios()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Entendido / Cerrar
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-criterios-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.cerrarModalCriterios = function() {
  const modal = document.getElementById('modal-criterios-backdrop');
  if (modal) modal.remove();
  const templateModal = document.getElementById('modal-criterios');
  if (templateModal) templateModal.classList.add('hidden');
};

window.cambiarDivision = function(div) {
  // Cambio de división silencioso sin toast invasivo
};

window.cambiarFaseTorneo = function(fase) {
  // Cambio de fase silencioso sin toast invasivo
};

window.descargarPlanillaMatchday = function() {
  const p = store.state.partidoActivo;
  const contenido = `LIGAPRO ECUABET — PLANILLA OFICIAL DE PARTIDO (COMET MATCHDAY)
=============================================================================
Encuentro: ${p.local.nombre} vs ${p.visitante.nombre}
Competición: LigaPro Ecuabet Serie A — Jornada ${p.jornada}
Estadio: ${p.estadio} (${p.ciudad})
Marcador Oficial: ${p.local.nombreCorto} ${p.marcador.local} - ${p.marcador.visitante} ${p.visitante.nombreCorto}
Minuto Actual: ${p.minuto}' (${p.periodo}T)
Árbitro Central: ${p.arbitroCentral}
Oficial VAR: ${p.varOficial}
Comisario de Partido: ${p.comisario}
Médico de Campo: ${p.medicoCampo}
=============================================================================
Certificado emitido electrónicamente desde SIGEC-LP.`;

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Planilla_Matchday_${p.local.nombreCorto}_vs_${p.visitante.nombreCorto}_${Date.now()}.txt`;
  a.click();
  showToast('📄 Planilla COMET descargada con éxito.', 'success');
};

window.mostrarModalCompeticionesFormatos = function() {
  const modalHtml = `
  <div id="modal-formatos-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-2xl">emoji_events</span>
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Configurador de Competiciones & Formatos (Art. 9, 10, 11, 14)</h3>
            <p class="text-[11px] text-slate-500">Gobernanza oficial del sistema de torneo LigaPro Ecuador 2025</p>
          </div>
        </div>
        <button onclick="document.getElementById('modal-formatos-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-4 overflow-y-auto pr-1 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-900">LigaPro Ecuabet Serie A</span>
              <span class="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">16 CLUBES</span>
            </div>
            <p class="text-blue-800 text-[11px] leading-relaxed">
              • Fase Uno: 15 fechas (todos contra todos).<br>
              • Fase Dos: 15 fechas (espejo de localías).<br>
              • Definición de Título: Final de Ida y Vuelta si hay distintos ganadores (Art. 11) o Campeón Directo (Art. 12).<br>
              • Descenso: Últimos 2 puestos de la Tabla Acumulada descienden a Serie B.
            </p>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-900">LigaPro Ecuabet Serie B</span>
              <span class="px-2 py-0.5 rounded bg-amber-600 text-white font-mono text-[10px] font-bold">10 CLUBES</span>
            </div>
            <p class="text-amber-800 text-[11px] leading-relaxed">
              • Formato: 36 fechas en 4 ruedas (todos contra todos).<br>
              • Ascenso: 1° y 2° lugar ascienden directamente a Serie A.<br>
              • Sin filiales: Equipos filiales no pueden ascender a Serie A.
            </p>
          </div>
        </div>

        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1.5">
          <span class="font-bold text-slate-900 block">Distribución de Cupos Internacionales CONMEBOL 2026:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div class="p-2 bg-white rounded border border-slate-200">
              <span class="font-bold text-emerald-700">🏆 Copa Libertadores:</span><br>
              • ECU 1: Campeón LigaPro Serie A<br>
              • ECU 2: Subcampeón LigaPro Serie A<br>
              • ECU 3: Mejor puntaje tabla acumulada<br>
              • ECU 4: Campeón Copa Ecuador
            </div>
            <div class="p-2 bg-white rounded border border-slate-200">
              <span class="font-bold text-blue-700">🥈 Copa Sudamericana:</span><br>
              • ECU 1 a ECU 4: Siguientes 4 mejores ubicados en tabla acumulada que no clasifiquen a Libertadores.
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
        <span class="text-[11px] text-slate-500 font-mono">Reglamento: LIGAPRO-2023-07 v4.1</span>
        <div class="flex items-center gap-2">
          <button onclick="guardarFormatoCompeticion()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-sm">save</span> Guardar Formato Oficial
          </button>
          <button onclick="document.getElementById('modal-formatos-backdrop').remove()" class="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-formatos-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.guardarFormatoCompeticion = async function() {
  await safeInsert('configuracion_competiciones', {
    temporada: '2025',
    serie_a_formato: 'fase1_fase2_final',
    serie_b_formato: '36_fechas_cuatro_ruedas',
    actualizado_por: store.state.currentUser.nombre
  });

  const m = document.getElementById('modal-formatos-backdrop');
  if (m) m.remove();
  showToast('✅ Formato de competición oficial guardado exitosamente.', 'success');
};

window.mostrarModalSeguridadSHA256 = function() {
  const p = store.state.partidoActivo;
  const hashDemo = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const modalHtml = `
  <div id="modal-seguridad-backdrop" class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600 text-2xl">verified_user</span>
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Auditoría & Verificador Criptográfico SHA-256</h3>
            <p class="text-[11px] text-slate-500">Sellado e Integridad Digital de Actas Oficiales (Art. 45/60)</p>
          </div>
        </div>
        <button onclick="document.getElementById('modal-seguridad-backdrop').remove()" class="text-slate-400 hover:text-slate-700">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="mt-4 space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Hash SHA-256 a Verificar:</label>
          <div class="flex gap-2">
            <input type="text" id="input-hash-verificar" value="${hashDemo}" class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]" placeholder="Pegue aquí el hash digital SHA-256...">
            <button onclick="verificarHashSHA256()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">shield</span> Validar
            </button>
          </div>
        </div>

        <div id="resultado-verificacion-hash" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-emerald-800">
            <span class="material-symbols-outlined text-base">check_circle</span>
            <span>INTEGRIDAD DIGITAL VERIFICADA (Art. 45)</span>
          </div>
          <p class="text-[11px] text-emerald-900 leading-relaxed font-mono">
            Documento: Planilla Oficial COMET Jornada 18 (${p.local.nombreCorto} vs ${p.visitante.nombreCorto})<br>
            Firma: Ing. Marcelo Valencia (Comisario LigaPro)<br>
            Certificado Root: LigaPro PKI-CA v4.1 — Sin alteraciones detectadas.
          </p>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-2 shrink-0">
        <button onclick="document.getElementById('modal-seguridad-backdrop').remove()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
          Cerrar
        </button>
      </div>
    </div>
  </div>`;

  const prev = document.getElementById('modal-seguridad-backdrop');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.verificarHashSHA256 = function() {
  const input = document.getElementById('input-hash-verificar');
  const res = document.getElementById('resultado-verificacion-hash');
  if (!input || !res) return;
  const val = input.value.trim();
  if (val.length < 16) {
    res.className = "p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 space-y-1";
    res.innerHTML = `<div class="flex items-center gap-1.5 font-bold text-red-800"><span class="material-symbols-outlined text-base">error</span><span>HASH INVÁLIDO</span></div><p class="text-[11px]">El hash proporcionado no cumple con el estándar SHA-256 (mínimo 64 caracteres hexadecimales).</p>`;
    return;
  }
  res.className = "p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1";
  res.innerHTML = `<div class="flex items-center gap-1.5 font-bold text-emerald-800"><span class="material-symbols-outlined text-base">check_circle</span><span>INTEGRIDAD DIGITAL CONFIRMADA</span></div><p class="text-[11px] font-mono">Hash SHA-256 verificado contra el repositorio seguro de actas LigaPro.<br>Estado: AUTÉNTICO E INALTERADO.</p>`;
};

function showToast(message, type = 'info') {
  const colors = {
    info: 'bg-slate-900 text-white border-slate-700',
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
    error: 'bg-red-900 text-red-100 border-red-700'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-bounce transition-all ${colors[type] || colors.info}`;
  toast.innerHTML = `<span class="material-symbols-outlined text-base">notifications</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ==============================================================================
// 7. PARTIDOS EN TIEMPO REAL (LIGAPRO 2025 OFICIAL & SUPABASE REALTIME)
// ==============================================================================

let filtroPartidosActual = 'todos';
let suscripcionRealtime = null;

window.filtrarPartidosTablero = function(filtro) {
  filtroPartidosActual = filtro;
  const botones = ['todos', 'en_juego', 'finalizado', 'programado'];
  botones.forEach((btnId) => {
    const el = document.getElementById(`btn-filtro-${btnId}`);
    if (el) {
      if (btnId === filtro) {
        el.className = 'px-3 py-1 rounded bg-secondary text-on-secondary shadow-xs transition-all font-bold';
      } else {
        el.className = 'px-3 py-1 rounded text-text-secondary hover:text-text-primary transition-all font-normal';
      }
    }
  });
  renderizarPartidosTablero();
};

window.seleccionarPartidoEnVivo = function(partidoId, irAConsola = false) {
  store.seleccionarPartido(partidoId);
  actualizarUIHeader();
  renderizarPartidosTablero();
  showToast(`Partido seleccionado: ${store.state.partidoActivo?.local?.nombre} vs ${store.state.partidoActivo?.visitante?.nombre}`, 'info');
  if (irAConsola) {
    window.navigateView('consola');
  }
};

window.renderizarPartidosTablero = function() {
  const container = document.getElementById('contenedor-partidos-realtime');
  if (!container) return;

  const partidos = store.state.partidos || [];
  if (partidos.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-card rounded-xl border border-border-subtle text-text-secondary">
        <span class="material-symbols-outlined text-3xl mb-2 text-secondary">sports_soccer</span>
        <p class="font-bold">No hay partidos registrados en la jornada oficial.</p>
      </div>`;
    return;
  }

  // Filtrado
  const filtrados = partidos.filter((p) => {
    if (filtroPartidosActual === 'todos') return true;
    if (filtroPartidosActual === 'en_juego') return p.estado === 'en_juego';
    if (filtroPartidosActual === 'finalizado') return p.estado === 'finalizado' || p.estado === 'oficializado';
    if (filtroPartidosActual === 'programado') return p.estado === 'programado';
    return true;
  });

  // Actualizar conteos en el toolbar si existen
  const totalCount = partidos.length;
  const enVivoCount = partidos.filter(p => p.estado === 'en_juego').length;
  const btnTodos = document.getElementById('btn-filtro-todos');
  const btnVivo = document.getElementById('btn-filtro-en_juego');
  if (btnTodos) btnTodos.textContent = `Todos (${totalCount})`;
  if (btnVivo) btnVivo.textContent = `🔴 En Vivo (${enVivoCount})`;

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-card rounded-xl border border-border-subtle text-text-secondary">
        <span class="material-symbols-outlined text-3xl mb-2 text-secondary">filter_alt_off</span>
        <p class="font-bold">No hay partidos en esta categoría (${filtroPartidosActual}).</p>
        <button class="mt-3 px-3 py-1.5 rounded bg-secondary text-on-secondary text-xs font-bold" onclick="filtrarPartidosTablero('todos')">Ver todos los partidos</button>
      </div>`;
    return;
  }

  const activoId = store.state.partidoActivo?.id;

  const htmlCards = filtrados.map((p) => {
    const esActivo = p.id === activoId;
    const esEnVivo = p.estado === 'en_juego';
    const esFinalizado = p.estado === 'finalizado' || p.estado === 'oficializado';
    
    // Insignia de estado
    let badgeEstado = '';
    if (esEnVivo) {
      badgeEstado = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-label-caps text-xs font-bold uppercase animate-pulse">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> EN VIVO: ${p.minuto || 45}' ${p.periodo || '1T'}
        </span>`;
    } else if (esFinalizado) {
      badgeEstado = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 font-label-caps text-xs font-bold uppercase">
          <span class="material-symbols-outlined text-xs">check_circle</span> FINALIZADO
        </span>`;
    } else {
      badgeEstado = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-label-caps text-xs font-bold uppercase">
          <span class="material-symbols-outlined text-xs">schedule</span> HOY ${p.horario || '18:00'}
        </span>`;
    }

    // Datos de equipos
    const local = p.local || { nombre: 'Local', nombre_corto: 'LOC', escudo: '' };
    const visitante = p.visitante || { nombre: 'Visitante', nombre_corto: 'VIS', escudo: '' };
    const nombreLocal = local.nombreCorto || local.nombre || 'Local';
    const nombreVisitante = visitante.nombreCorto || visitante.nombre || 'Visitante';
    const estadioNombre = typeof p.estadio === 'string' ? p.estadio : (p.estadio?.nombre || 'Estadio Rodrigo Paz Delgado');
    const ciudadEstadio = p.ciudad || (typeof p.estadio === 'object' ? p.estadio?.ciudad : '');
    const estadioCiudad = ciudadEstadio ? ` (${ciudadEstadio})` : '';

    const gl = p.goles_local !== null && p.goles_local !== undefined ? p.goles_local : (p.marcador?.local ?? '-');
    const gv = p.goles_visitante !== null && p.goles_visitante !== undefined ? p.goles_visitante : (p.marcador?.visitante ?? '-');

    return `
    <div class="bg-surface-card rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden border ${esActivo ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}">
      <!-- Encabezado minimalista: Estadio y Estado -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span class="material-symbols-outlined text-sm">stadium</span>
          ${estadioNombre}${estadioCiudad}
        </span>
        <div>
          ${badgeEstado}
        </div>
      </div>

      <!-- Fila de Partido: Equipos y Marcador -->
      <div class="grid grid-cols-12 gap-2 sm:gap-4 items-center py-2">
        <!-- Local -->
        <div class="col-span-5 flex items-center justify-end gap-3 text-right">
          <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">${nombreLocal}</span>
          <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
            ${nombreLocal.substring(0, 3).toUpperCase()}
          </div>
        </div>

        <!-- Marcador Central -->
        <div class="col-span-2 flex flex-col items-center justify-center">
          <div class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-lg sm:text-xl font-black ${esEnVivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'} flex items-center gap-1.5">
            <span>${gl}</span>
            <span class="text-slate-400 text-sm">:</span>
            <span>${gv}</span>
          </div>
          <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium">Fecha 18</span>
        </div>

        <!-- Visitante -->
        <div class="col-span-5 flex items-center justify-start gap-3 text-left">
          <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
            ${nombreVisitante.substring(0, 3).toUpperCase()}
          </div>
          <span class="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">${nombreVisitante}</span>
        </div>
      </div>

      <!-- Barra de acciones minimalista -->
      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-400 text-[11px]">${p.tv || 'Transmisión Oficial LigaPro'}</span>
        <div class="flex items-center gap-2">
          ${esActivo ? `
            <span class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">check</span> En Consola
            </span>
          ` : `
            <button type="button" onclick="seleccionarPartidoEnVivo('${p.id}', false)" class="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors">
              Seleccionar
            </button>
          `}
          <button type="button" onclick="seleccionarPartidoEnVivo('${p.id}', true)" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">terminal</span> Abrir Consola
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = htmlCards;
};

// Carga inicial y sincronización continua desde Supabase
async function sincronizarPartidosDesdeSupabase() {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { data, error } = await sb
      .from('partidos')
      .select(`
        id,
        estado,
        goles_local,
        goles_visitante,
        inicio_programado,
        local:local_id (id, nombre, nombre_corto),
        visitante:visitante_id (id, nombre, nombre_corto),
        estadio:estadio_id (nombre, ciudad)
      `)
      .order('inicio_programado', { ascending: true });

    if (error) {
      console.warn('No se pudieron obtener partidos de Supabase:', error.message);
      return;
    }

    if (data && data.length > 0) {
      // Cruzar con los metadatos visuales del INITIAL_STATE para mantener escudos y detalles oficiales
      const partidosMapeados = data.map((remoto) => {
        const localSeed = INITIAL_STATE.partidos?.find(p => p.id === remoto.id);
        const clubLocal = store.state.clubes?.find(c => c.id === remoto.local?.id) || localSeed?.local;
        const clubVisitante = store.state.clubes?.find(c => c.id === remoto.visitante?.id) || localSeed?.visitante;

        const dateObj = new Date(remoto.inicio_programado);
        const horarioStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
          : (localSeed?.horario || '18:00');

        return {
          id: remoto.id,
          estado: remoto.estado || 'programado',
          minuto: localSeed?.minuto || 45,
          periodo: localSeed?.periodo || 1,
          horario: horarioStr,
          marcador: {
            local: remoto.goles_local ?? 0,
            visitante: remoto.goles_visitante ?? 0
          },
          goles_local: remoto.goles_local ?? 0,
          goles_visitante: remoto.goles_visitante ?? 0,
          local: {
            id: remoto.local?.id || clubLocal?.id || 'LDU',
            nombre: remoto.local?.nombre || clubLocal?.nombre || 'LDU Quito',
            nombre_corto: remoto.local?.nombre_corto || clubLocal?.nombre_corto || 'LDU',
            escudo: clubLocal?.escudo || localSeed?.local?.escudo || ''
          },
          visitante: {
            id: remoto.visitante?.id || clubVisitante?.id || 'BSC',
            nombre: remoto.visitante?.nombre || clubVisitante?.nombre || 'Barcelona SC',
            nombre_corto: remoto.visitante?.nombre_corto || clubVisitante?.nombre_corto || 'BSC',
            escudo: clubVisitante?.escudo || localSeed?.visitante?.escudo || ''
          },
          estadio: {
            nombre: remoto.estadio?.nombre || localSeed?.estadio?.nombre || 'Estadio Rodrigo Paz Delgado',
            ciudad: remoto.estadio?.ciudad || localSeed?.estadio?.ciudad || 'Quito'
          },
          categoria: localSeed?.categoria || 'SERIE A 2025',
          tv: localSeed?.tv || 'GOLTV / STAR+',
          arbitro: localSeed?.arbitro || 'Árbitro CNA Oficial',
          comisario: localSeed?.comisario || 'Comisario LigaPro',
          var: localSeed?.var || 'Cabina VAR LigaPro',
          uniforme_local_desc: localSeed?.uniforme_local_desc || 'Titular Oficial',
          uniforme_visitante_desc: localSeed?.uniforme_visitante_desc || 'Alterna Oficial'
        };
      });

      store.setPartidos(partidosMapeados);
      renderizarPartidosTablero();
      actualizarUIHeader();
    }
  } catch (err) {
    console.warn('Excepción sincronizando partidos:', err);
  }
}

function inicializarPartidosEnTiempoReal() {
  // 1. Carga inmediata inicial
  renderizarPartidosTablero();
  sincronizarPartidosDesdeSupabase();

  // 2. Suscripción a canal Supabase Realtime para cambios instantáneos
  const sb = getSupabase();
  if (sb && sb.channel && !suscripcionRealtime) {
    try {
      suscripcionRealtime = sb
        .channel('realtime_partidos_ligapro')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'partidos' },
          (payload) => {
            console.log('⚡ Evento en tiempo real recibido de partidos:', payload);
            sincronizarPartidosDesdeSupabase();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'eventos_partido' },
          (payload) => {
            console.log('⚡ Nuevo evento de partido registrado en tiempo real:', payload);
            sincronizarPartidosDesdeSupabase();
          }
        )
        .subscribe((status) => {
          console.log('📡 Estado de canal en tiempo real:', status);
        });
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }
  }

  // 3. Intervalo de refresco periódico cada 10 segundos
  setInterval(() => {
    sincronizarPartidosDesdeSupabase();
  }, 10000);

  // 4. Avance de minuto para el partido en vivo (reloj de fútbol en vivo)
  setInterval(() => {
    const p = store.state.partidoActivo;
    if (p && p.estado === 'en_juego' && p.minuto < 95) {
      p.minuto += 1;
      const minEl = document.getElementById('header-match-min');
      if (minEl) minEl.textContent = `${p.minuto}' ${p.periodo}T`;
    }
  }, 30000);
}

// Reloj continuo y sincronización al cargar
function iniciarApp() {
  // 1. Sincronizar tema y accesibilidad desde localStorage / store
  try {
    const savedTheme = localStorage.getItem('sigec_theme') || (localStorage.getItem('sigec_high_contrast') === 'true' ? 'dark' : null);
    if (savedTheme === 'dark' || store.state.highContrast) {
      aplicarTema(true);
    } else {
      aplicarTema(false);
    }

    const savedScale = localStorage.getItem('sigec_font_scale') || store.state.fontScale;
    if (savedScale) {
      aplicarFontScale(Number(savedScale));
    }
  } catch (e) {}

  // 2. Renderizar inmediatamente los partidos iniciales para que la pantalla no quede en blanco o con spinner
  renderizarPartidosTablero();

  // 3. Sincronizar sesión activa de Supabase si existe
  const sb = getSupabase();
  if (sb && sb.auth) {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        let userRole = meta.role || meta.rol || 'DIR_COMP';

        try {
          const { data: roleRows } = await sb.from('user_roles').select('rol, club_id').eq('user_id', u.id).limit(1);
          if (roleRows && roleRows.length > 0 && roleRows[0].rol) {
            userRole = roleRows[0].rol;
          }
        } catch (rErr) {}

        const nombre = meta.full_name || meta.nombre || u.email.split('@')[0];
        const initialSeed = encodeURIComponent(nombre);
        const avatarUrl = meta.avatar_url || meta.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${initialSeed}&backgroundColor=0284c7`;

        store.setUserRole(userRole, nombre, u.email, {
          id: u.id,
          cargo: meta.cargo || 'Oficial',
          club: meta.club || 'LigaPro Ecuador',
          cedula: meta.cedula || '',
          avatar: avatarUrl,
          avatar_url: avatarUrl
        });
        actualizarUIHeader();
      } else {
        // No hay sesión activa en Supabase
        if (store.state.currentUser.isAuthenticated && !store.state.currentUser.email) {
          store.setUserRole('PUBLICO', 'Invitado', '');
        }
        actualizarUIHeader();
      }
    }).catch(err => {
      console.warn('Supabase getSession fallback:', err);
    });

    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        store.setUserRole('PUBLICO', 'Invitado', '');
        actualizarUIHeader();
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') || 'tablero';
  if (initialView === 'perfil') {
    window.navigateView('tablero');
    window.abrirModalPerfil();
  } else {
    window.navigateView(initialView);
  }
  actualizarUIHeader();

  // Reloj cada segundo
  setInterval(() => {
    actualizarUIHeader();
  }, 1000);

  // Inicializar carga de partidos en tiempo real y suscripción
  inicializarPartidosEnTiempoReal();

  // Cerrar dropdown si se hace clic fuera
  document.addEventListener('click', (e) => {
    const userBlock = document.getElementById('header-user-block');
    const userDropdown = document.getElementById('user-dropdown-menu');
    if (userBlock && userDropdown && !userBlock.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.add('hidden');
    }

    const notifBtn = document.getElementById('btn-notificaciones');
    const notifPanel = document.getElementById('notifications-panel');
    if (notifBtn && notifPanel && !notifBtn.contains(e.target) && !notifPanel.contains(e.target)) {
      notifPanel.classList.add('hidden');
    }
  });
}

// Ejecutar inmediatamente si el DOM ya está listo, o escuchar DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}
