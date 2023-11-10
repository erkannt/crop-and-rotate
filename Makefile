.PHONY: dev format typescript watch-typescript build

node_modules: package.json package-lock.json
	npm install
	touch node_modules

dev: node_modules
	npx parcel -p 8080 src/index.html

format: node_modules
	npx prettier --ignore-unknown --write '**'

typescript: node_modules
	npx tsc --noEmit

watch-typescript: node_modules
	npx tsc --noEmit --watch

build:
	npx parcel build src/index.html --no-source-maps --public-url https://babyhash.rknt.de
