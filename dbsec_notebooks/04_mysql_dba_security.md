# DBSEC 04 — MySQL DBA Security: Users, Grants, Roles, Definers, SSL, Hashing

## Repository category

- `4-mysql-dba/*.txt`
- `3-sql/ssl/*`

## Learning goals

- Create and manage MySQL users.
- Apply least privilege with GRANT, REVOKE, and roles.
- Understand definers, SSL client authentication, manual encryption, and hashing.

## Detailed concept explanation

### Users, hosts, and privileges

In MySQL, an account is identified by both username and host, such as `'user1'@'localhost'`. Privileges should be as narrow as possible:
grant only the needed operations on only the needed schema, table, or routine. Broad grants make application compromise more damaging.

### Roles and least privilege

Roles group privileges into reusable sets. A web application may need read access to one table and write access to another, but not administrative
rights. Roles help express this policy without manually granting every permission to every user.

### Definers and stored routines

Stored procedures can run with the privileges of their definer. This can be useful for controlled privileged actions, but dangerous if users can execute
a routine that performs operations they should not normally perform. Definer routines should be minimal, reviewed, and granted carefully.

### Hashing vs encryption

Passwords should normally be hashed, not encrypted, because the application should not need to recover the original password. Encryption is reversible
and appropriate for secrets that must be read later. Hashing is one-way and should use strong password hashing in real systems; SHA2 is shown here as a
basic database function demonstration, not as best-practice password storage.

## Code snippets and explanations

### Create a user

**Source:** `4-mysql-dba/2_create user.txt`

```sql
CREATE USER 'user1'@'localhost' IDENTIFIED BY 'ism';
SELECT user FROM mysql.user;
```

This creates a MySQL account and then lists users. The host part matters: `'user1'@'localhost'` is different from `'user1'@'%'`.

### Grant and flush privileges

**Source:** `4-mysql-dba/6_grant.txt`

```sql
GRANT create, SELECT, insert, update ON role_examples.* TO 'user1'@'localhost';
GRANT drop ON role_examples.* TO 'user1'@'localhost';
FLUSH PRIVILEGES;
```

The account receives explicit privileges on the `role_examples` database. From a security perspective, `DROP` is high-impact and should not be granted
to normal application accounts unless absolutely necessary.

### Use a role

**Source:** `4-mysql-dba/9_roles.txt and 4-mysql-dba/11_role_perms.txt`

```sql
CREATE ROLE 'webapp';

GRANT SELECT ON role_examples.only_read TO 'webapp'@'%';
GRANT ALL PRIVILEGES ON role_examples.read_write1 TO 'webapp'@'%';

GRANT 'webapp'@'%' TO 'user1'@'localhost';
SET ROLE 'webapp'@'%';
```

A role is created, granted permissions, assigned to a user, and activated. This separates privilege design from individual account management.

### Definer-like privileged routine

**Source:** `4-mysql-dba/12_definers.txt`

```sql
DELIMITER //
CREATE PROCEDURE delete_only_read(IN target INT)
BEGIN
    DELETE FROM role_examples.only_read WHERE id = target;
END //
DELIMITER ;

GRANT EXECUTE ON role_examples.* TO 'webapp'@'%';
```

The routine encapsulates a delete operation and grants only execution to the application role. This can reduce direct table privileges, but it must be
designed carefully because routine execution can become a privilege-escalation path.

### Hash a password-like value

**Source:** `4-mysql-dba/16_hash.txt`

```sql
CREATE TABLE ism_passwords1 (
    id INT NOT NULL,
    pass VARCHAR(50),
    hash_value VARBINARY(512)
) ENGINE=InnoDB;

INSERT INTO ism_passwords1 (id, pass, hash_value)
VALUES (1, 'somepass', SHA2('somepass', 512));
```

The example stores a hash alongside the raw password field. In production, never store the raw password; use a password hashing algorithm with salt and
work factor, such as bcrypt, scrypt, or Argon2.

## Review checklist

- What privileges does the web application actually need?
- Why is `DROP` dangerous for an app account?
- When should you use a stored procedure instead of direct table access?
