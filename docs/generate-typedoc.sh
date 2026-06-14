#!/bin/sh
set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
WORKSPACE_ROOT="$SCRIPT_DIR/.."
OUTPUT_DIR="$WORKSPACE_ROOT/dist/ng-xtend-website"
API_OUT="$OUTPUT_DIR/api"
GUIDES_OUT="$OUTPUT_DIR/guides"
GUIDES_SRC="$SCRIPT_DIR/guides-src"

PANDOC="pandoc"

# Typedoc auto-install
if [ ! -f "$SCRIPT_DIR/node_modules/.bin/typedoc" ]; then
  echo "  Installing Typedoc dependencies..."
  cd "$SCRIPT_DIR" && npm install
fi

echo "=== Generating Typedoc API documentation ==="
cd "$SCRIPT_DIR" && npx typedoc --options typedoc_config.json
echo "Typedoc done: $API_OUT"

# --- Guides from use-case markdown files ---
echo ""
echo "=== Generating Guides from use cases ==="

if [ ! -d "$GUIDES_SRC" ]; then
  echo "Warning: guides source not found at $GUIDES_SRC. Skipping."
  exit 0
fi

rm -rf "$GUIDES_OUT"
mkdir -p "$GUIDES_OUT"

cp "$SCRIPT_DIR/pandoc_theme.css" "$GUIDES_OUT/theme.css"

PANDOC_OPTS="-f markdown -t html --file-scope --standalone --syntax-highlighting=zenburn --css=theme.css"

MATOMO="$SCRIPT_DIR/matomo-script.html"
MATOMO_OPTS=""
[ -f "$MATOMO" ] && MATOMO_OPTS="-H $MATOMO"

# Inject Matomo analytics into all API HTML pages
if [ -f "$MATOMO" ]; then
  echo "  Injecting Matomo analytics into API pages..."
  find "$API_OUT" -name '*.html' | while IFS= read -r f; do
    sed -i "/<\/head>/r $MATOMO" "$f"
  done
  echo "  Matomo injected into API pages."
fi

# Use-case files in order: number|filename(no ext)|title
guides_list() {
  cat <<LIST
001-display-entity|display-entity|Display any object
002-edit-entity|edit-entity|Edit any object
003-describe-type|describe-type|Describe an entity type
004-create-entity|create-entity|Create new entities
005-add-plugins|add-plugins|Add plugins for rich fields
006-connect-list-editor|connect-list-editor|Connect list selection to editor
007-persist-data|persist-data|Persist data via REST API
008-entity-relations|entity-relations|Handle entity relations
009-load-plugins-runtime|load-plugins-runtime|Load plugins at runtime
LIST
}

guides_list | while IFS='|' read -r file name title; do
  src="$GUIDES_SRC/$file.md"
  if [ ! -f "$src" ]; then
    echo "  Skipping $file (not found)"
    continue
  fi
  echo "  Generating $name.html ..."
  $PANDOC $PANDOC_OPTS $MATOMO_OPTS \
    --metadata title-meta="$title" \
    -V pagetitle="$title" \
    -o "$GUIDES_OUT/$name.html" "$src"
done

# Generate guides index page
echo "  Generating index.html ..."

index_md=$(cat <<MD
# ng-xtend How-To Guides

Practical recipes for common tasks with the ng-xtend framework. Each guide is self-contained and lists its prerequisites.

## Getting started

| Guide | What you will learn |
|-------|-------------------|
| [Display any object](display-entity.html) | Render an object as a table or card with no manual template |
| [Edit any object](edit-entity.html) | Auto-generate an editable form from any value |
| [Describe an entity type](describe-type.html) | Declare field names and types for better rendering |
| [Create new entities](create-entity.html) | Build a blank creation form from a type descriptor |

## Enhancing the UI

| Guide | What you will learn |
|-------|-------------------|
| [Add plugins for rich fields](add-plugins.html) | Use country pickers, currency fields, and more via plugins |
| [Connect list selection to editor](connect-list-editor.html) | Wire a list and editor together with input/output bindings |

## Persistence & relations

| Guide | What you will learn |
|-------|-------------------|
| [Persist data via REST API](persist-data.html) | Save and load entities with xt-store |
| [Handle entity relations](entity-relations.html) | Define MANY-TO-ONE references between types |

## Advanced

| Guide | What you will learn |
|-------|-------------------|
| [Load plugins at runtime](load-plugins-runtime.html) | Fetch plugins from a remote server via Module Federation |

## See Also

- [API Documentation](../api/index.html) - Full API reference for ng-xtend libraries
MD
)

printf '%s\n' "$index_md" | \
  $PANDOC $PANDOC_OPTS $MATOMO_OPTS \
    --metadata title-meta="ng-xtend How-To Guides" \
    -V pagetitle="ng-xtend How-To Guides" \
    -o "$GUIDES_OUT/index.html" /dev/stdin

echo ""
echo "=== Done ==="
echo "API docs:     $(realpath "$API_OUT")/index.html"
echo "Guides:       $(realpath "$GUIDES_OUT")/index.html"
