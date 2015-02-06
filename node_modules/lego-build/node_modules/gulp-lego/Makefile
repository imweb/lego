test:
	./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec -t 20000

coveralls: test
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls

debug:
	node $(NODE_DEBUG) ./node_modules/.bin/_mocha -R spec -t 20000

bench:
	./node_modules/.bin/matcha

totoro:
	./node_modules/.bin/totoro --runner test/transport.test.js -b "windows7/node/0.10,linux/node/0.10"

.PHONY: test
