REPORTER = spec
XML_FILE = reports/TEST-all.html
HTML_FILE = reports/coverage.html
#REPORTER=spec
TESTS=$(shell find ./test/*.js -type f -name "*.js")

test: test-mocha

test-ci:
	$(MAKE) test-mocha REPORTER=doc > $(XML_FILE)

test-all: clean test-ci test-cov

test-ui:
	grunt test

test-mocha:
	@NODE_ENV=development mocha \
	    --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)


test-cov: app-cov
	@APP_COV=1 $(MAKE) --quiet test-mocha REPORTER=html-cov > $(HTML_FILE)

app-cov:
	jscoverage app_node app-cov

clean:
	rm -f reports/*
	rm -fr app-cov

.PHONY: test
