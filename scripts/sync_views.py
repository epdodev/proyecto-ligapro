"""
SIGEC-LP — Sincroniza las vistas desde src/views/*.html (fuente única de verdad)
hacia index.html (SPA) y hacia cada página suelta (tablero.html, posiciones.html, ...).

Uso:
    python scripts/sync_views.py

Edita siempre la plantilla en src/views/<vista>.html y luego ejecuta este script.
No edites a mano el contenido entre <main class="w-full flex-1"> y </main> de los HTML.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIEWS_DIR = os.path.join(ROOT, 'src', 'views')

# id de vista -> página suelta (el orden define el orden dentro de index.html)
VIEWS = [
    ('tablero', 'tablero.html'),
    ('posiciones', 'posiciones.html'),
    ('clubes', 'clubes.html'),
    ('uniformes', 'uniformes.html'),
    ('estadios', 'estadios.html'),
    ('consola', 'consola.html'),
    ('consola_alto_contraste', 'consola-alto-contraste.html'),
    ('consola_tablet', 'consola-tablet.html'),
    ('auth', 'login.html'),
]

MAIN_OPEN = '<main class="w-full flex-1">'
MAIN_CLOSE_RE = re.compile(r'\n[ \t]*</main>\s*\n[ \t]*<footer class="border-t')


def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write(path, content):
    # Conservar el fin de línea original del archivo (CRLF en Windows, LF en otros)
    newline = '\n'
    if os.path.exists(path):
        with open(path, 'rb') as f:
            if b'\r\n' in f.read(4096):
                newline = '\r\n'
    with open(path, 'w', encoding='utf-8', newline=newline) as f:
        f.write(content)


def replace_main(html, inner, filename):
    start = html.find(MAIN_OPEN)
    closes = list(MAIN_CLOSE_RE.finditer(html))
    if start == -1 or not closes:
        sys.exit(f'ERROR: no se encontraron los marcadores <main>/<footer> en {filename}')
    end = closes[-1].start()
    return html[:start + len(MAIN_OPEN)] + '\n' + inner.rstrip() + '\n' + html[end:]


def indent(text, spaces):
    pad = ' ' * spaces
    return '\n'.join((pad + line) if line.strip() else '' for line in text.strip('\n').split('\n'))


def main():
    partials = {}
    for view_id, _ in VIEWS:
        path = os.path.join(VIEWS_DIR, f'{view_id}.html')
        if not os.path.exists(path):
            sys.exit(f'ERROR: falta la plantilla {path}')
        partials[view_id] = read(path)

    # 1. index.html: todas las vistas, solo "tablero" visible al cargar
    blocks = []
    for view_id, _ in VIEWS:
        hidden = '' if view_id == 'tablero' else ' hidden'
        blocks.append(
            f'    <div id="view-{view_id}" class="sigec-view-container{hidden} w-full">\n'
            f'{indent(partials[view_id], 6)}\n'
            f'    </div>'
        )
    index_path = os.path.join(ROOT, 'index.html')
    write(index_path, replace_main(read(index_path), '\n\n'.join(blocks), 'index.html'))
    print('OK index.html')

    # 2. Páginas sueltas: solo su vista, sin contenedor .sigec-view-container
    for view_id, filename in VIEWS:
        path = os.path.join(ROOT, filename)
        write(path, replace_main(read(path), indent(partials[view_id], 4), filename))
        print(f'OK {filename}')


if __name__ == '__main__':
    main()
