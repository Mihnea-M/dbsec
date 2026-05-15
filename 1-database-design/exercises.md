# DBSEC - Section 02: Normalization Scenarios and Exercises

## Demonstrations and Student Exercises

**Related section:** Database Design
**Recommended use:** After the normalization and normal forms explanation
**Purpose:** Help students practice identifying anomalies, functional dependencies, keys, and normalized relational structures.

---

# Part A - Demonstrative Scenarios

---

## Demonstration 1 - Student Enrollments

### Scenario

A university stores student enrollments in courses.

For each enrollment, the system stores:

* student ID
* student name
* student email
* course code
* course name
* professor name
* professor email
* grade

The initial design uses one table.

### Initial Table

`StudentCourseRecords`

| student_id | student_name | student_email                                   | course_code | course_name       | professor_name | professor_email                           | grade |
| ---------- | ------------ | ----------------------------------------------- | ----------- | ----------------- | -------------- | ----------------------------------------- | ----: |
| 1          | Alice Pop    | [alice@uni.example](mailto:alice@uni.example)   | DBSEC       | Database Security | Dr. Ionescu    | [ion@uni.example](mailto:ion@uni.example) |     9 |
| 1          | Alice Pop    | [alice@uni.example](mailto:alice@uni.example)   | NET         | Computer Networks | Dr. Popescu    | [pop@uni.example](mailto:pop@uni.example) |     8 |
| 2          | Bogdan Marin | [bogdan@uni.example](mailto:bogdan@uni.example) | DBSEC       | Database Security | Dr. Ionescu    | [ion@uni.example](mailto:ion@uni.example) |    10 |
| 3          | Carla Dinu   | [carla@uni.example](mailto:carla@uni.example)   | DBSEC       | Database Security | Dr. Ionescu    | [ion@uni.example](mailto:ion@uni.example) |     7 |

---

## Demonstration 1 - What Is Wrong?

The table mixes several kinds of facts:

* facts about students
* facts about courses
* facts about professors
* facts about enrollments
* facts about grades

### Redundancy

Several facts are repeated:

```text
Alice's name and email appear once for each course.
The DBSEC course name appears once for each enrolled student.
Dr. Ionescu's name and email appear once for each DBSEC enrollment.
```

### Insert Anomaly

We cannot add a course unless at least one student is enrolled.

Example:

```text
The university wants to create a new course: CRYPTO - Applied Cryptography.
No student has enrolled yet.
There is no place to store it without inventing an enrollment row.
```

### Update Anomaly

If Dr. Ionescu changes email address, several rows must be updated.

If one row is missed, the database contains conflicting professor emails.

### Delete Anomaly

If the last student drops DBSEC, deleting the enrollment row may delete the only stored information about the course and its professor assignment.

---

## Demonstration 1 - Candidate Key and Dependencies

Assume:

```text
student_id uniquely identifies a student.
course_code uniquely identifies a course.
professor_email uniquely identifies a professor.
A student can receive one grade per course.
A course has one professor.
```

Candidate key for the initial enrollment table:

```text
(student_id, course_code)
```

Functional dependencies:

```text
student_id -> student_name, student_email
course_code -> course_name, professor_email
professor_email -> professor_name
student_id, course_code -> grade
```

Problems:

```text
student_name and student_email depend only on student_id.
course_name and professor_email depend only on course_code.
professor_name depends on professor_email, which depends on course_code.
grade depends on the full composite key.
```

This violates 2NF and 3NF.

---

## Demonstration 1 - Normalized Design

### Students

| student_id | name         | email                                           |
| ---------- | ------------ | ----------------------------------------------- |
| 1          | Alice Pop    | [alice@uni.example](mailto:alice@uni.example)   |
| 2          | Bogdan Marin | [bogdan@uni.example](mailto:bogdan@uni.example) |
| 3          | Carla Dinu   | [carla@uni.example](mailto:carla@uni.example)   |

Primary key:

```text
student_id
```

Candidate key:

```text
email, if university emails are unique
```

---

### Professors

| professor_id | name        | email                                     |
| ------------ | ----------- | ----------------------------------------- |
| 10           | Dr. Ionescu | [ion@uni.example](mailto:ion@uni.example) |
| 11           | Dr. Popescu | [pop@uni.example](mailto:pop@uni.example) |

Primary key:

```text
professor_id
```

Candidate key:

```text
email
```

---

### Courses

| course_code | name              | professor_id |
| ----------- | ----------------- | ------------ |
| DBSEC       | Database Security | 10           |
| NET         | Computer Networks | 11           |

Primary key:

```text
course_code
```

Foreign key:

```text
professor_id references Professors(professor_id)
```

---

### Enrollments

| student_id | course_code | grade |
| ---------- | ----------- | ----: |
| 1          | DBSEC       |     9 |
| 1          | NET         |     8 |
| 2          | DBSEC       |    10 |
| 3          | DBSEC       |     7 |

Primary key:

```text
(student_id, course_code)
```

Foreign keys:

```text
student_id references Students(student_id)
course_code references Courses(course_code)
```

---

## Demonstration 1 - Why This Is Better

### Insert

We can insert a new course without any enrollment.

```text
Courses(CRYPTO, Applied Cryptography, 10)
```

### Update

If a professor changes email, one row changes in `Professors`.

### Delete

If the last student drops DBSEC, we delete only the enrollment. The course still exists.

### Security Relevance

The model makes ownership and responsibility clearer.

For example:

```text
A professor can be authorized to update grades only for courses assigned to them.
A student can be authorized to read only their own enrollments.
An admin can audit course assignments separately from grades.
```

Clear structure makes access control easier to express.

---

## Demonstration 1 - Possible Denormalization

Suppose the system often displays a student transcript with course names.

The normalized query requires a join:

```sql
SELECT students.name, courses.name, enrollments.grade
FROM enrollments
JOIN students ON students.student_id = enrollments.student_id
JOIN courses ON courses.course_code = enrollments.course_code
WHERE students.student_id = 1;
```

A denormalized option would be to store `course_name` inside `Enrollments`.

This may speed up reads, but creates risk:

```text
If the course name changes, all enrollment rows must be updated.
```

Conclusion:

```text
Start normalized. Denormalize only if there is a measured performance reason and a clear consistency strategy.
```

---

## Demonstration 2 - Online Shop Orders

### Scenario

An online shop stores order information in a single table.

For each order item, it stores:

* order ID
* order date
* customer ID
* customer name
* customer email
* shipping address
* product ID
* product name
* product category
* unit price
* quantity
* line total
* order total

### Initial Table

`OrderRecords`

| order_id | order_date | customer_id | customer_name | customer_email                            | shipping_address | product_id | product_name | category    | unit_price | quantity | line_total | order_total |
| -------- | ---------- | ----------- | ------------- | ----------------------------------------- | ---------------- | ---------- | ------------ | ----------- | ---------: | -------: | ---------: | ----------: |
| 1001     | 2025-04-10 | 17          | Ana Radu      | [ana@example.com](mailto:ana@example.com) | Str. A 10        | P1         | Keyboard     | Peripherals |        150 |        1 |        150 |         350 |
| 1001     | 2025-04-10 | 17          | Ana Radu      | [ana@example.com](mailto:ana@example.com) | Str. A 10        | P2         | Mouse        | Peripherals |        100 |        2 |        200 |         350 |
| 1002     | 2025-04-12 | 18          | Dan Stan      | [dan@example.com](mailto:dan@example.com) | Str. B 20        | P1         | Keyboard     | Peripherals |        150 |        1 |        150 |         150 |

---

## Demonstration 2 - What Is Wrong?

The table mixes:

* order facts
* customer facts
* product facts
* category facts
* order item facts
* calculated values

### Redundancy

```text
Ana's customer data appears once for each item in the same order.
Product P1 appears in multiple orders.
The category Peripherals appears for multiple products.
The order total is repeated on every item row.
```

### Insert Anomaly

We cannot add a new product unless it appears in an order.

We cannot add a new customer unless they place an order.

### Update Anomaly

If product P1 is renamed, all past and future order rows containing P1 must be inspected.

If Ana changes email, many order rows may need updating.

### Delete Anomaly

If the last order containing product P2 is deleted, product P2 may disappear from the system.

---

## Demonstration 2 - Important Design Decision

Orders are different from the current product catalog.

If a product price changes tomorrow, old orders should usually keep the price that was valid when the order was placed.

This means:

```text
Products.unit_price may store the current catalog price.
OrderItems.unit_price should store the historical price used for that order.
```

This is an intentional duplication.

It is not automatically bad, because it represents a different fact:

```text
Current product price
versus
Price charged in a specific order
```

This is an important distinction in database design.

---

## Demonstration 2 - Dependencies

Assume:

```text
order_id identifies an order.
customer_id identifies a customer.
product_id identifies a product.
category_id identifies a category.
An order can contain multiple products.
```

Candidate key for item-level table:

```text
(order_id, product_id)
```

Functional dependencies:

```text
order_id -> order_date, customer_id, shipping_address, order_total
customer_id -> customer_name, customer_email
product_id -> product_name, category, current_unit_price
order_id, product_id -> quantity, unit_price, line_total
```

Potential derived dependencies:

```text
line_total = quantity * unit_price
order_total = sum(line_total) for order_id
```

The table violates 2NF and 3NF and contains derived values.

---

## Demonstration 2 - Normalized Design

### Customers

| customer_id | name     | email                                     |
| ----------- | -------- | ----------------------------------------- |
| 17          | Ana Radu | [ana@example.com](mailto:ana@example.com) |
| 18          | Dan Stan | [dan@example.com](mailto:dan@example.com) |

---

### Categories

| category_id | name        |
| ----------- | ----------- |
| C1          | Peripherals |

---

### Products

| product_id | name     | category_id | current_unit_price |
| ---------- | -------- | ----------- | -----------------: |
| P1         | Keyboard | C1          |                150 |
| P2         | Mouse    | C1          |                100 |

---

### Orders

| order_id | order_date | customer_id | shipping_address |
| -------- | ---------- | ----------- | ---------------- |
| 1001     | 2025-04-10 | 17          | Str. A 10        |
| 1002     | 2025-04-12 | 18          | Str. B 20        |

---

### OrderItems

| order_id | product_id | quantity | unit_price |
| -------- | ---------- | -------: | ---------: |
| 1001     | P1         |        1 |        150 |
| 1001     | P2         |        2 |        100 |
| 1002     | P1         |        1 |        150 |

Primary key:

```text
(order_id, product_id)
```

---

## Demonstration 2 - Derived Values

We can compute line totals:

```text
line_total = quantity * unit_price
```

We can compute order totals:

```text
order_total = sum(line_total) for all items in the order
```

So we may choose not to store them.

However, storing them can be valid denormalization if:

* invoices must preserve exact historical values
* reads are frequent and performance matters
* tax, discount, and rounding rules are complex
* there is a clear update strategy

If stored, these values should be protected carefully.

Example security concern:

```text
A user should not be able to submit an order_total from the client side and have the database trust it blindly.
```

The server or database should compute or verify financial totals.

---

## Demonstration 2 - Security Relevance

The normalized design supports clearer security rules.

Examples:

```text
Customers can read their own Orders.
Customers cannot update OrderItems after payment.
Admins can update Products but not historical OrderItems.unit_price.
Reports can read Orders without exposing customer emails unnecessarily.
```

It also separates current facts from historical facts:

```text
Current product price belongs to Products.
Historical charged price belongs to OrderItems.
```

That distinction is important for auditing and financial correctness.

---

# Part B - Student Exercises

---

## Exercise 1 - Clinic Appointments

### Scenario

A clinic stores appointment information in one table.

Each row represents one appointment.

`ClinicAppointments`

| appointment_id | appointment_date | patient_id | patient_name | patient_phone | doctor_id | doctor_name | doctor_specialty | room_number | room_floor | diagnosis_code | diagnosis_name |
| -------------- | ---------------- | ---------- | ------------ | ------------- | --------- | ----------- | ---------------- | ----------: | ---------: | -------------- | -------------- |
| A100           | 2025-05-01       | P1         | Maria Enache | 0711111111    | D1        | Dr. Toma    | Cardiology       |         201 |          2 | I10            | Hypertension   |
| A101           | 2025-05-02       | P2         | Paul Matei   | 0722222222    | D1        | Dr. Toma    | Cardiology       |         201 |          2 | I10            | Hypertension   |
| A102           | 2025-05-03       | P1         | Maria Enache | 0711111111    | D2        | Dr. Vlad    | Dermatology      |         305 |          3 | L20            | Dermatitis     |

### Assumptions

```text
appointment_id uniquely identifies an appointment.
patient_id uniquely identifies a patient.
doctor_id uniquely identifies a doctor.
room_number uniquely identifies a room.
diagnosis_code uniquely identifies a diagnosis.
A doctor has one specialty.
A room is located on one floor.
An appointment has one patient, one doctor, one room, and one diagnosis.
```

---

## Exercise 1 - Tasks

1. Identify at least three redundancies.
2. Identify one insert anomaly.
3. Identify one update anomaly.
4. Identify one delete anomaly.
5. Identify the main functional dependencies.
6. Propose a normalized design in 3NF.
7. Mark primary keys and foreign keys.
8. Explain one security benefit of the normalized design.

---

## Exercise 1 - Expected Solution Outline

Possible relations:

```text
Patients(patient_id, name, phone)
Doctors(doctor_id, name, specialty)
Rooms(room_number, floor)
Diagnoses(diagnosis_code, name)
Appointments(appointment_id, appointment_date, patient_id, doctor_id, room_number, diagnosis_code)
```

Functional dependencies:

```text
appointment_id -> appointment_date, patient_id, doctor_id, room_number, diagnosis_code
patient_id -> patient_name, patient_phone
doctor_id -> doctor_name, doctor_specialty
room_number -> room_floor
diagnosis_code -> diagnosis_name
```

Possible security benefit:

```text
Patient personal information is separated from appointment scheduling data.
A scheduling role may see appointment times and room numbers without necessarily seeing all diagnosis details.
```

---

## Exercise 2 - SaaS Project Management

### Scenario

A SaaS project management application stores task assignment data in one table.

`ProjectTaskRecords`

| organization_id | organization_name | project_id | project_name     | task_id | task_title      | task_status | assigned_user_id | assigned_user_name | assigned_user_email                             | role_name | permission_name |
| --------------- | ----------------- | ---------- | ---------------- | ------- | --------------- | ----------- | ---------------- | ------------------ | ----------------------------------------------- | --------- | --------------- |
| O1              | Acme Ltd          | PR1        | Website Redesign | T1      | Build homepage  | open        | U1               | Alice              | [alice@acme.example](mailto:alice@acme.example) | developer | edit_task       |
| O1              | Acme Ltd          | PR1        | Website Redesign | T1      | Build homepage  | open        | U1               | Alice              | [alice@acme.example](mailto:alice@acme.example) | developer | comment_task    |
| O1              | Acme Ltd          | PR1        | Website Redesign | T2      | Deploy staging  | open        | U2               | Bob                | [bob@acme.example](mailto:bob@acme.example)     | admin     | edit_task       |
| O1              | Acme Ltd          | PR1        | Website Redesign | T2      | Deploy staging  | open        | U2               | Bob                | [bob@acme.example](mailto:bob@acme.example)     | admin     | delete_task     |
| O2              | Beta SRL          | PR2        | CRM Migration    | T3      | Import contacts | blocked     | U3               | Carla              | [carla@beta.example](mailto:carla@beta.example) | developer | edit_task       |

### Assumptions

```text
organization_id identifies an organization.
project_id identifies a project.
task_id identifies a task.
assigned_user_id identifies a user.
role_name identifies a role inside one organization.
A role can have many permissions.
A user can have one role per organization in this simplified model.
A task belongs to one project.
A project belongs to one organization.
```

---

## Exercise 2 - Tasks

1. Identify why this table is especially dangerous from a security perspective.
2. Identify at least four functional dependencies.
3. Identify at least one partial dependency or transitive dependency.
4. Normalize the design to at least 3NF.
5. Represent user roles and role permissions separately.
6. Explain how the normalized design helps implement RBAC.
7. Identify one possible denormalization and explain the risk.

---

## Exercise 2 - Expected Solution Outline

Possible relations:

```text
Organizations(organization_id, name)
Projects(project_id, organization_id, name)
Tasks(task_id, project_id, title, status)
Users(user_id, name, email)
Roles(role_id, organization_id, name)
Permissions(permission_id, name)
UserOrganizationRoles(user_id, organization_id, role_id)
RolePermissions(role_id, permission_id)
TaskAssignments(task_id, user_id)
```

Possible functional dependencies:

```text
organization_id -> organization_name
project_id -> project_name, organization_id
task_id -> task_title, task_status, project_id
assigned_user_id -> assigned_user_name, assigned_user_email
role_id -> role_name, organization_id
permission_id -> permission_name
role_id, permission_id -> role permission assignment
user_id, organization_id -> role_id
```

Security relevance:

```text
Roles and permissions are not duplicated in task rows.
Changing a role permission happens in RolePermissions, not across many task records.
This reduces the risk of stale permissions.
```

Possible denormalization:

```text
Store assigned_user_name directly on Tasks for faster display.
```

Risk:

```text
If the user's name changes, task rows become stale unless updated consistently.
```

---

## Exercise 3 - Library Loans and Copies

### Scenario

A library stores book loan information in a single table.

`LibraryLoans`

| loan_id | loan_date  | due_date   | member_id | member_name | member_email                                  | book_isbn | book_title           | author_name | publisher_name | copy_id | shelf_location | return_date |
| ------- | ---------- | ---------- | --------- | ----------- | --------------------------------------------- | --------- | -------------------- | ----------- | -------------- | ------- | -------------- | ----------- |
| L1      | 2025-03-01 | 2025-03-15 | M1        | Ioana       | [ioana@example.com](mailto:ioana@example.com) | 978-1     | Database Systems     | C. Date     | TechBooks      | C100    | A-01           | 2025-03-12  |
| L2      | 2025-03-02 | 2025-03-16 | M2        | Mihai       | [mihai@example.com](mailto:mihai@example.com) | 978-1     | Database Systems     | C. Date     | TechBooks      | C101    | A-02           | null        |
| L3      | 2025-03-03 | 2025-03-17 | M1        | Ioana       | [ioana@example.com](mailto:ioana@example.com) | 978-2     | Security Engineering | R. Anderson | SecurePress    | C200    | B-05           | null        |

### Assumptions

```text
loan_id identifies a loan.
member_id identifies a library member.
book_isbn identifies a book title/edition.
copy_id identifies a physical copy.
Each physical copy belongs to one book.
Each book has one publisher in this simplified model.
Each book can have one or more authors, but this table stores only one author for now.
A loan refers to one physical copy and one member.
```

---

## Exercise 3 - Tasks

1. Identify the entities hidden in the table.
2. Identify the problem caused by treating `author_name` as a single value.
3. Bring the design to 1NF if multiple authors must be supported.
4. Normalize the design to at least 3NF.
5. Decide where `shelf_location` belongs.
6. Explain why `return_date` belongs to the loan and not to the book or member.
7. Identify one audit/security concern for this domain.

---

## Exercise 3 - Expected Solution Outline

Possible entities:

```text
Members
Books
Authors
BookAuthors
Publishers
Copies
Loans
```

Possible relations:

```text
Members(member_id, name, email)
Publishers(publisher_id, name)
Books(book_isbn, title, publisher_id)
Authors(author_id, name)
BookAuthors(book_isbn, author_id)
Copies(copy_id, book_isbn, shelf_location)
Loans(loan_id, loan_date, due_date, member_id, copy_id, return_date)
```

Why `author_name` is a 1NF problem if multiple authors exist:

```text
A cell like "Author A, Author B" stores a list inside one attribute.
The relation should represent each author relationship separately.
```

Why `shelf_location` belongs to `Copies`:

```text
Different physical copies of the same book may be on different shelves.
```

Why `return_date` belongs to `Loans`:

```text
Return date describes a specific borrowing event.
It does not describe the member in general or the book in general.
```

Security/audit concern:

```text
Loan history can reveal sensitive reading behavior.
Access to loan records should be restricted and audited.
```

---

# Optional Grading Rubric

For each exercise, evaluate students on:

| Criterion                                          | Points |
| -------------------------------------------------- | -----: |
| Correctly identifies entities                      |      2 |
| Correctly identifies anomalies                     |      2 |
| Correctly identifies dependencies                  |      2 |
| Produces reasonable normalized relations           |      3 |
| Marks primary keys and foreign keys                |      2 |
| Explains security relevance                        |      2 |
| Discusses denormalization trade-off where relevant |      1 |
| Clarity and justification                          |      1 |
| **Total**                                          | **15** |

