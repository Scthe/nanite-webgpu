DENO = "C:\\programs\\portable\\deno\\deno.exe"

# install dependencies before first run
install:
	$(DENO) cache "src/index.deno.ts"

# Render to an image
run:
	$(DENO) task start
# DENO_NO_PACKAGE_JSON=1 && "_references/deno.exe" run --allow-read=. --allow-write=. --unstable-webgpu src/index.deno.ts

# Render to an image - custom scene
bunny:
	$(DENO) task start singleBunny

export_test:
# $(DENO) task start robot --export
# $(DENO) task start dragon --export
	$(DENO) task start lucy --export

import_test:
# $(DENO) task start robotJson
	$(DENO) task start lucy1b

# Run all tests
test:
	$(DENO) task test

# run impostors test
imp:
	$(DENO) task impostors

# (ignore)
tri:
	$(DENO) task rasterizeSw

check:
	$(DENO) check src
