#!/bin/sh
cd ..
mkdir dist/ng-xtend-website
pandoc -f markdown -t html --file-scope=true --standalone --highlight-style=espresso --metadata title-meta="Ng-xtend framework" -V maxwidth="80%" -V backgroundcolor="#000000" -V fontcolor="#FFFFFF" -V linkcolor="#FF0000" -V pagetitle="Ng-xtend" -H docs/matomo-script.html -o dist/ng-xtend-website/index.html README.md
cd docs
