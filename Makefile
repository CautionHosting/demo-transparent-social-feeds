.DEFAULT_GOAL := check
.PHONY: check build dev stop clean

IMAGE_NAME := transparent-social-feed
PORT ?= 8083

check:
	python3 scripts/check_demo.py
	@if command -v node >/dev/null 2>&1; then node --check public/app.js; else echo "node not found; skipped JS syntax check"; fi

build:
	docker build --progress=plain --target shell -f Containerfile -t $(IMAGE_NAME) .

dev: stop build
	docker run -d --rm --name $(IMAGE_NAME)-dev -p $(PORT):8083 $(IMAGE_NAME)
	@echo "Transparent Social Feed running at http://localhost:$(PORT)"

stop:
	@docker rm -f $(IMAGE_NAME)-dev 2>/dev/null || true

clean: stop
	@docker image rm $(IMAGE_NAME) 2>/dev/null || true
