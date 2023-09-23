postgres:
	docker run --name postgres16 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:16-alpine
createdb:
	docker exec -it postgres16 createdb --username=root --owner=root carparking
dropdb:
	docker exec -it postgres16 dropodb carparking
migrationup:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate up
migrationdown:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate down
.PHONY: postgres createdb dropdb migrationup migrationdown 	
	