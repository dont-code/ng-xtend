#!/bin/sh
cd ..
mkdir --parents dist/ng-xtend-website/docs/
mkdir --parents dist/ng-xtend-website/apps/xt-plugin-tester
mkdir --parents dist/ng-xtend-website/apps/xt-host
pandoc -f markdown -t html --file-scope=true --standalone --highlight-style=espresso --metadata title-meta="ng-xtend framework" -V maxwidth="80%" -V fontsize="20pt" -V backgroundcolor="#002222" -V fontcolor="#BBAAAA" -V linkcolor="#AA2222" -V pagetitle="ng-xtend" -H docs/matomo-script.html -o dist/ng-xtend-website/index.html README.md
pandoc -f markdown -t html --file-scope=true --standalone --highlight-style=espresso --metadata title-meta="ng-xtend plugin tester" -V maxwidth="80%" -V fontsize="20pt" -V backgroundcolor="#002222" -V fontcolor="#BBAAAA" -V linkcolor="#AA2222" -V pagetitle="ng-xtend - plugin tester" -H docs/matomo-script.html -o dist/ng-xtend-website/apps/xt-plugin-tester/index.html apps/xt-plugin-tester/README.md
pandoc -f markdown -t html --file-scope=true --standalone --highlight-style=espresso --metadata title-meta="ng-xtend host" -V maxwidth="80%" -V fontsize="20pt" -V backgroundcolor="#002222" -V fontcolor="#BBAAAA" -V linkcolor="#AA2222" -V pagetitle="ng-xtend - Host application" -H docs/matomo-script.html -o dist/ng-xtend-website/apps/xt-host/index.html apps/xt-host/README.md
cd dist/ng-xtend-website
sed -i 's/README.md/index.html/g' index.html apps/xt-plugin-tester/index.html apps/xt-host/index.html
cd ../../docs
cp -r logos ../dist/ng-xtend-website/docs
cp -r screenshots ../dist/ng-xtend-website/docs