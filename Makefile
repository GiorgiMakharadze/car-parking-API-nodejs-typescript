migrationup:
	docker compose exec -e DATABASE_URL=postgresql://root:secret@postgres:5432/carparking app npm run migrate up

migrationdown:
	docker compose exec -e DATABASE_URL=postgresql://root:secret@postgres:5432/carparking app npm run migrate down

migrationup_test:
	docker compose exec -e DATABASE_URL=postgresql://roottest:secrettest@postgres_test:5433/carparkingtest app npm run migrate up

migrationdown_test:
	docker compose exec -e DATABASE_URL=postgresql://roottest:secrettest@postgres_test:5433/carparkingtest app npm run migrate down

.PHONY: migrationup migrationdown migrationup_test migrationdown_test
