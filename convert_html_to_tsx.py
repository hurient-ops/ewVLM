import os
import glob
import re

FRONTEND_SRC = r"e:\projects\ewVLM\frontend\src"
COMPONENTS_DIR = os.path.join(FRONTEND_SRC, "components")

# Skip files already implemented or not needed
EXCLUDE_FILES = [
    "Login.html",
    "Signup.html",
    "MonitorALiveControl.html",
    "EventReviewCenter.html",
    "EwVlmUiSpecV2.html"
]

def style_to_jsx(style_str):
    # e.g., "font-variation-settings: 'FILL' 1;" -> "{ fontVariationSettings: \"'FILL' 1\" }"
    rules = style_str.strip(';').split(';')
    jsx_styles = []
    for rule in rules:
        rule = rule.strip()
        if not rule:
            continue
        parts = rule.split(':', 1)
        if len(parts) == 2:
            key = parts[0].strip()
            val = parts[1].strip()
            # camelCase the key
            camel_key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), key)
            # escape double quotes in val
            val = val.replace('"', '\\"')
            jsx_styles.append(f'{camel_key}: "{val}"')
    
    if not jsx_styles:
        return "{}"
    return "{{ " + ", ".join(jsx_styles) + " }}"

def convert_to_tsx(html_path):
    basename = os.path.basename(html_path)
    if basename in EXCLUDE_FILES:
        return
    
    component_name = basename.replace('.html', '')
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the <main> tag or fallback to <body>
    main_match = re.search(r'(<main[^>]*>.*?</main>)', content, re.DOTALL | re.IGNORECASE)
    if main_match:
        extracted = main_match.group(1)
    else:
        body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
        if body_match:
            extracted = body_match.group(1)
            # Need to wrap in div if multiple children, but assume it's one container or we can wrap it
            extracted = f"<div className=\"flex-1 flex flex-col w-full h-full bg-surface-container-lowest\">\n{extracted}\n</div>"
        else:
            extracted = content
    
    # Apply Replacements
    # 1. class -> className
    extracted = extracted.replace('class="', 'className="')
    extracted = extracted.replace("class='", "className='")
    
    # 2. for -> htmlFor
    extracted = extracted.replace('for="', 'htmlFor="')
    
    # 3. HTML comments -> JSX comments
    extracted = re.sub(r'<!--(.*?)-->', lambda m: f"{{/* {m.group(1)} */}}", extracted, flags=re.DOTALL)
    
    # 4. Inline styles
    def style_replacer(match):
        return 'style=' + style_to_jsx(match.group(1))
    extracted = re.sub(r'style="([^"]*)"', style_replacer, extracted)
    
    # 5. Self closing tags: img, input, hr, br
    # Match tags that don't end with />
    extracted = re.sub(r'<img([^>]*)(?<!/)>', r'<img\1 />', extracted)
    extracted = re.sub(r'<input([^>]*)(?<!/)>', r'<input\1 />', extracted)
    extracted = re.sub(r'<br([^>]*)(?<!/)>', r'<br\1 />', extracted)
    extracted = re.sub(r'<hr([^>]*)(?<!/)>', r'<hr\1 />', extracted)

    # Convert SVG stroke-width etc if any
    extracted = re.sub(r'stroke-width="', r'strokeWidth="', extracted)
    extracted = re.sub(r'stroke-linecap="', r'strokeLinecap="', extracted)
    extracted = re.sub(r'stroke-linejoin="', r'strokeLinejoin="', extracted)
    extracted = re.sub(r'fill-rule="', r'fillRule="', extracted)
    extracted = re.sub(r'clip-rule="', r'clipRule="', extracted)
    
    extracted = re.sub(r'viewbox="', r'viewBox="', extracted)
    extracted = re.sub(r'preserveaspectratio="', r'preserveAspectRatio="', extracted)
    extracted = re.sub(r'onclick="', r'onClick="', extracted)
    extracted = re.sub(r'onmousedown="', r'onMouseDown="', extracted)
    extracted = re.sub(r'colspan="', r'colSpan="', extracted)
    extracted = re.sub(r'<lineargradient', r'<linearGradient', extracted)
    extracted = re.sub(r'</lineargradient>', r'</linearGradient>', extracted)
    extracted = re.sub(r'<fegaussianblur', r'<feGaussianBlur', extracted)
    extracted = re.sub(r'</fegaussianblur>', r'</feGaussianBlur>', extracted)
    extracted = re.sub(r'<fecomposite', r'<feComposite', extracted)
    extracted = re.sub(r'</fecomposite>', r'</feComposite>', extracted)
    extracted = re.sub(r' checked="checked"', r' defaultChecked', extracted)
    extracted = re.sub(r' checked', r' defaultChecked', extracted)
    extracted = re.sub(r' selected="selected"', r' defaultValue="selected"', extracted)
    extracted = re.sub(r' disabled="disabled"', r' disabled', extracted)

    # Some images have missing alt, but we'll ignore it.

    # 6. Any other remaining html attributes:
    extracted = extracted.replace('tabindex="', 'tabIndex="')
    extracted = extracted.replace('readonly', 'readOnly')

    tsx_code = f"""import React from 'react';

export const {component_name}: React.FC = () => {{
  return (
    <>
{extracted}
    </>
  );
}};
"""
    
    out_path = os.path.join(COMPONENTS_DIR, f"{component_name}.tsx")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(tsx_code)
    
    print(f"Converted {basename} -> {component_name}.tsx")

html_files = glob.glob(os.path.join(FRONTEND_SRC, "*.html"))
print(f"Found {len(html_files)} HTML files")

os.makedirs(COMPONENTS_DIR, exist_ok=True)

for html_file in html_files:
    convert_to_tsx(html_file)

print("Conversion complete.")
