# **Requirements Style Guide: For Product Requirements Documentation**

## **1\. Introduction**

This guide provides best practices and conventions for writing clear, unambiguous, verifiable, and maintainable product requirements within our "Docs as Code" framework. Adhering to this style guide will ensure consistency, improve communication among stakeholders, streamline development, and facilitate effective testing and validation across systems, hardware, and software engineering disciplines. This guide supports the "Clarity and Quality" principle outlined in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#2-guiding-principles).

The goal is to foster a common understanding of what constitutes a "good" requirement, making our requirements documentation a true single source of truth that is both human-readable and machine-processable, and facilitating its translation into formal models like SysML.

## **2\. General Principles of Good Requirements**

Every requirement should strive to be:

* **Clear:** Easily understood by all stakeholders (technical and non-technical).  
* **Concise:** Stated succinctly, without unnecessary jargon or extraneous information.  
* **Complete:** Contains all necessary information to understand and implement, without extraneous details.  
* **Consistent:** Does not contradict other requirements and uses terminology uniformly.  
* **Unambiguous:** Has only one interpretation; avoids vague or subjective terms.  
* **Verifiable/Testable:** Can be proven to have been met through inspection, analysis, demonstration, or test.  
* **Feasible:** Can be implemented within known constraints (technical, financial, schedule).  
* **Necessary:** Defines a capability truly required by the user or system, adding value.  
* **Atomic/Modular:** Expresses a single, cohesive idea or capability.  
* **Prioritized:** Assigned a level of importance to guide development effort.  
* **Stable:** Not subject to frequent or significant changes (once approved).

These principles are integral to the overall "Requirements Life Cycle Process" defined in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#4-requirements-life-cycle-process).

## **3\. Structure of a Requirement File**

Each requirement will be defined in its own Markdown (.md) file. The file MUST begin with YAML front matter, followed by a clear title, and then the detailed requirement description including acceptance criteria. This structure is leveraged by the **Node.js parsing application** as described in the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md\#51-nodejs-project-setup), and is crucial for SysML generation.

\---  
id: REQ-CATEGORY-NNN  
name: Brief, descriptive name of the requirement  
type: Functional | Non-Functional | UI/UX | Performance | Security | CS | FS | PMP | QNR | SEC | etc.  
priority: Critical | High | Medium | Low | Optional  
status: Draft | Proposed | Approved | Implemented | Verified | Archived  
tags: \[tag1, tag2, tag3\] \# Keywords for categorization  
links:  
  \- type: implements \# Relationship type (e.g., implements, depends\_on, traces\_to\_test)  
    target: EPIC-PROJECT-001 \# ID of the linked item (another requirement, test case, design doc)  
  \- type: traces\_to\_test  
    target: TEST-QA-012  
  \- type: allocates \# For SysML: Allocates this requirement to a system block  
    target: BLOCK-SYS-POWERMGMT-001 \# ID of the SysML Block  
\# SysML-specific attributes (optional but recommended for richer models)  
source: "Customer Interview Log \#2025-03-15" \# Origin of the requirement  
stakeholder: "Product Marketing Lead" \# Key stakeholder for this requirement  
verification\_method: "Test | Inspection | Analysis | Demonstration" \# How this requirement will be verified  
\---

\# REQ-CATEGORY-NNN: Brief, descriptive name of the requirement (H1 heading matches 'id' and 'name' from front matter)

\#\# Overview (Optional \- For context or high-level summary)  
Provides a brief context for the requirement. What problem does it solve? Who is it for?

\#\# Description (The core of the requirement)  
The requirement statement(s) using clear, imperative language.

\#\#\# Imperative Language (Keywords)  
Use specific keywords to denote the strength of the requirement:

\* \*\*SHALL:\*\* Indicates a mandatory requirement. No deviation is permitted. (e.g., "The system \*\*SHALL\*\* encrypt user passwords.")  
\* \*\*SHOULD:\*\* Indicates a desirable but not mandatory requirement. Deviations require justification. (e.g., "The system \*\*SHOULD\*\* provide an audit log for all administrative actions.")  
\* \*\*MAY:\*\* Indicates an optional feature or capability. (e.g., "The system \*\*MAY\*\* offer multi-factor authentication as an optional security feature.")  
\* \*\*WILL:\*\* Typically used for statements of fact or intention, not requirements on the system itself. Avoid for functional requirements. (e.g., "The project team \*\*will\*\* deliver this feature by end of Q2.")

\#\# Acceptance Criteria (Testability)  
These are the measurable conditions that must be satisfied for the requirement to be considered met. They are crucial for verifiability and often follow a Given/When/Then (GWT) format for functional requirements.

\* Given \[a precondition\], when \[an action is performed\], then \[an observable result occurs\].  
\* The system shall achieve \[X\] with \[Y\] accuracy.  
\* The API response time shall not exceed \[N\] milliseconds for \[M\] requests.

\#\# Notes / Assumptions / Constraints (Optional)  
Any additional information, assumptions made, or constraints affecting this requirement (e.g., "Assumes stable internet connection," "Requires third-party API key," "Limited to 100 concurrent users").

\#\# Attachments (Optional)  
Links to any supporting files (e.g., diagrams, mockups, screenshots, external documents) stored in the \`attachments/\` folder.  
\* \[Login Flow Diagram\](attachments/login\_flow.png)  
\* \[External API Specification (PDF)\](attachments/external\_api\_spec.pdf)

## **4\. Guidelines for Content**

### **4.1. Clarity and Unambiguity**

* **Avoid Ambiguous Adjectives/Adverbs:** Words like "fast," "easy," "robust," "efficient," "user-friendly," "most," "some" are subjective. Replace them with measurable terms (e.g., "response time less than 2 seconds," "user completion rate of 95%").  
* **Define Acronyms and Jargon:** The first time an acronym or domain-specific jargon is used, spell it out or provide a definition. Maintain a glossary of terms if necessary, possibly within the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md).  
* **Use Simple Language:** Write in plain English. Avoid complex sentence structures.  
* **Positive Phrasing:** State what the system *shall* do, not what it *shall not* do (unless absolutely necessary for negative constraints, e.g., "The system SHALL NOT store plain-text passwords.").  
  Bad Example: "The system shall be performant for users."  
  Good Example: "The system SHALL load the dashboard within 2 seconds for 90% of users under typical load conditions."

### **4.2. Conciseness**

* Get straight to the point. Remove introductory phrases and unnecessary words.  
* Each statement should convey a single thought.  
  Bad Example: "In the event that the user clicks the 'Login' button, assuming they have entered their credentials, the system should then proceed to authenticate them against the user database."  
  Good Example: "When a user submits valid login credentials, the system SHALL authenticate the user."

### **4.3. Completeness**

* Ensure enough information is present for a developer to implement and a tester to verify.  
* Include all relevant conditions, inputs, and expected outputs.

### **4.4. Consistency**

* Use consistent terminology throughout all requirements. For example, if you refer to "User ID" in one place, don't use "User Identifier" elsewhere.  
* Adhere strictly to the defined YAML front matter fields and their allowed values.

### **4.5. Verifiability/Testability**

* Every requirement MUST be verifiable. You must be able to prove that the system meets the requirement.  
* Quantify where possible: "The system SHALL encrypt data using AES-256 encryption."  
* Use Acceptance Criteria to define measurable conditions.

## **5\. Guidelines for Specific Content Types**

### **5.1. Functional Requirements**

* Focus on what the system *does*.  
* Often expressed as user stories or "The system SHALL..." statements.  
* Use Given/When/Then (GWT) format for acceptance criteria to ensure testability.

### **5.2. Non-Functional Requirements**

* Describe system qualities (e.g., performance, security, usability, reliability, scalability).  
* MUST be measurable.  
  * **Performance:** "The system SHALL respond to search queries within 500ms for 99% of requests."  
  * **Security:** "The system SHALL comply with OWASP Top 10 security guidelines."  
  * **Availability:** "The system SHALL be available 99.9% of the time, excluding planned maintenance."

### **5.3. UI/UX Requirements**

* Describe the user interface and user experience aspects.  
* Can include details on layout, navigation, visual design, and interaction flows.  
* Often supported by wireframes, mockups, or design specifications linked in the attachments section.

### **5.4. Links and Traceability (Including SysML)**

* **Purpose:** Explicitly define relationships between requirements and other artifacts (e.g., parent epics, child requirements, test cases, design documents, risks, **SysML elements**). This directly supports the "Traceability" principle in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#2-guiding-principles) and facilitates SysML model generation.  
* **Relationship Types:** Be consistent with the type field in the links array. This list is extensible:  
  * implements: This requirement implements a higher-level epic or feature.  
  * depends\_on: This requirement cannot be implemented without another specific item being in place.  
  * traces\_to\_test: Links to a specific test case that verifies this requirement.  
  * parent\_of: This requirement is a parent to listed child requirements.  
  * related\_to: A general link to a related document or artifact.  
  * verifies: (For test cases) Links to a requirement it verifies.  
  * **refines**: This requirement provides more detail for a higher-level requirement. (SysML refine relationship).  
  * **satisfies**: This requirement is satisfied by a design element (e.g., a SysML Block). (SysML satisfy relationship).  
  * **allocates**: This requirement is allocated to a specific system component or activity (e.g., a SysML Block). (SysML allocate relationship).  
  * **deriveReqt**: This requirement is derived from another requirement. (SysML deriveReqt relationship).  
* **Target IDs:** Ensure target IDs are precise and, where applicable, follow the ID conventions of the linked artifact (e.g., a Jira ticket ID, a test management system ID, another requirement's ID, or a **SysML Block ID**).

### **5.5. Custom Attributes (Including SysML-Specific Metadata)**

* **Purpose:** The YAML front matter allows for flexible, project-specific metadata. These attributes are stored in the attributes table in the SQLite database and are crucial for enriching SysML models.  
* **Naming:** Use snake\_case for attribute keys (e.g., business\_value, verification\_method).  
* **Consistency:** Once an attribute is introduced, strive to use it consistently across relevant requirements.  
* **SysML-Specific Attributes:**  
  * **source (TEXT):** Origin of the requirement (e.g., "Customer Interview Log \#2025-03-15", "ISO 26262 Part 3").  
  * **stakeholder (TEXT):** Key person or role requesting/owning this requirement (e.g., "Product Marketing Lead", "Safety Engineer").  
  * **verification\_method (TEXT):** How this requirement will be verified. Recommended values: "Test", "Inspection", "Analysis", "Demonstration". (This maps to the method property of a SysML verify relationship).  
  * **allocated\_to (ARRAY of TEXT):** A list of IDs of SysML Blocks or other system elements to which this requirement is allocated. (This maps to the SysML allocate relationship).

## **6\. Review Process**

* All new or significantly changed requirements MUST go through a peer review process via GitHub Pull Requests (PRs). This process is integral to the "Collaboration and Review" stage of the requirements life cycle in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#42-collaboration-and-review).  
* Reviewers should check for adherence to this style guide, clarity, completeness, verifiability, and necessity.  
* Automated checks (linters, schema validation) may be integrated into CI/CD to enforce some aspects of this guide.

### **6.1. Review Checklist**

When reviewing a requirement, consider the following:

* **Format:**  
  * Does it start with valid YAML front matter delimited by \---?  
  * Is the H1 heading present and does it match the id and name from the front matter?  
  * Are YAML fields (id, name, type, priority, status, tags, links, source, stakeholder, verification\_method, allocated\_to) correctly filled and properly formatted?  
  * Are custom attributes consistently named and used?  
* **Content:**  
  * **Clarity:** Is the requirement easy to understand? Are ambiguous terms replaced with measurable ones? Is jargon defined?  
  * **Conciseness:** Is the requirement free of unnecessary words or phrases? Does each statement convey a single idea?  
  * **Completeness:** Does it contain all necessary information for implementation and testing? Are all preconditions, actions, and expected outcomes clear?  
  * **Consistency:** Is terminology used consistently with other requirements and the glossary?  
  * **Unambiguity:** Does it have only one interpretation?  
  * **Verifiability/Testability:** Are there clear acceptance criteria? Can it be tested or demonstrated? Are measurable quantities specified where appropriate?  
  * **Feasibility:** Can it be implemented within known project constraints?  
  * **Necessity:** Does it add clear value to the product or system?  
  * **Imperative Language:** Are SHALL, SHOULD, MAY used correctly?  
* **Traceability:**  
  * Are relevant links provided to parent epics, related requirements, test cases, or **SysML elements**?  
  * Are link\_type and target correctly specified for each link, including new SysML relationship types?  
  * Is the id unique across all requirements?

## **7\. ID Naming Convention**

The id field in the YAML front matter is critical for unique identification, traceability, and database indexing. A consistent naming convention is crucial. This convention directly informs the id field in the requirements table of the SQLite database, as detailed in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#51-table-requirements).

**General Format:** \[PROJECT\_CODE\]-\[TYPE\]-\[SUBTYPE\]-\[FUNCTIONAL\_AREA\]-\[NNNNN\]

* **\[PROJECT\_CODE\] (Required):** A short, unique code for your project (e.g., PRODX, SRM).  
* **\[TYPE\] (Required):** Indicates the broad category of the requirement.  
  * REQ: General Requirement  
  * FNC: Functional Requirement  
  * NFR: Non-Functional Requirement  
  * UIX: UI/UX Requirement  
  * EPIC: Epic (higher-level grouping of features)  
  * STORY: User Story (if used in addition to general FNC)  
  * CON: Constraint  
  * BUS: Business Requirement  
  * SYS: System Requirement  
  * CS: CyberSecurity  
  * FS: Functional Safety  
  * PMP: Product Management  
  * QNR: Quality and Reliability  
  * SEC: Physical Security  
  * **BLK**: For SysML Blocks or other system elements (if managed as Markdown files).  
* **\[SUBTYPE\] (Optional, but Recommended for larger projects):** Further categorizes the requirement within its type.  
  * For FNC: AUTH (Authentication), ORD (Ordering), INV (Inventory), RPT (Reporting)  
  * For NFR: PERF (Performance), SEC (Security), USAB (Usability), SCAL (Scalability)  
  * For BLK: HW (Hardware), SW (Software), MECH (Mechanical), ELEC (Electrical)  
* **\[FUNCTIONAL\_AREA\] (Optional, but Recommended for modularity):** Identifies the specific module or functional area the requirement belongs to.  
  * LOGIN, DASH, CART, PAY, ADMIN  
  * For BLK: POWERMGMT, COMM, SENSORS  
* **\[NNNNN\] (Required):** A sequential five-digit number, padded with leading zeros, ensuring uniqueness within the defined prefix.

**Examples:**

* **Functional Requirement for Login:** PRODX-FNC-AUTH-LOGIN-00010  
* **Non-Functional Requirement for Performance (System-wide):** SRM-NFR-PERF-00001  
* **UI/UX Requirement for Dashboard Layout:** PRODX-UIX-DASH-00005  
* **Epic for User Management:** PRODX-EPIC-USERMGMT-00001  
* **SysML Block for Power Management Unit:** PRODX-BLK-HW-POWERMGMT-00001

**Rationale:**

* **Uniqueness:** Ensures each requirement (and now, potentially SysML blocks) has a distinct identifier, crucial for traceability and database operations.  
* **Readability:** The structured format makes it easy to understand the type and context of a requirement at a glance.  
* **Sortability:** Allows for logical grouping and sorting of requirements.  
* **Scalability:** Supports a growing number of requirements and projects.  
* **Machine-Processable:** Consistent IDs are easily parsed and used by the **Node.js application** for database population, linking, and **SysML generation**.

## **8\. Tooling Integration**

This style guide is designed to complement our "Docs as Code" tooling:

* **Markdown Structure:** Directly parsed by the **Node.js application**. The implementation details for this parsing are in the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md\#51-nodejs-project-setup).  
* **YAML Front Matter:** Essential for database population and metadata extraction. Strict adherence ensures correct data ingestion, populating the schema defined in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#5-database-schema-design-for-sqlite). This is now also critical for providing data to the **SysML generation process**.  
* **id and links:** Critical for building the relationships table and enabling traceability queries, as described in the \[Requirements Management Plan\](uploaded:Requirements Management Plan.md\#44-traceability-management). These are also directly used for creating SysML relationships.  
* **GitHub Actions:** Automate the parsing and database updates, ensuring that any deviations from this style guide (that cause parsing errors) are caught early. The workflow setup is detailed in the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md\#52-github-actions-workflow-details). This also triggers the **SysML model generation**.