.PHONY : test coverage lint all

all :
	docker-compose run --service-ports --rm api yarn start

test :
	docker-compose run --rm api yarn run test

coverage :
	docker-compose run --rm api yarn run test:coverage

lint :
	docker-compose run --rm api yarn run lint

check : lint coverage

up :
	docker-compose up --build -d

down :
	docker-compose down

import :
	for f in users sets texts; do docker-compose exec mongo mongoimport -d annomania_dev --type json --file "/testdata/$$f.json" --jsonArray --drop; done
