#!/bin/sh
set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
WORKSPACE_ROOT="$SCRIPT_DIR/.."
EXAMPLES_DIR="$WORKSPACE_ROOT/../ng-xtend-examples"
OUTPUT_DIR="$WORKSPACE_ROOT/dist/ng-xtend-website"
API_OUT="$OUTPUT_DIR/api"
GUIDES_OUT="$OUTPUT_DIR/guides"

PANDOC="pandoc"

# Typedoc auto-install
if [ ! -f "$SCRIPT_DIR/node_modules/.bin/typedoc" ]; then
  echo "  Installing Typedoc dependencies..."
  cd "$SCRIPT_DIR" && npm install
fi

echo "=== Generating Typedoc API documentation ==="
cd "$SCRIPT_DIR" && npx typedoc --options typedoc_config.json
echo "Typedoc done: $API_OUT"

# --- Guides from example READMEs ---
echo ""
echo "=== Generating Guides from example READMEs ==="

if [ ! -d "$EXAMPLES_DIR" ]; then
  echo "Warning: ng-xtend-examples not found at $EXAMPLES_DIR. Skipping guides."
  exit 0
fi

rm -rf "$GUIDES_OUT"
mkdir -p "$GUIDES_OUT"

# Copy shared theme CSS
cp "$SCRIPT_DIR/pandoc_theme.css" "$GUIDES_OUT/theme.css"

PANDOC_OPTS="-f markdown -t html --file-scope=true --standalone --syntax-highlighting=zenburn --css=theme.css"

MATOMO="$SCRIPT_DIR/matomo-script.html"
MATOMO_OPTS=""
[ -f "$MATOMO" ] && MATOMO_OPTS="-H $MATOMO"

# Ordered list of guides: dir|short name|display title
guides_list() {
  cat <<LIST
basic|basic|Basic Example
typed|typed|Typed Example
plugin|plugin|Plugin Example
inout|inout|In-Out Example
store|store|Store Example
advanced-type|advanced-type|Advanced Type Example
dynamic|dynamic|Dynamic Plugin Example
LIST
}

# Generate each guide page
guides_list | while IFS='|' read -r dir name title; do
  readme="$EXAMPLES_DIR/$dir/README.md"
  if [ ! -f "$readme" ]; then
    echo "  Skipping $dir (no README.md)"
    continue
  fi

  echo "  Generating $name.html ..."

  logo_src="$EXAMPLES_DIR/$dir/public/logo.png"
  if [ -f "$logo_src" ]; then
    cp "$logo_src" "$GUIDES_OUT/${name}-logo.png"
  fi

  $PANDOC $PANDOC_OPTS $MATOMO_OPTS \
    --metadata title-meta="ng-xtend - $title" \
    -V pagetitle="ng-xtend - $title" \
    -o "$GUIDES_OUT/$name.html" "$readme"
done

# Generate guides index page
echo "  Generating index.html ..."

guides_index_md=$(cat <<MD
# ng-xtend Guides

Step-by-step guides showing how to use the ng-xtend framework, from basic rendering to dynamic plugin loading.

| Guide | Description |
|-------|-------------|
| [Basic Example](basic.html) | Display and edit any object using xt-render with the default plugin |
| [Typed Example](typed.html) | Leverage the type system for better create/edit/display support |
| [Plugin Example](plugin.html) | Add international and finance plugins for richer field rendering |
| [In-Out Example](inout.html) | Connect unknown components together via inputs and outputs |
| [Store Example](store.html) | Persist data between sessions with xt-store |
| [Advanced Type Example](advanced-type.html) | Handle complex types like many-to-one relations |
| [Dynamic Plugin Example](dynamic.html) | Load plugins dynamically from the web via Module Federation |

## See Also

- [API Documentation](../api/index.html) - Full API reference for ng-xtend libraries
MD
)

printf '%s\n' "$guides_index_md" | \
  $PANDOC $PANDOC_OPTS $MATOMO_OPTS \
    --metadata title-meta="ng-xtend Guides" \
    -V pagetitle="ng-xtend Guides" \
    -o "$GUIDES_OUT/index.html" /dev/stdin

echo ""
echo "=== Done ==="
echo "API docs:     $(realpath "$API_OUT")/index.html"
echo "Guides:       $(realpath "$GUIDES_OUT")/index.html"
