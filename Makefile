migrationup:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate up

migrationdown:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate down

migrationup_test:
	DATABASE_URL=postgresql://roottest:secrettest@localhost:5433/carparkingtest npm run migrate up

migrationdown_test:
	DATABASE_URL=postgresql://roottest:secrettest@localhost:5433/carparkingtest npm run migrate down

.PHONY: migrationup migrationdown migrationup_test migrationdown_test
