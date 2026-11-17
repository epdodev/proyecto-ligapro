import glob
import re

html_files = sorted(glob.glob('*.html'))
print(f"Auditing {len(html_files)} HTML files in root:")

total_href_hash = 0
total_comisario_static = 0
total_unhandled_buttons = 0

for f in html_files:
    with open(f, 'r', encoding='utf-8') as fp:
        html = fp.read()
    
    # 1. Check href="#"
    href_matches = re.findall(r'href=["\']#["\']', html)
    h_count = len(href_matches)
    total_href_hash += h_count

    # 2. Check Ab. Comisario
    c_count = html.count('Ab. Comisario')
    total_comisario_static += c_count

    # 3. Check buttons without onclick / submit
    btn_matches = re.finditer(r'<button\b([^>]*)>(.*?)</button>', html, re.DOTALL)
    unhandled = []
    for bm in btn_matches:
        attrs = bm.group(1)
        text = re.sub(r'<[^>]+>', ' ', bm.group(2)).strip()
        text = ' '.join(text.split())
        if 'onclick' not in attrs and 'type="submit"' not in attrs:
            unhandled.append(text[:40])
    
    total_unhandled_buttons += len(unhandled)
    status = "✅ CLEAN" if (h_count == 0 and c_count == 0 and len(unhandled) == 0) else "⚠️ ISSUES"
    print(f"[{status}] {f}: href=# -> {h_count}, Ab. Comisario -> {c_count}, unhandled buttons -> {len(unhandled)}")
    if unhandled:
        print(f"      -> Unhandled: {unhandled}")

print("\n================ FINAL AUDIT SUMMARY ================")
print(f"Total href='#' links: {total_href_hash} (Goal: 0)")
print(f"Total 'Ab. Comisario' occurrences: {total_comisario_static} (Goal: 0)")
print(f"Total unhandled buttons: {total_unhandled_buttons} (Goal: 0)")
if total_href_hash == 0 and total_comisario_static == 0 and total_unhandled_buttons == 0:
    print("🎉 ALL CHECKS PASSED PERFECTLY!")
else:
    print("❌ SOME CHECKS FAILED.")
