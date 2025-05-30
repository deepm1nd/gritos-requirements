# **Requirements Management Plan: Docs as Code (Markdown, GitHub, SQLite, SysML)**

## **1\. Introduction**

This document outlines the strategy and processes for managing product requirements using a **"Docs as Code"** approach. This method leverages **plain Markdown files** for requirements documentation, **Git and GitHub** for version control and collaboration, and a **SQLite database** for structured querying and reporting. It is now enhanced with capabilities for seamless **SysML (Systems Modeling Language) integration**, versioning, **Change Management**, and **Configuration Management**. The core logic for parsing and database interaction, as well as the SysML model generation, will be implemented in **Node.js (JavaScript)**. For detailed setup and practical steps, refer to the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md).

## **2\. Guiding Principles**

* **Single Source of Truth:** All requirements are defined and maintained as plain Markdown files in a Git repository. These files are the authoritative source for content and granular history.  
* **Version Control:** Every change to a requirement file is tracked in Git, providing a full audit trail and the ability to revert to any previous state. The database complements this by allowing structured querying of current and baselined versions.  
* **Collaboration:** Standard Git workflows (branching, pull requests, code reviews) facilitate team collaboration and consensus building on requirement changes.  
* **Automation:** Automated processes, powered by **Node.js**, handle documentation generation, validation, data extraction into a structured database, and **SysML model generation**. For the technical implementation of these automated processes, see the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md).  
* **Model-Driven Development Support:** Requirements are structured and processed to facilitate direct translation into formal system models using SysML, enabling deeper analysis, design, and verification.  
* **Traceability:** Explicit links between requirements and other artifacts (including SysML elements like Blocks) ensure end-to-end understanding and impact analysis, with traceability maintained across versions.  
* **Transparency:** Requirements are easily accessible, readable, and auditable by all stakeholders.  
* **Clarity and Quality:** Adherence to specific writing conventions ensures requirements are clear, concise, and unambiguous. See the \[Requirements Style Guide\](uploaded:Requirements Style Guide.md) for detailed guidelines.

## **3\. Tooling and Technologies**

* **Markdown (.md):** Lightweight, human-readable syntax for writing requirements.  
* **Git:** Distributed version control system for tracking changes.  
* **GitHub:** Cloud-based platform for hosting Git repositories, facilitating collaboration via Pull Requests, and enabling automation via GitHub Actions and **GitHub APIs**.  
* **Node.js (JavaScript):** The runtime environment and language used for implementing the custom parsers, database interaction, the backend logic for the web UI, and the **SysML model generation scripts**.  
* **SQLite:** An embedded, file-based relational database used to store structured metadata extracted from Markdown files for efficient querying and reporting. This database is a derived artifact, not the primary source of truth, but provides essential structured views for current data and baselines.  
* **SysML Modeling Tool (External):** A dedicated SysML tool (e.g., Cameo Systems Modeler, Enterprise Architect) will be used to import and visualize the generated SysML models (typically via XMI/ReqIF files). Refer to the \[SysML Integration Guide\](uploaded:SysML Integration Guide.md) for more details.  
* **Datasette (Optional but Recommended):** A Free and Open Source Software (FOSS) tool to instantly publish SQLite databases as browsable websites and APIs, providing a web-based interface for the structured requirements data. For setup instructions, refer to the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md).  
* **MkDocs (Optional for HTML Rendering):** A simple static site generator that can build user-friendly HTML documentation from your Markdown files, suitable for hosting on GitHub Pages. (Note: MkDocs is Python-based, but operates on Markdown files, making it compatible with a Node.js backend for data processing). For setup instructions, refer to the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md).

## **4\. Requirements Life Cycle Process**

The requirements life cycle within this framework encompasses the following stages:

### **4.1. Requirements Authoring and Initial Draft**

* **Process:** Requirements are authored directly in Markdown files using a text editor or IDE (e.g., VS Code). The \[Requirements Management WebUI Development Plan\](uploaded:Requirements Management WebUI Development Plan.md) details the web-based UI for intuitive authoring, including support for SysML-related metadata.  
* **Tools:** Markdown, Git, Text Editor/IDE, Requirements WebUI.  
* **Output:** New .md files with YAML front matter in the requirements/ directory.

### **4.2. Version Control and Collaboration**

* **Process:** Authors commit new or changed .md files to a Git branch. A Pull Request (PR) is opened for review.  
* **Tools:** Git, GitHub.  
* **Output:** Git commits, Pull Requests.

### **4.3. Automated Parsing and Database Population**

* **Process:** Upon a PR merge to main (or specific branches), a GitHub Action workflow is triggered. This workflow executes the **Node.js application** which:  
  1. Parses all Markdown requirement files, including new SysML-specific YAML fields.  
  2. Extracts structured metadata from the YAML front matter.  
  3. Populates/updates the SQLite database (requirements.sqlite) with requirement details, relationships, and attributes.  
  4. **Generates SysML models (XMI/ReqIF) based on the enriched database content.**  
* **Tools:** GitHub Actions, Node.js application (parser and SysML generator), SQLite.  
* **Output:** Updated requirements.sqlite database, generated SysML model files, potentially static HTML documentation.

### **4.4. Traceability Management**

* **Process:** Traceability links are explicitly defined in the YAML front matter of requirement files (e.g., links: \- type: implements, target: FEAT-001). These links are parsed and stored in the SQLite database, enabling queries for end-to-end traceability. This includes links to other requirements, test cases, and now, **SysML blocks or other model elements (e.g., using** allocated\_to **or** satisfies **relationship types)**.  
* **Tools:** Markdown (YAML front matter), Node.js application, SQLite.  
* **Output:** Traceability matrix within the SQLite database.

### **4.5. Baselines and Versioning**

* **Process:** Baselines are created by tagging specific Git commits (e.g., v1.0.0-release). The requirements.sqlite database can be configured to store historical snapshots, allowing queries against specific baselined versions of requirements.  
* **Tools:** Git Tags, GitHub, Node.js application, SQLite.  
* **Output:** Git tags, historical data in SQLite.

### **4.6. Reporting and Analysis**

* **Process:** Stakeholders can query the SQLite database directly (e.g., via Datasette, SQL clients) or use generated reports to analyze requirement status, completeness, traceability, and changes between versions. **Generated SysML models provide a formal view for system analysis and can be imported into dedicated SysML Modeling Tools for further visualization and simulation.**  
* **Tools:** SQLite, Datasette, BI Tools (optional), **SysML Modeling Tools**.  
* **Output:** Custom queries, dashboards, visual SysML models.

### **4.7. Change Management**

* **Process:** All changes to requirements follow the Git Pull Request workflow. This ensures that changes are reviewed, discussed, approved, and version-controlled. The web UI facilitates this by automating PR creation.  
* **Tools:** Git, GitHub, Requirements WebUI.  
* **Output:** Approved Pull Requests, Git commit history.

### **4.8. Configuration Management**

* **Process:** The entire requirements ecosystem (Markdown files, Node.js application source code, GitHub Actions workflow definitions, mkdocs.yml, **Node.js backend, Preact frontend, SysML generation scripts**) is **version-controlled** within the same Git repository.  
* **Tools:** Git, GitHub.  
* **Output:** Version-controlled repository.

## **5\. Database Schema Design for SQLite**

The requirements.sqlite database will store structured data extracted from the Markdown files. Key tables include:

* **requirements table:**  
  * id (TEXT PRIMARY KEY): Unique identifier for the requirement (e.g., PRODX-REQ-FNC-AUTH-LOGIN-00010).  
  * name (TEXT): A brief, descriptive name.  
  * description\_md (TEXT): The full Markdown content of the requirement.  
  * type (TEXT): e.g., Functional, Non-Functional, UI/UX, CS, FS, PMP, QNR, SEC, EPIC, STORY, CON, BUS, SYS.  
  * priority (TEXT): e.g., High, Medium, Low.  
  * status (TEXT): e.g., Draft, Approved, Implemented, Verified, Rejected.  
  * file\_path (TEXT): Path to the original Markdown file.  
  * git\_sha (TEXT): Git commit SHA when the requirement was last updated (for baselining).  
  * last\_updated (TEXT): Timestamp of the last update.  
* **relationships table:**  
  * source\_req\_id (TEXT): ID of the requirement initiating the link.  
  * target\_id (TEXT): ID of the linked artifact (can be another requirement, test case, **SysML block ID**, etc.).  
  * relationship\_type (TEXT): e.g., implements, depends\_on, traces\_to\_test, parent\_of, refines, satisfies, allocates, related\_to.  
* **tags table:**  
  * req\_id (TEXT): ID of the requirement.  
  * tag (TEXT): A descriptive tag (e.g., security, performance, backend).  
* **attributes table (for custom YAML fields and SysML-specific data):**  
  * req\_id (TEXT): ID of the requirement.  
  * attribute\_name (TEXT): Name of the custom attribute (e.g., owner, release\_target, **source**, **stakeholder**, **verification\_method**, **allocated\_to**).  
  * attribute\_value (TEXT): Value of the custom attribute.

## **6\. Versioning Strategy**

* **Git Branches:** Feature branches for ongoing development, main branch for stable/released versions.  
* **Git Tags:** Use semantic versioning (e.g., v1.0.0) to tag stable baselines of the requirements repository.  
* **Database Versioning:** The git\_sha field in the requirements table allows querying requirements as they existed at any specific commit, enabling historical analysis and auditing. A dedicated baselines table could store specific SHA hashes for formal releases.

## **7\. Change and Configuration Management**

* **Pull Request Workflow:** All changes to requirement Markdown files (including those initiated from the WebUI) MUST go through a GitHub Pull Request (PR) review process.  
* **Approval Process:** Define required approvals (e.g., Product Owner, Architect) before a PR can be merged into main.  
* **Automated Checks:** GitHub Actions workflows will include automated checks for Markdown syntax, YAML front matter correctness, ID uniqueness, and valid internal/external links.  
* **Auditing:** The complete Git history provides a transparent audit trail of all changes, when they were made, and by whom. The database captures the parsed state at specific commits.  
* **Consistency:** The entire requirements ecosystem (Markdown files, Node.js application source code, GitHub Actions workflow definitions, mkdocs.yml, **Node.js backend, Preact frontend, SysML generation scripts**) is also **version-controlled** within the same Git repository.  
* Changes to the requirements management process itself (as defined in this plan) should also follow a PR workflow, ensuring transparency and consensus. Regularly review the effectiveness of the Change and Configuration Management processes and adapt as needed.

## **8\. Training and Adoption**

* Provide comprehensive training on Markdown syntax, Git workflows, the specific tooling used (GitHub, the **Node.js application**, Datasette, **SysML Modeling Tools**, Requirements WebUI). Practical setup and usage of these tools are covered in the \[Requirements Management Implementation Guide\](uploaded:Requirements Management Implementation Guide.md) and the new [Requirements Management WebUI Implementation Guide](#bookmark=id.jgbej6blfvd).  
* Emphasize the benefits of the "Docs as Code" approach in terms of collaboration, transparency, and efficiency to foster team buy-in. Ensure all stakeholders understand their roles and responsibilities within the defined Change and Configuration Management processes.

## **9\. Future Enhancements (Roadmap)**

* Deeper integration with external tools (e.g., Jira, dedicated test management systems) via their APIs, potentially pushing/pulling data based on changes to the SQLite database.  
* More sophisticated reporting dashboards built on top of the SQLite data, possibly using dedicated BI tools.  
* Automated consistency checks within the GitHub Actions workflow (e.g., orphaned requirements, broken internal links, adherence to ID patterns).  
* Improved visualization of traceability graphs and dependencies using generated tools.  
* Exploring automated change impact analysis based on established traceability links.