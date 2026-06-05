# DBSEC 05.a — MySQL SSL/TLS Connection Setup

## Repository category

- `5.a-mysql-ssl-connection/init.sql`
- `5-node-sql/conn-ssl.js`

## Learning goals

- Understand SSL-required MySQL accounts.
- Connect a Node.js client using CA, certificate, and key files.
- Recognize certificate/key handling risks.

## Detailed concept explanation

### Why TLS matters

Database traffic can contain credentials, personal data, access-control results, and business secrets. TLS protects this data in transit and can also
authenticate the client through certificates.

### Server-side requirement

A MySQL account can be configured to require SSL. This prevents the user from connecting over plaintext. For stricter setups, X509 requirements can force
certificate-based authentication.

### Operational warning

The repository contains demo certificates for local exercises. Private keys should not be committed in real repositories. Rotate exposed credentials and
use secret stores or deployment-time injection.

## Code snippets and explanations

### Create SSL-required user

**Source:** `5.a-mysql-ssl-connection/init.sql`

```sql
CREATE DATABASE testdb;

CREATE USER 'ssluser'@'%' IDENTIFIED BY 'sslpass' REQUIRE SSL;
GRANT ALL PRIVILEGES ON testdb.* TO 'ssluser'@'%';
FLUSH PRIVILEGES;
```

The account must connect using SSL. The grant is broad for a demo; a real application should receive narrower permissions.

### Node SSL client options

**Source:** `5-node-sql/conn-ssl.js`

```js
ssl: {
  ca: fs.readFileSync('./certs/ca.pem'),
  cert: fs.readFileSync('./certs/client-cert.pem'),
  key: fs.readFileSync('./certs/client-key.pem')
}
```

The CA verifies the server certificate. The client certificate and key identify the client if mutual TLS is configured.

## Review checklist

- What does `REQUIRE SSL` enforce?
- Why should private keys not be committed?
- How is TLS different from password authentication?
