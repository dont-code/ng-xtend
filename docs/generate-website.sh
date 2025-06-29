#!/bin/sh
cd ..
mkdir --parents dist/ng-xtend-website/docs/
pandoc -f markdown -t html --file-scope=true --standalone --highlight-style=espresso --metadata title-meta="ng-xtend framework" -V maxwidth="80%" -V backgroundcolor="#002222" -V fontcolor="#BBAAAA" -V linkcolor="#AA2222" -V pagetitle="ng-xtend" -H docs/matomo-script.html -o dist/ng-xtend-website/index.html README.md
cd docs
cp -r logos ../dist/ng-xtend-website/docs
cp -r screenshots ../dist/ng-xtend-website/docs