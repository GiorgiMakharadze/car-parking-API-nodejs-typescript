migrationup:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate up
migrationdown:
	DATABASE_URL=postgresql://root:secret@localhost:5432/carparking npm run migrate down
	
.PHONY: migrationup migrationdown 	
	